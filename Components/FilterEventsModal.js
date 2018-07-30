import React from 'react';
import { Constants } from 'expo';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button, ListItem } from 'react-native-elements';

import { PRIMARY_DARK_COLOR, ACCENT_COLOR } from '../common/styles/common-styles';

export default class FilterEventsModal extends React.Component {
  test(val) {

  }
  render() {
    return(
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.filtersVisible}
      >
        <View style={styles.modalHeader}>
          <Button title='Cancel' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.props.setVisibility}/>
          <Text style={styles.headerTitle}>Filter Events</Text>
          <Button title='Save' titleStyle={{color: ACCENT_COLOR}} clear={true}/>
        </View>
        <View style={{flexDirection: 'column', padding: 15}}>
          {/* TODO: This needs to have default preferences originally.  Store preferences locally. */}
          <ListItem title='Social' leftIcon={{ name: 'person-pin'}} bottomDivider chevron/>
          <ListItem title='Date' leftIcon={{ name: 'date-range'}} bottomDivider chevron/>
          <ListItem title='Distance' leftIcon={{ name: 'location-searching'}} bottomDivider chevron/>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalHeader: {
    // height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  }
});
