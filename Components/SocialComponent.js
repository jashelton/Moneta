import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, Divider } from 'react-native-elements';

export default class SocialComponent extends React.Component {

  render() {
    const { event, showCommentIcon, onCommentPress, onLikePress } = this.props;

    return (
      <View style={styles.container}>
        <Divider />
        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              color='#fb3958'
              name={!event.liked ? 'favorite-border' : 'favorite'}
              iconStyle={{ padding: 5 }}
              onPress={() => onLikePress()}
            />
            <Text>{event.likes_count}</Text>
          </View>
          { showCommentIcon &&
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{event.comment_count}</Text>
              <Icon
                color='#fb3958'
                name='comment'
                iconStyle={{ padding: 5 }}
                onPress={() => onCommentPress()}
              />
            </View>
          }
        </View>
        <Divider />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  }
});
