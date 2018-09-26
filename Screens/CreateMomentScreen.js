import React from "react";
import { graphql } from "react-apollo";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
  Dimensions
} from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { Button } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { RNS3 } from "react-native-aws3";
import { Haptic, Constants } from "expo";
import SnackBar from "react-native-snackbar-component";
import { authHelper, LocationHelper, commonHelper, adHelper } from "../Helpers";
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  BUCKET,
  BUCKET_REGION
} from "react-native-dotenv";
import {
  DIVIDER_COLOR,
  PRIMARY_DARK_COLOR,
  TEXT_ICONS_COLOR
} from "../common/styles/common-styles";
import {
  CREATE_MOMENT,
  ALL_EVENTS_QUERY,
  MAP_MARKERS
} from "../graphql/queries";
import ViewToggle from "../Components/ViewToggle";
import GooglePlacesInput from "../Components/LocationAutocomplete";
import ImageSelectionComponent from "../Components/ImageSelectionComponent";

const initialEvent = {
  title: "",
  description: "",
  imageLocation: "",
  randomizeLocation: false
};

const selectedEventLocation = {
  coords: null,
  address: null,
  location: ""
};

class CreateMomentScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Create Moment",
      headerRight: (
        <Button
          containerStyle={styles.rightIcon}
          clear
          title="Done"
          titleStyle={{ color: "blue" }}
          disabled={navigation.getParam("isDisabled")}
          disabledTitleStyle={{ color: DIVIDER_COLOR }}
          onPress={navigation.getParam("createEvent")}
        />
      )
    };
  };

  options = {
    keyPrefix: "",
    bucket: BUCKET,
    region: BUCKET_REGION,
    accessKey: AWS_ACCESS_KEY,
    secretKey: AWS_SECRET_ACCESS_KEY,
    successActionStatus: 201
  };

  constructor(props) {
    super(props);

    this.state = {
      eventForm: initialEvent,
      imageFile: null,
      visiblePlacesSearch: false,
      isCreateDisabled: false,
      loading: false,
      localImages: [],
      selectedEventLocation
    };

    this.clearEvent = this.clearEvent.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.prepS3Upload = this.prepS3Upload.bind(this);
    this.customImageLocation = this.customImageLocation.bind(this);
  }

  async componentDidMount() {
    const user_data = await authHelper.getParsedUserData();
    this.options.keyPrefix = `user_${user_data.id}/`;

    this.props.navigation.setParams({
      createEvent: () => this.createEvent(),
      isDisabled: this.state.isCreateDisabled
    });
  }

  async checkLocation() {
    return await LocationHelper.getCurrentLocation();
  }

  clearEvent() {
    let { eventForm, selectedEventLocation } = this.state;
    eventForm = initialEvent;
    selectedEventLocation.coords = null;
    selectedEventLocation.address = null;
    selectedEventLocation.location = "";

    this.setState({ eventForm, imageFile: null });
  }

  updateRandomizeLocationState(value) {
    let { eventForm } = this.state;

    eventForm.randomizeLocation = value;
    this.setState({ eventForm });
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() +
      1}-${time.getDate()}_${now}`;
  }

  // Custom location selection.  Get address and coords.
  async customImageLocation(data, details) {
    const { location } = details.geometry;
    const { description } = data;
    let { selectedEventLocation } = this.state;

    selectedEventLocation.coords = {
      latitude: location.lat,
      longitude: location.lng
    };
    const address = await LocationHelper.coordsToAddress(
      selectedEventLocation.coords
    );

    selectedEventLocation.location = description;
    selectedEventLocation.address = address[0];

    this.setState({ visiblePlacesSearch: false });
  }

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    const result = await commonHelper.selectImage(true);
    const { localImages, selectedEventLocation } = this.state;
    const image = {
      s3: {},
      data: {}
    };

    if (result.cancelled) return;

    image.s3.uri = result.uri;
    image.s3.name = this.createDateString();
    image.s3.type = result.type;

    // For images that have location data associated with them via exif.
    if (result.exif.GPSLatitude && result.exif.GPSLongitude) {
      const imageCoords = LocationHelper.formatExifCoords(result.exif);
      const address = await LocationHelper.coordsToAddress(imageCoords);
      const imageLocation = `${address[0].name}, ${address[0].city || null}, ${
        address[0].region
      }, ${address[0].isoCountryCode}`;

      image.data.imageLocation = imageLocation;
      image.data.imageCoords = imageCoords;
      image.data.addressInfo = address[0];

      if (!selectedEventLocation.coords || !selectedEventLocation.location) {
        selectedEventLocation.coords = imageCoords;
        selectedEventLocation.location = imageLocation;
        selectedEventLocation.address = address[0];
      }
    } else {
      image.data.imageLocation = "";
      image.data.imageCoords = null;
    }

    localImages.push(image);
    this.setState({ localImages, selectedEventLocation });
  }

  async createEvent() {
    this.setState({ isCreateDisabled: true, loading: true });

    let { isCreateDisabled, localImages } = this.state;
    const { coords, location, address } = this.state.selectedEventLocation;
    const { title, description, randomizeLocation } = this.state.eventForm;

    if (!isCreateDisabled) {
      if (
        description === "" ||
        location === "" ||
        !coords ||
        title.length > 60
      ) {
        alert("You must include a valid Description, and Image");
        this.setState({ isCreateDisabled: false, loading: false });
        return;
      }

      const { latitude, longitude } = randomizeLocation
        ? LocationHelper.generateRandomPoint(coords, 2500)
        : coords;

      const event = {
        title,
        description,
        city: address.city,
        region: address.region,
        country_code: address.isoCountryCode,
        latitude,
        longitude,
        images: []
      };

      try {
        for (let i = 0; i < localImages.length; i++) {
          const s3Upload = await RNS3.put(localImages[i].s3, this.options);
          const imageData = {
            image: s3Upload.body.postResponse.location,
            ...localImages[i].data.imageCoords
          };

          event.images.push(imageData);
          if (i === 0) {
            event.image = s3Upload.body.postResponse.location; // Shouldn't need this.
          }
        }

        await this.props.mutate({
          CREATE_MOMENT,
          variables: { ...event },
          update: this.updateCache
        });

        this.clearEvent();

        Haptic.notification(Haptic.NotificationTypes.Success);
        this.props.navigation.goBack();
      } catch (err) {
        throw err;
      }
    }

    this.setState({ isCreateDisabled: false, loading: false });
  }

  updateCache = (store, { data: { createMoment } }) => {
    try {
      const { allEvents } = store.readQuery({
        query: ALL_EVENTS_QUERY,
        variables: { offset: 0 }
      });

      store.writeQuery({
        query: ALL_EVENTS_QUERY,
        variables: { offset: 0 },
        data: {
          allEvents: [createMoment, ...allEvents]
        }
      });
    } catch (err) {
      throw new Error(err);
    }

    try {
      const { allEvents } = store.readQuery({
        query: MAP_MARKERS,
        variables: { type: "moment" }
      });

      store.writeQuery({
        query: MAP_MARKERS,
        variables: { type: "moment" },
        data: {
          allEvents: [createMoment, ...allEvents]
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { title, description, randomizeLocation } = this.state.eventForm;
    const { visiblePlacesSearch, loading, localImages } = this.state;
    const { coords, location } = this.state.selectedEventLocation;
    if (loading)
      return (
        <View style={styles.loadingContainer}>
          <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
        </View>
      );
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 15, backgroundColor: "#fff" }}
        >
          <View style={styles.sliderContainer}>
            <Text>Randomize location within radius nearby?</Text>
            <Switch
              value={randomizeLocation ? true : false}
              onValueChange={value => this.updateRandomizeLocationState(value)}
            />
          </View>
          <TextField
            label="Title (optional)"
            value={title}
            onChangeText={title =>
              this.setState({ eventForm: { ...this.state.eventForm, title } })
            }
            characterRestriction={60}
          />
          <TextField
            value={description}
            onChangeText={description =>
              this.setState({
                eventForm: { ...this.state.eventForm, description }
              })
            }
            returnKeyType="next"
            multiline={true}
            blurOnSubmit={true}
            label="Description"
          />
          <ViewToggle hide={!localImages.length}>
            <TextField
              label="Event Location"
              baseColor={!coords ? "red" : "green"}
              value={location}
              onFocus={() => this.setState({ visiblePlacesSearch: true })}
            />
          </ViewToggle>
          <ImageSelectionComponent
            images={localImages}
            prepS3Upload={this.prepS3Upload}
          />
          <Modal
            animationType="slide"
            transparent={false}
            visible={visiblePlacesSearch}
            onRequestClose={() => this.setState({ visiblePlacesSearch: false })}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }} />
              <Button
                clear
                title="Cancel"
                titleStyle={{ color: TEXT_ICONS_COLOR }}
                buttonStyle={{ marginRight: 15 }}
                onPress={() => this.setState({ visiblePlacesSearch: false })}
              />
            </View>
            <GooglePlacesInput
              customImageLocation={(data, details) =>
                this.customImageLocation(data, details)
              }
            />
          </Modal>
        </ScrollView>

        <SnackBar
          visible={this.props.error ? true : false}
          textMessage={this.props.error}
          actionHandler={() => this.props.clearErrors()}
          actionText="close"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10
  },
  imageUpload: {
    width: "100%",
    height: Dimensions.get("window").height / 2,
    backgroundColor: "#eee",
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  uploadedImage: {
    width: "100%",
    height: Dimensions.get("window").height / 2,
    borderRadius: 3
  },
  modalHeader: {
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Constants.statusBarHeight
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default graphql(CREATE_MOMENT)(CreateMomentScreen);
