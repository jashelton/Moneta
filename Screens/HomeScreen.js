import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Home',
      headerRight: (
        <Icon
          containerStyle={styles.rightIcon}
          size={28}
          name="pin-drop"
          color="#fff"
          onPress={navigation.getParam('navigateToMap')}
        />
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMap: () => this.navigateTo('Map')
    });
  }

  navigateTo(location) {
    this.props.navigation.navigate(location);
  }

  render() {
    return(
      <View style={styles.container}>
        <ListItem title="Home Screen" />
        <ListItem title="Create Account Alias to display in comments and likes?" />
        <ListItem title="Trending Events?" />
        <ListItem title="Public/Private/Only Friends Event Post" />
        <ListItem title="Like Events?" />
        <ListItem title="User Profile?" />
        <ListItem title="Distance from Event" />
        <ListItem title="Report Event" />
        <ListItem title="Tags/Categories for Events to filter on" />
        <ListItem title="Could market the app by distributing markers throughout the world and offer a prize to whoever finds them." />
        <ListItem title="Only need to return coords and event id with each pin initially, re-query for details and join liked for liked_by_me" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rightIcon: {
    marginRight: 10
  },
});