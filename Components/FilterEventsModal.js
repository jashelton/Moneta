import React from 'react';
import { Constants } from 'expo';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, ListItem } from 'react-native-elements';
import ViewToggle from '../Components/ViewToggle';

import { PRIMARY_DARK_COLOR, ACCENT_COLOR, SECONDARY_DARK_COLOR } from '../common/styles/common-styles';

export default class FilterEventsModal extends React.Component {

  socialOptions = ['All', 'Following', 'Me'];

  constructor(props) {
    super(props);

    this.state = {
      hideSocialFilter: true,
    };

    this.toggleSocialFilter = this.toggleSocialFilter.bind(this);
  }

  toggleSocialFilter() {
    const { hideSocialFilter } = this.state;
    this.setState({hideSocialFilter: !hideSocialFilter});
  }

  updateSocialFilter() {

  }

  render() {
    const { hideSocialFilter } = this.state;
    const { socialSelected,
            setVisibility,
            filtersVisible,
            updateSocialSelected } = this.props;

    return(
      <Modal
        animationType="slide"
        transparent={false}
        visible={filtersVisible}
      >
        <View style={styles.modalHeader}>
          <View style={{flex: 1}}></View>
          <Button
            clear
            title='Done'
            titleStyle={{color: ACCENT_COLOR}}
            buttonStyle={{marginRight: 15}}
            onPress={setVisibility}
          />
        </View>
        <View style={{flexDirection: 'column', padding: 15}}>
          <ListItem
            title='Social'
            leftIcon={{ name: 'person-pin'}}
            bottomDivider chevron
            onPress={this.toggleSocialFilter}
          />
          <ViewToggle hide={hideSocialFilter}>
            <View style={styles.innerAccordion}>
              {this.socialOptions.map((option, i) => (
                <ListItem
                  key={i}
                  title={option}
                  bottomDivider
                  onPress={() => updateSocialSelected(option)}
                  rightIcon={socialSelected === option ? {name: 'check'} : null}
                />
              ))}
            </View>
          </ViewToggle>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modalHeader: {
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Constants.statusBarHeight
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  },
  innerAccordion: {
    marginLeft: 25,
    marginBottom: 25
  }
});
