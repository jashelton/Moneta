import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Image,
  StyleSheet,
  Switch,
  Modal,
  Dimensions
} from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { Icon, Button } from "react-native-elements";
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
import ViewToggle from "../Components/ViewToggle";
import GooglePlacesInput from "../Components/LocationAutocomplete";
import {
  DIVIDER_COLOR,
  PRIMARY_DARK_COLOR,
  TEXT_ICONS_COLOR
} from "../common/styles/common-styles";
import { graphql } from "react-apollo";
import {
  CREATE_MOMENT,
  ALL_EVENTS_QUERY,
  MAP_MARKERS
} from "../graphql/queries";

const initialEvent = {
  title: "",
  description: "",
  localImage: null,
  imageLocation: "",
  imageCoords: null,
  addressInfo: null,
  randomizeLocation: false
};

class CreateMomentScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Create Moment",
      // headerLeft: (
      //   <Button
      //     containerStyle={styles.leftIcon}
      //     clear
      //     title='Clear'
      //     titleStyle={{color: 'blue'}}
      //     onPress={navigation.getParam('clearEvent')}
      //   />
      // ),
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
      loading: false
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
      clearEvent: () => this.clearEvent(),
      createEvent: () => this.createEvent(),
      isDisabled: this.state.isCreateDisabled
    });
  }

  async checkLocation() {
    return await LocationHelper.getCurrentLocation();
  }

  clearEvent() {
    let { eventForm } = this.state;
    eventForm = initialEvent;

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

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    const result = await commonHelper.selectImage(true);

    if (!result.cancelled) {
      const { imageFile, eventForm } = this.state;

      imageFile = {
        uri: result.uri,
        name: this.createDateString(),
        type: result.type
      }; // Required fields for S3 upload
      eventForm.localImage = result; // Path to image to display to user before S3 upload

      this.setState({ imageFile, eventForm });

      // For images that have location data associated with them via exif.
      if (result.exif.GPSLatitude && result.exif.GPSLongitude) {
        const imageCoords = LocationHelper.formatExifCoords(result.exif);
        const address = await LocationHelper.coordsToAddress(imageCoords);
        const imageLocation = `${address[0].name}, ${address[0].city ||
          null}, ${address[0].region}, ${address[0].isoCountryCode}`;
        const { eventForm } = this.state;

        eventForm.imageLocation = imageLocation;
        eventForm.imageCoords = imageCoords;
        eventForm.addressInfo = address[0];
      } else {
        eventForm.imageLocation = "";
        eventForm.imageCoords = null;
      }

      this.setState({ eventForm });
    }
  }

  // Custom location selection.  Get address and coords.
  async customImageLocation(data, details) {
    const { location } = details.geometry;
    const { description } = data;
    let { eventForm } = this.state;

    eventForm.imageCoords = { latitude: location.lat, longitude: location.lng };
    const address = await LocationHelper.coordsToAddress(eventForm.imageCoords);

    eventForm.imageLocation = description;
    eventForm.addressInfo = address[0];

    this.setState({ eventForm, visiblePlacesSearch: false });
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

  async createEvent() {
    this.setState({ isCreateDisabled: true, loading: true });
    this.checkLocation();

    let { imageFile, isCreateDisabled } = this.state;
    const {
      title,
      description,
      imageLocation,
      imageCoords,
      addressInfo,
      randomizeLocation
    } = this.state.eventForm;

    if (!isCreateDisabled) {
      if (
        description === "" ||
        imageLocation === "" ||
        !imageCoords ||
        title.length > 60
      ) {
        alert("You must include a valid Description, and Image");
        this.setState({ isCreateDisabled: false, loading: false });
        return;
      }

      const { latitude, longitude } = randomizeLocation
        ? LocationHelper.generateRandomPoint(imageCoords, 2500)
        : imageCoords;

      const event = {
        title,
        description,
        city: addressInfo.city,
        region: addressInfo.region,
        country_code: addressInfo.isoCountryCode,
        latitude,
        longitude
      };

      try {
        const s3Upload = await RNS3.put(imageFile, this.options);
        event.image = s3Upload.body.postResponse.location;

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

  render() {
    const {
      localImage,
      title,
      description,
      imageLocation,
      randomizeLocation,
      imageCoords
    } = this.state.eventForm;
    const { visiblePlacesSearch, loading } = this.state;
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
          <ViewToggle hide={!localImage}>
            <TextField
              label="Event Location"
              baseColor={!imageCoords ? "red" : "green"}
              value={imageLocation}
              onFocus={() => this.setState({ visiblePlacesSearch: true })}
            />
          </ViewToggle>
          <TouchableHighlight
            underlayColor="#eee"
            style={styles.imageUpload}
            onPress={this.prepS3Upload}
          >
            {!localImage ? (
              <Icon style={styles.iconBtn} color="#d0d0d0" name="add-a-photo" />
            ) : (
              <Image
                style={styles.uploadedImage}
                source={{ uri: localImage.uri }}
              />
            )}
          </TouchableHighlight>
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
