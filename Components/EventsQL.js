import React from 'react';
import { Query } from 'react-apollo';
import { DIVIDER_COLOR } from '../common/styles/common-styles';
import { View,
         Text,
         FlatList,
         StyleSheet,
         Dimensions,
         RefreshControl,
         ImageBackground,
         TouchableHighlight } from 'react-native';

_renderItem = ({item}) => {
  return (
    <TouchableHighlight
      underlayColor="#eee"
      style={styles.imageTouch}
      onPress={() => this.props.navigation.navigate('EventDetails', { eventId: item.id })}
    >
      <ImageBackground style={styles.image} resizeMode='cover' source={{uri: item.image}}>
        <View style={styles.imageOverlay}>
          <Text style={{color:DIVIDER_COLOR}}>{item.owner.first_name} {item.owner.last_name}</Text>
          <Text style={{color:DIVIDER_COLOR, fontSize: 10}}>{item.city}, {item.region}, {item.country_code}</Text>
        </View>
      </ImageBackground>
    </TouchableHighlight>
  )
}

const EventsComponent = (props) => (
  <Query query={props.query}>
    {({ loading, error, data, refetch}) => {
      if (error) return null
      if (loading) return <Text>Loading...</Text>

      return (
        <FlatList
          data={data.events}
          keyExtractor = {(item, index) => index.toString()}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
            />
          }
          renderItem={this._renderItem.bind(this)}
        /> 
      );
    }}
  </Query>
);

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
  }
});

export default EventsComponent;