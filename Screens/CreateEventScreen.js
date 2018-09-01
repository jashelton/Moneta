import React from 'react';
import { View, Text, ScrollView, TouchableHighlight, Image, StyleSheet, Switch, Modal, Dimensions, Linking, Alert } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { RNS3 } from 'react-native-aws3';
import { AdMobInterstitial, Haptic, Constants } from 'expo';
import { FULL_SCREEN_AD_UNIT } from 'react-native-dotenv';
import { createEvent, clearErrors } from '../reducer'
import { connect } from 'react-redux';
import SnackBar from 'react-native-snackbar-component'

import { authHelper, LocationHelper, commonHelper } from '../Helpers';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import ViewToggle from '../Components/ViewToggle';
import GooglePlacesInput from '../Components/LocationAutocomplete';
import { DIVIDER_COLOR, PRIMARY_DARK_COLOR, TEXT_ICONS_COLOR } from '../common/styles/common-styles';

const initialEvent = {
  title: '',
  description: '',
  localImage: null,
  eventPrivacy: 'Public',
  imageLocation: '',
  imageCoords: null,
  addressInfo: null,
  isLocationDisabled: false,
  randomizeLocation: false
};

class CreateEventScreen extends React.Component {
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
          disabled={navigation.getParam('isDisabled')}
          disabledTitleStyle={{ color: DIVIDER_COLOR }}
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
      visiblePlacesSearch: false,
      isCreateDisabled: false,
    };

    this.clearEvent = this.clearEvent.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.prepS3Upload = this.prepS3Upload.bind(this);
    this.customImageLocation = this.customImageLocation.bind(this);
  }

  async componentDidMount() {
    if (! await this.checkLocation()) this.locationDisabledAlert();
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

  locationDisabledAlert() {
    Alert.alert(
      'Geolocation Disabled',
      'Please enable location in settings.',
      [
        { text: 'Settings', onPress: () =>  Linking.openURL('app-settings:')},
        { text: 'Cancel', onPress: () => this.setState({ isLocationDisabled: true }) }
      ]
    );
  }

  clearEvent() {
    let { eventForm } = this.state;
    eventForm.localImage = null;
    eventForm.randomizeLocation = false;
    eventForm = initialEvent;

    this.setState({ eventForm, imageFile: null });
  }

  updatePrivacySettings(val) {
    const { eventForm } = this.state;
    eventForm.eventPrivacy = val ? 'Public' : 'Private';

    this.setState({eventForm});
  }

  updateRandomizeLocationState(value) {
    let { eventForm } = this.state;

    eventForm.randomizeLocation = value;
    this.setState({ eventForm });
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}_${now}`;
  }

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    const result = await commonHelper.selectImage(true);

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

        const { eventForm } = this.state;
        eventForm.imageLocation = imageLocation;
        eventForm.imageCoords = imageCoords;
        eventForm.addressInfo = address[0];
      } else {
        eventForm.imageLocation = '';
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

  async createEvent() {
    this.checkLocation();
    this.setState({ isCreateDisabled: true }); // Prevent dupe insert

    let { imageFile, eventForm, isCreateDisabled } = this.state;
    const { title, description, eventPrivacy, imageLocation, imageCoords, addressInfo, randomizeLocation } = this.state.eventForm;

    if (!isCreateDisabled) {
      if (title === '' || description === '' || imageLocation === '' || !imageCoords || title.length > 60 || description.length > 140) {
        alert('You must include a valid Title, Description, and Image');
        return;
      }

      const event = {
        title,
        description,
        privacy: eventPrivacy,
        city: addressInfo.city,
        region: addressInfo.region,
        country_code: addressInfo.isoCountryCode,
        coordinate: randomizeLocation ? LocationHelper.generateRandomPoint(imageCoords, 2500) : imageCoords
      };

      try {
        const s3Upload = await RNS3.put(imageFile, this.options);
        event.image = s3Upload.body.postResponse;

        const response = await this.props.createEvent(event);
        if (response.error) throw (response.error);

        eventForm = initialEvent;
        eventForm.imageLocation = '';
        eventForm.imageCoords = null;
        imageFile = null;
        this.setState({ eventForm, imageFile });

        Haptic.notification(Haptic.NotificationTypes.Success);
        this.displayAd();
      } catch (err) {
        throw(err);
      }
    }
    
    this.setState({ isCreateDisabled: false });
  }

  async displayAd() {
    AdMobInterstitial.setAdUnitID(process.env.NODE_ENV === 'development' ? 'ca-app-pub-3940256099942544/1033173712' : FULL_SCREEN_AD_UNIT);
    AdMobInterstitial.setTestDeviceID('EMULATOR');
    await AdMobInterstitial.requestAdAsync();
    await AdMobInterstitial.showAdAsync();
  }

  render() {
    const { localImage,
            title,
            description,
            eventPrivacy,
            imageLocation,
            randomizeLocation,
            imageCoords } = this.state.eventForm;
    const { visiblePlacesSearch, isLocationDisabled } = this.state;
    return(
      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={{padding: 15, backgroundColor: '#fff'}}>
          <View style={styles.eventPrivacyContainer}>
            <Text>Create event as: {eventPrivacy}</Text>
            <Switch
              value={eventPrivacy === 'Public' ? true : false}
              onValueChange={(value) => this.updatePrivacySettings(value)}
            />
          </View>
          <View style={styles.eventPrivacyContainer}>
            <Text>Randomize location within radius nearby?</Text>
            <Switch
              value={randomizeLocation ? true : false}
              onValueChange={(value) => this.updateRandomizeLocationState(value)}
            />
          </View>
          <TextField
            label='Title'
            value={title}
            disabled={isLocationDisabled}
            onChangeText={(title) => this.setState({ eventForm: { ...this.state.eventForm, title } }) }
            characterRestriction={60}
          />
          <TextField
            value={description}
            onChangeText={(description) => this.setState({ eventForm: { ...this.state.eventForm, description } })}
            returnKeyType='next'
            multiline={true}
            blurOnSubmit={true}
            disabled={isLocationDisabled}
            label='Description'
            characterRestriction={140}
          />
          <ViewToggle hide={!localImage}>
            <TextField
              label='Event Location'
              baseColor={!imageCoords ? 'red' : 'green'}
              value={imageLocation}
              disabled={isLocationDisabled}
              onFocus={() => this.setState({visiblePlacesSearch: true})}
            />
          </ViewToggle>
          <TouchableHighlight disabled={isLocationDisabled} underlayColor="#eee" style={styles.imageUpload} onPress={this.prepS3Upload}>
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
            onRequestClose={() => this.setState({ visiblePlacesSearch: false })}
          >
            <View style={styles.modalHeader}>
              <View style={{flex: 1}}></View>
              <Button
                clear
                title='Cancel'
                titleStyle={{color: TEXT_ICONS_COLOR}}
                buttonStyle={{marginRight: 15}}
                onPress={() => this.setState({ visiblePlacesSearch: false })}
              />
            </View>
            <GooglePlacesInput customImageLocation={(data, details) => this.customImageLocation(data, details)} />
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
  eventPrivacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10
  },
  imageUpload: {
    width: '100%',
    height: Dimensions.get('window').height / 2,
    backgroundColor: '#eee',
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: Dimensions.get('window').height / 2,
    borderRadius: 3
  },
  modalHeader: {
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = {
  createEvent,
  clearErrors
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEventScreen);