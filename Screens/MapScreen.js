import React from 'react';
import MapView from 'react-native-maps';
import { View, ScrollView, TouchableHighlight, Image, StyleSheet } from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import { Icon, Overlay, Button, ButtonGroup, Input, Card } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';

import { RNS3 } from 'react-native-aws3';
import { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, BUCKET, BUCKET_REGION } from 'react-native-dotenv';
import { eventsService } from '../Services';

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
      title: 'Title',
      // image: null,
      image: { location: 'https://s3.amazonaws.com/moneta-event-images/user_undefined/2018-7-27_1532741518863' },
      description: 'Description'
    }

    this.newMarker = this.newMarker.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.updateIndex = this.updateIndex.bind(this);
  }

  async componentDidMount() {
    const { data } = await eventsService.getEvents();
    this.setState({markers: data});

    this.options.keyPrefix = `user_${this.props.user_id}/`; // TODO: USER CURRENT DOESNT EXIST
    this.props.navigation.setParams({
      newMarker: () => this.newMarker()
    });
  }

  newMarker() {
    this.setState({isVisible: true});
  }

  async createEvent() {
    const { markers, title, description, image } = this.state;
    const event = {
      title,
      description,
      image,
      coordinate: this.returnCoords()
    };

    const data = await eventsService.createEvent(event);

    markers.push(event);
    this.setState({markers, isVisible: false});
  }

  returnCoords() { // TODO: Just for testing
    return {
      latitude: 35.9098794,
      longitude: -78.9127328,
    }
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
    this.setState({selectedIndex})
  }

  render() {
    const { selectedIndex, image, markers, isVisible, title, description } = this.state;
    const buttons = ['Me', 'Friends', 'All'];

    return (
      <View style={styles.container}>
        <ButtonGroup
          onPress={this.updateIndex}
          selectedIndex={ selectedIndex }
          buttons={buttons}
        />
        <MapView
          style={{ flex: 1 }}
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
        <Overlay
          containerStyle={{height: '100%'}}
          isVisible={isVisible}
          onBackdropPress={() => this.setState({isVisible: false})}
        >
          <ScrollView contentContainerStyle={{flex: 1, flexDirection: 'column'}}>
            <TextField
              label='Title'
              value={title}
              onChangeText={(title) => this.setState({ title }) }
            />
            <TextField
              ref={this.aboutRef}
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
            <Button style={styles.btnSubmit} title='Submit' onPress={this.createEvent} />
            </ScrollView>
        </Overlay>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightIcon: {
    marginRight: 10
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
