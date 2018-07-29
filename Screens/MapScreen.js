import React from 'react';
import MapView from 'react-native-maps';
import { ImagePicker, Permissions } from 'expo';
import { View, Text, ScrollView, TouchableHighlight, Image, StyleSheet, Modal, Switch } from 'react-native';
import { Icon, Button, ButtonGroup } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';

import { RNS3 } from 'react-native-aws3';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import { eventsService } from '../Services';
import { authHelper, LocationHelper } from '../Helpers';

export default class MapScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Event Map',
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="add"
          color="#fff"
          onPress={navigation.getParam('newMarker')}
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
      isVisible: false,
      selectedIndex: 0,
      markers: [],
      title: '',
      image: null,
      description: '',
      currentLocation: {},
      user_data: {},
      eventPrivacy: 'Public',
      filterOptions: ['All', 'Friends', 'Me']
    }

    this.newMarker = this.newMarker.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
  }

  async componentDidMount() {
    this.getEvents(this.state.selectedIndex);

    this.props.navigation.setParams({
      newMarker: () => this.newMarker()
    });

    const user_data = await authHelper.getParsedUserData();
    this.options.keyPrefix = `user_${user_data.id}/`;
    this.setState({user_data});
  }

  async getEvents(selectedIndex) {
    const { filterOptions } = this.state;
    const selectedFilter = filterOptions[selectedIndex];
    const { data } = await eventsService.getEvents(selectedFilter);
    let { markers } = this.state;
    markers = data;
    this.setState({markers});
  }

  async newMarker() {
    const currentLocation = await LocationHelper.getCurrentLocation();
    this.setState({currentLocation, isVisible: true});
  }

  async createEvent() {
    const { markers, title, description, image, currentLocation, eventPrivacy } = this.state;
    if (title === '' || description === '') {
      alert('You must include a Title and Description');
      return;
    }
    const event = {
      title,
      description,
      image,
      privacy: eventPrivacy,
      coordinate: currentLocation.coords
    };

    const { data } = await eventsService.createEvent(event);
    markers.push(data.event);
    this.setState({
      markers,
      isVisible: false,
      title: '',
      description: '',
      image: '',
      eventPrivacy: 'Public'
    });
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}_${now}`;
  }

  uploadImage = async() => {
    let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access camera roll was denied',
      });
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    if (!result.cancelled) {
      const file = { uri: result.uri, name: this.createDateString(), type: result.type };

      RNS3.put(file, this.options)
          .then(response => {
            if (response.status !== 201) {
              throw new Error("Failed to upload image.");
            };

            const image = response.body.postResponse;
            this.setState({ image });
          })
          .catch(err => console.log(err))
    }
  }

  updateIndex (selectedIndex) {
    this.setState({selectedIndex});
    this.getEvents(selectedIndex);
  }

  updatePrivacySettings(val) {
    const eventPrivacy = val ? 'Public' : 'Private' ;
    this.setState({eventPrivacy});
  }

  render() {
    const { selectedIndex, image, markers, isVisible, title, description, eventPrivacy, filterOptions } = this.state;

    return (
      <View style={styles.container}>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={selectedIndex}
          buttons={filterOptions}
        />
        <MapView
          style={{ flex: 1 }}
          showsUserLocation={true}
          showsPointsOfInterest={true}
          mapType="hybrid"
          initialRegion={{
            latitude: 35.9098794,
            longitude: -78.9127328,
            latitudeDelta: 0.0922, // lat and long delta is used to determine how far in/out you want to zoom.
            longitudeDelta: 0.0421,
          }}
        >
          { markers.length && markers.map((m, i) => (
            <MapView.Marker
              key={i}
              onPress={() => this.props.navigation.navigate('EventDetails', { event: m })}
              ref={marker => { this.marker = marker }}
              coordinate={m.coordinate}
            />
          ))
          }
        </MapView>

        {/* Modal for creating event... could be pulled out into its own Screen */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={isVisible}
        >
          <View style={styles.modalHeader}>
            <Button title='Cancel' clear={true} onPress={() => this.setState({isVisible: false})}/>
            <Button title='Save' clear={true} onPress={this.createEvent}/>
          </View>
          <ScrollView contentContainerStyle={{flex: 1, flexDirection: 'column', padding: 15}}>
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
              onChangeText={(title) => this.setState({ title }) }
            />
            <TextField
              value={description}
              onChangeText={(description) => this.setState({ description })}
              returnKeyType='next'
              multiline={true}
              blurOnSubmit={true}
              label='Description'
              characterRestriction={140}
            />
            <TouchableHighlight underlayColor="#eee" style={styles.imageUpload} onPress={this.uploadImage}>
              { !image ?
                <Icon style={styles.iconBtn} color="#d0d0d0" name="add-a-photo" />
                :
                <Image style={styles.uploadedImage} source={{uri: image.location}} />
              }
            </TouchableHighlight>
          </ScrollView>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    height: 60,
    backgroundColor: '#1C7ED7',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  rightIcon: {
    marginRight: 10
  },
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
