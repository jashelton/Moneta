import React from "react";
import { graphql } from "react-apollo";
import { USER_SEARCH } from "../graphql/queries";
import { ScrollView, View, StyleSheet, FlatList } from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { SearchBar, ListItem, Avatar } from "react-native-elements";
import { Constants } from "expo";
import ErrorComponent from "../Components/ErrorComponent";

class SearchScreen extends React.Component {
  static navigationOptions = { header: null };

  state = {
    query: ""
  };

  searchQuery = value => {
    const { refetch } = this.props.data;
    this.setState({ query: value });

    if (!value.length) {
      this.setState({ query: null });
      refetch({ name: null });
      return;
    }

    refetch({ name: value });
  };

  _renderUser({ item }) {
    return (
      <ListItem
        leftAvatar={
          <Avatar
            size="small"
            rounded
            source={item.profile_image ? { uri: item.profile_image } : null}
            icon={{ name: "person", size: 20 }}
            activeOpacity={0.7}
          />
        }
        title={`${item.first_name} ${item.last_name}`}
        chevron
        bottomDivider
        onPress={() =>
          this.props.navigation.navigate("UserDetails", { userId: item.id })
        }
      />
    );
  }

  render() {
    const { loading, data, error } = this.props;
    if (loading)
      return (
        <View>
          <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
        </View>
      );

    if (error)
      return (
        <ErrorComponent
          iconName="error"
          refetchData={data.refetch({ name: this.state.query })}
          errorMessage={error.message}
          isSnackBarVisible={error ? true : false}
          snackBarActionText="Retry"
        />
      );

    return (
      <View style={styles.container}>
        <SearchBar
          showLoading={loading}
          platform="ios"
          cancelButtonTitle="Cancel"
          placeholder="Search for user"
          onChangeText={val => this.searchQuery(val)}
          onClear={() => this.searchQuery("")}
          onCancel={() => this.searchQuery("")}
          value={this.state.query}
          containerStyle={{
            backgroundColor: "#fff",
            borderBottomColor: "#eee",
            borderBottomWidth: 1
          }}
        />
        <ScrollView>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            data={data.allUsers}
            renderItem={this._renderUser.bind(this)}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Constants.statusBarHeight
  }
});

export default graphql(USER_SEARCH)(SearchScreen);
