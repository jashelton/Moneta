import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { ListItem, Avatar } from 'react-native-elements';
import { AirbnbRating } from 'react-native-ratings';

export default class VibeComponent extends React.Component {

  submitRating(value) {
    // TODO: Upsert to ratings table
  }

  render() {
    const { vibe, navigation } = this.props;
    return(
      <View style={ [styles.container] }>
        <ListItem
          leftAvatar={
            <Avatar
              size="small"
              rounded
              source={vibe.profile_image ? { uri: vibe.profile_image } : null}
              icon={{ name: 'person', size: 20 }}
              activeOpacity={0.7}
            />
          }
          title={vibe.name}
          titleStyle={{ color: PRIMARY_DARK_COLOR}}
          subtitle={new Date(vibe.created_at).toISOString().substring(0, 10)}
          subtitleStyle={styles.subText}
          chevron
          onPress={() => navigation.navigate('UserDetails', { userId: vibe.user_id })}
        />
        <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: 15 }}>
          <AirbnbRating
            count={5}
            defaultRating={0}
            size={20}
            showRating={false}
            onFinishRating={this.submitRating}
          />
        </View>
        <View style={{ flex: 1, padding: 15 }}>
          <Text>{vibe.description}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 5,
    flex: 1,
    flexDirection: 'column',
  },
  subText: {
    fontWeight: '200',
    color: 'grey',
    fontSize: 12
  },
});
