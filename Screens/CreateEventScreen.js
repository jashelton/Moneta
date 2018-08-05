import React from 'react';
import { ImagePicker, Permissions } from 'expo';
import { View, Text, ScrollView, TouchableHighlight, Image, StyleSheet, Switch, Modal } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { RNS3 } from 'react-native-aws3';

import { eventsService } from '../Services';
import { authHelper, LocationHelper } from '../Helpers';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import ViewToggle from '../Components/ViewToggle';
import GooglePlacesInput from '../Components/LocationAutocomplete';

const initialEvent = {
  title: '',
  description: '',
  localImage: null,
  eventPrivacy: 'Public',
  imageLocation: null,
  imageCoords: null
};

export default class CreateEventScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Event Map',
      headerLeft: (
        <Button
          containerStyle={styles.leftIcon}
          clear
          title='Clear'
          titleStyle={{color: 'blue'}}
          onPress={navigation.getParam('clearEvent')}
        />
      ),
      headerRight: (
        <Button
          containerStyle={styles.rightIcon}
          clear
          title='Done'
          titleStyle={{color: 'blue'}}
          onPress={navigation.getParam('createEvent')}
        />
      )
    }
  }

  options = {
    keyPrefix: '',
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
      visiblePlacesSearch: false
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
      createEvent: () => this.createEvent()
    });
  }

  clearEvent() {
    let { eventForm } = this.state;
    eventForm = initialEvent;

    this.setState({ eventForm, imageFile: null });
  }

  updatePrivacySettings(val) {
    const { eventForm } = this.state;
    eventForm.eventPrivacy = val ? 'Public' : 'Private';

    this.setState({eventForm});
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}_${now}`;
  }

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access camera roll was denied',
      });
    }

    const result = await ImagePicker.launchImageLibraryAsync({ // Require type image
      allowsEditing: true,
      aspect: [4, 3],
      exif: true
    });

    if (!result.cancelled) {
      const { imageFile, eventForm } = this.state;
      imageFile = { uri: result.uri, name: this.createDateString(), type: result.type }; // Required fields for S3 upload
      eventForm.localImage = result; // Path to image to display to user before S3 upload

      this.setState({ imageFile, eventForm });

      // For images that have location data associated with them via exif.
      if (result.exif.GPSLatitude && result.exif.GPSLongitude) {
        const imageCoords = LocationHelper.formatExifCoords(result.exif);
        const address = await LocationHelper.coordsToAddress(imageCoords);
        const imageLocation = `${address[0].name}, ${address[0].city}, ${address[0].region}, ${address[0].isoCountryCode}`

        this.setState({ imageLocation, imageCoords });
      }
    }
  }

  async createEvent() {
    const { imageFile, imageLocation, imageCoords } = this.state;
    const { title, description, eventPrivacy } = this.state.eventForm;

    if (title === '' || description === '' || !imageLocation || !imageCoords) {
      alert('You must include a Title and Description.  Also need a valid image.');
      return;
    }

    // TODO: This won't work with manually entered locations
    const event = {
      title,
      description,
      privacy: eventPrivacy,
      coordinate: imageCoords
    };

    try {
      const s3Upload = await RNS3.put(imageFile, this.options);
      event.image = s3Upload.body.postResponse;
      const { data } = await eventsService.createEvent(event);
      // TODO: dispatch action to add data.event to event markers

      this.setState({ eventForm: initialEvent });
    } catch (err) {
      console.log(err);
      return;
    }
    
  }

  // Custom location selection.  Get address and coords.
  customImageLocation(data, details) {
    const { location } = details.geometry;
    let { imageLocation, imageCoords } = this.state;

    imageLocation = data.description;
    imageCoords = { latitude: location.lat, longitude: location.lng };

    this.setState({ imageLocation, visiblePlacesSearch: false, imageCoords });
  }

  render() {
    const { localImage,
            title,
            description,
            eventPrivacy } = this.state.eventForm;
    const { visiblePlacesSearch, imageLocation, imageCoords } = this.state;
    return(
      <ScrollView contentContainerStyle={{flex: 1, flexDirection: 'column', padding: 15, backgroundColor: '#fff'}}>
        <View style={styles.eventPrivacyContainer}>
          <Text>Create event as: {eventPrivacy}</Text>
          <Switch
            value={eventPrivacy === 'Public' ? true : false}
            onValueChange={(value) => this.updatePrivacySettings(value)}
          />
        </View>
        <TextField
          label='Title'
          value={title}
          onChangeText={(title) => this.setState({ eventForm: { ...this.state.eventForm, title } }) }
        />
        <TextField
          value={description}
          onChangeText={(description) => this.setState({ eventForm: { ...this.state.eventForm, description } })}
          returnKeyType='next'
          multiline={true}
          blurOnSubmit={true}
          label='Description'
          characterRestriction={140}
        />
        <ViewToggle hide={!localImage}>
          <TextField
            label='Event Location'
            baseColor={!imageCoords ? 'red' : 'green'}
            value={imageLocation}
            onFocus={() => this.setState({visiblePlacesSearch: true})}
          />
        </ViewToggle>
        <TouchableHighlight underlayColor="#eee" style={styles.imageUpload} onPress={this.prepS3Upload}>
          { !localImage ?
            <Icon style={styles.iconBtn} color="#d0d0d0" name="add-a-photo" />
            :
            <Image style={styles.uploadedImage} source={{uri: localImage.uri}} />
          }
        </TouchableHighlight>
        <Modal
          animationType="slide"
          transparent={false}
          visible={visiblePlacesSearch}
        >
          <View style={{paddingTop: 60}}>
            <Button title="close" titleStyle={{color: 'blue'}} clear onPress={() => this.setState({ visiblePlacesSearch: false })} />
          </View>
          <GooglePlacesInput customImageLocation={(data, details) => this.customImageLocation(data, details)} />
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  eventPrivacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageUpload: {
    width: '100%',
    height: '50%',
    backgroundColor: '#eee',
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 3
  }
});