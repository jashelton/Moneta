import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import { DIVIDER_COLOR, PRIMARY_DARK_COLOR, TEXT_ICONS_COLOR } from '../common/styles/common-styles';
import { connect } from 'react-redux';

class CreateEventScreen extends React.Component {
  render() {
    return(
      <View style={styles.container}>
        <ListItem
          title='Create Moment'
          subtitle='Upload an image with location.'
          subtitleStyle={styles.subtitleText}
          chevron
          onPress={() => this.props.navigation.navigate('CreateMoment')}
          bottomDivider
        />
        <ListItem
          title='Create Vibe'
          subtitle="Spread a positive vibe and let your friends know what you're up to"
          subtitleStyle={styles.subtitleText}
          chevron
          onPress={() => this.props.navigation.navigate('CreateVibe')}
          bottomDivider
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  subtitleText: {
    fontSize: 12,
    color: DIVIDER_COLOR
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error
  };
};

export default connect(mapStateToProps)(CreateEventScreen);