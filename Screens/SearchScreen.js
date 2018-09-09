import React from 'react';
import { ScrollView, View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SearchBar, ListItem, Avatar } from 'react-native-elements';
import { Constants } from 'expo';
import { connect } from 'react-redux';
import { getUsersSearch, clearUserSearch } from '../reducer';

class SearchScreen extends React.Component {
  static navigationOptions = { header: null };

  state = {
    query: ''
  }

  async searchQuery(value) {
    const { clearUserSearch, getUsersSearch } = this.props;
    this.setState({ query: value });

    if (!value.length) {
      this.setState({ query: '' });

      return clearUserSearch()
    };

    getUsersSearch(value);
  }

  _renderUser({item}) {
    return (
      <ListItem
        leftAvatar={
          <Avatar
            size="small"
            rounded
            source={item.profile_image ? {uri: item.profile_image} : null}
            icon={{name: 'person', size: 20}}
            activeOpacity={0.7}
          />
        }
        title={item.name}
        chevron
        bottomDivider
        onPress={() => this.props.navigation.navigate('UserDetails', {userId: item.id})}
      />
    );
  }

  render() {
    const { userList, loading } = this.props;

    return(
      <View style={styles.container}>
        <SearchBar
          showLoading={loading}
          platform="ios"
          cancelButtonTitle="Cancel"
          placeholder='Search for user'
          onChangeText={val => this.searchQuery(val)}
          onClear={() => this.props.clearUserSearch()}
          onCancel={() => this.searchQuery('')}
          value={this.state.query}
          containerStyle={{ backgroundColor: '#fff', borderBottomColor: '#eee', borderBottomWidth: 1 }} />

        { loading ?
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        :
          <ScrollView>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              numColumns={1}
              data={userList}
              renderItem={this._renderUser.bind(this)}
            />
          </ScrollView>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statusBarHeight
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error,
    userList: state.userList
  };
};

const mapDispatchToProps = {
  getUsersSearch,
  clearUserSearch
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchScreen);
