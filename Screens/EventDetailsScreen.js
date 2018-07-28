import React from 'react';
import { View, ScrollView, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Divider, Icon } from 'react-native-elements';
import { eventsService } from '../Services';

export class EventDetailsHeader extends React.Component {
  render() {
    return(
      <View>
        <Text>
          {this.props.title}
        </Text>
      </View>
    );
  }
}

export default class EventDetailsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      socialDetails: {}
    }

    this.favoriteEvent = this.favoriteEvent.bind(this);
    this.incrementCommentCount = this.incrementCommentCount.bind(this);
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const event = navigation.getParam('event', null);

    this.setState({ event });

    const { data } = await eventsService.getEventDetails(event.id);
    this.setState({ socialDetails: data });
  }

  async favoriteEvent(eventId) {
    const { event, socialDetails } = this.state;
    event.liked = !event.liked;
    const { data } = await eventsService.likeEvent(eventId, event.liked);
    event.liked ? socialDetails.numLikes ++ : socialDetails.numLikes --;
    this.setState({ event });
  }

  incrementCommentCount() {
    const { socialDetails } = this.state;
    socialDetails.numComments ++;
    this.setState({ socialDetails });
  }

  render() {
    const { event, socialDetails } = this.state;

    if (event) {
      return(
        <Card
          // title={<EventDetailsHeader title={event.title} />}
          title={event.title}
          containerStyle={styles.container}
        >
          <ScrollView contentContainerStyle={{height: '100%'}}>
            <Image style={styles.uploadedImage} source={{uri: event.image.location}} />
            <View style={styles.iconGroup}>
              <View style={styles.iconWrapper}>
                <Icon
                  style={styles.rightIcon}
                  color='#fb3958'
                  name={!event.liked ? 'favorite-border' : 'favorite'}
                  onPress={() => this.favoriteEvent(event.id)}
                />
                <Text style={styles.socialCount}>{socialDetails.numLikes}</Text>
              </View>
              <View style={styles.iconWrapper}>
                <Icon
                  style={styles.rightIcon}
                  color='#fb3958'
                  name='comment'
                  onPress={() => this.props.navigation.navigate('Comments', { eventId: event.id, incrementCommentCount: this.incrementCommentCount.bind(this) })}
                />
                <Text style={styles.socialCount}>{socialDetails.numComments}</Text>
              </View>
            </View>
            <Divider style={{marginBottom: 15}} />
            <Text>{event.description}</Text>
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
  socialCount: {
    marginLeft: 5
  },
  uploadedImage: {
    width: '100%',
    height: '50%',
    borderRadius: 2,
  },
  iconGroup: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

