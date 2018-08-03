import React from 'react';
import { Constants } from 'expo';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button, ButtonGroup, ListItem } from 'react-native-elements';

import { PRIMARY_DARK_COLOR, ACCENT_COLOR, SECONDARY_DARK_COLOR } from '../common/styles/common-styles';

export default class FilterEventsModal extends React.Component {
  render() {
    return(
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.props.filtersVisible}
      >
        <View style={styles.modalHeader}>
          {/* TODO: Update on close rather than having a save button */}
          <Button title='Close' titleStyle={{color: ACCENT_COLOR}} clear={true} onPress={this.props.setVisibility}/>
        </View>
        <View style={{padding: 15}}>
          <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 16, fontWeight: '400'}}>Who do you want to see events from?</Text>
            <ButtonGroup
              onPress={this.props.updateIndex}
              selectedIndex={this.props.selectedIndex}
              buttons={['Everyone', 'Following', 'Me']}
              disableSelected={true}
              selectedButtonStyle={{ backgroundColor: SECONDARY_DARK_COLOR }}
            />
          </View>
        </View>
        {/* <View style={{flexDirection: 'column', padding: 15}}>
          <ListItem title='Social' leftIcon={{ name: 'person-pin'}} bottomDivider chevron/>
          <ListItem title='Date' leftIcon={{ name: 'date-range'}} bottomDivider chevron/>
          <ListItem title='Distance' leftIcon={{ name: 'location-searching'}} bottomDivider chevron/>
        </View> */}
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
