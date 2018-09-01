import React from 'react';
import { View,
         Text,
         ScrollView,
         StyleSheet,
         Dimensions,
         TouchableHighlight,
         ActivityIndicator,
         ImageBackground,
         RefreshControl,
         FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { DIVIDER_COLOR, PRIMARY_DARK_COLOR } from '../common/styles/common-styles';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

class RecentActivity extends React.Component {
  _renderImage({item, index}) {
    return(
      <TouchableHighlight
        underlayColor="#eee"
        style={styles.imageTouch}
        onPress={() => this.props.navigation.push('EventDetails', { eventId: item.id })}
      >
        <ImageBackground style={styles.image} resizeMode='cover' source={{uri: item.image}}>
          <View style={styles.imageTopOverlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center'}}>
              <Icon color={PRIMARY_DARK_COLOR} name='visibility' size={15} />
              <Text style={{ color: '#000', marginLeft: 5, fontSize: 12, fontWeight: 'bold' }}>{item.view_count}</Text>
              { item.recent_views &&
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                  <Icon color='green' name='arrow-upward' size={15} />
                  <Text style={{ color: '#000', marginLeft: 5, fontSize: 12, fontWeight: 'bold' }}>{item.recent_views}</Text>
                </View>
              }
            </View>
            { item.privacy === 'Private' &&
              <Icon color='red' name='lock' size={15} />
            }
          </View>
          <View style={styles.imageOverlay}>
            <Text style={{color:DIVIDER_COLOR}}>{item.username || item.name}</Text>
            <Text style={{color:DIVIDER_COLOR, fontSize: 10}}>{item.city ? `${item.city},` : null} {item.region}, {item.country_code}</Text>
          </View>
        </ImageBackground>
      </TouchableHighlight>
    );
  }

  render() {
    const { events, noDataMessage, refreshing, loading } = this.props;

    if (loading) {
      return (
        <View>
          <ActivityIndicator />
        </View>
      );
    }

    if (events && events.length) {
      return(
        <View style={styles.imagesContainer}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            data={events}
            renderItem={this._renderImage.bind(this)}
            onEndReached={ () => this.props.handleScroll(events.length)}
            onEndReachedThreshold={0}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.props._onRefresh}
              />
            }
          />
        </View>
      );
    } else {
      return(
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.props._onRefresh}
            />
          }
        >
          <Text>{ noDataMessage || 'No recent activity to display' }</Text>
        </ScrollView>
      )
    }
  }
}

RecentActivity.propTypes = {
  events: PropTypes.array.isRequired,
  refreshing: PropTypes.bool.isRequired,
  _onRefresh: PropTypes.func.isRequired
}

const styles = StyleSheet.create({
  imagesContainer: {
    paddingTop: 5
  },
  imageTouch: {
    width: '50%', // 50%
    height: Dimensions.get('window').height / 4, // height: Dimensions.get('window').height / 2
    padding: 2
  },
  image: {
    flex: 1,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  imageTopOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading
  };
};

export default connect(mapStateToProps)(RecentActivity);