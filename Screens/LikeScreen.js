import React from "react";
import { ScrollView, FlatList, StyleSheet } from "react-native";
import { ListItem, Avatar } from "react-native-elements";
import { connect } from "react-redux";
import { getLikesForEvent, clearErrors } from "../reducer";

class LikeScreen extends React.Component {
  async componentDidMount() {
    const { getLikesForEvent, navigation } = this.props;
    const eventId = navigation.getParam("eventId");

    try {
      const response = await getLikesForEvent(eventId);
      if (response.error) throw response.error;
    } catch (err) {
      throw err;
    }
  }

  _renderItem({ item }) {
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
        title={item.name}
        chevron
        bottomDivider
        onPress={() =>
          this.props.navigation.navigate("UserDetails", {
            userId: item.user_id
          })
        }
      />
    );
  }

  render() {
    const { likesList } = this.props;

    return (
      <ScrollView style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          numColumns={1}
          data={likesList}
          renderItem={this._renderItem.bind(this)}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error,
    likesList: state.likesList
  };
};

const mapDispatchToProps = {
  getLikesForEvent,
  clearErrors
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LikeScreen);
