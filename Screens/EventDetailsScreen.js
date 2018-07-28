import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Divider } from 'react-native-elements';

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null
    }
  }

  componentDidMount() {
    const { navigation } = this.props;
    const event = navigation.getParam('event', null);
    console.log('HELLO EVENT');
    console.log(event)
    this.setState({ event });
  }

  render() {
    const { event } = this.state;
    console.log(event);
    if (event) {
      return(
        <Card
          title={event.title}
          containerStyle={styles.container}
        >
          <ScrollView contentContainerStyle={{height: '100%'}}>
            <Image style={styles.uploadedImage} source={{uri: event.image.location}} />
            <Divider style={{marginBottom: 15}} />
            <Text>{event.desc}</Text>
          </ScrollView>
        </Card>
      ); 
    } else {
      return(<View style={styles.container}> <ActivityIndicator /> </View>)
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15
  },
  rightIcon: {
    marginRight: 10
  },
  uploadedImage: {
    width: '100%',
    height: '50%',
    // borderRadius: 5,
    marginBottom: 15
  }
});

