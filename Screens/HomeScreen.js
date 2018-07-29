import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableHighlight  } from 'react-native';
import { Icon } from 'react-native-elements';

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
      ),
      headerLeft: (
        <Icon
          containerStyle={styles.leftIcon}
          size={28}
          name="person"
          color="#fff"
          onPress={navigation.getParam('navigateToProfile')}
        />
      )
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      navigateToMap: () => this.navigateTo('Map'),
      navigateToProfile: () => this.navigateTo('UserProfile')
    });
  }

  navigateTo(location) {
    this.props.navigation.navigate(location);
  }

  render() {
    return(
      <View style={styles.container}>
        <Text>Home Screen</Text>
        {/* <Modal
          animationType="slide"
          transparent={false}
          visible={true}
          onRequestClose={() => {
            alert('Modal has been closed.');
          }}>
          <View style={{marginTop: 22}}>
            <View>
              <Text>Hello World!</Text>

              <TouchableHighlight
                onPress={() => {
                  this.setModalVisible(!this.state.modalVisible);
                }}>
                <Text>Hide Modal</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  rightIcon: {
    marginRight: 10
  },
  leftIcon: {
    marginLeft: 10
  }
});