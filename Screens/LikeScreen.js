import React from "react";
import { Query } from "react-apollo";
import { GET_EVENT_LIKES } from "../graphql/queries";
import { ScrollView, View, FlatList, StyleSheet } from "react-native";
import { WaveIndicator } from "react-native-indicators";
import { ListItem, Avatar } from "react-native-elements";
import { PRIMARY_DARK_COLOR } from "../common/styles/common-styles";

export default class LikeScreen extends React.Component {
  state = { event_id: null };

  async componentDidMount() {
    const event_id = this.props.navigation.getParam("eventId");
    this.setState({ event_id });
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
        title={`${item.first_name} ${item.last_name}`}
        chevron
        bottomDivider
        onPress={() =>
          this.props.navigation.navigate("UserDetails", {
            userId: item.id
          })
        }
      />
    );
  }

  render() {
    const { event_id } = this.state;

    return (
      <ScrollView style={styles.container}>
        <Query query={GET_EVENT_LIKES} variables={{ event_id }}>
          {({ loading, error, data, refetch, fetchMore }) => {
            if (loading)
              return (
                <View>
                  <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
                </View>
              );
            return (
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                numColumns={1}
                data={data.eventLikes}
                renderItem={this._renderItem.bind(this)}
              />
            );
          }}
        </Query>
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
