import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-elements";

export default class CommentsComponent extends React.Component {
  render() {
    const { comments } = this.props;

    return (
      <View style={styles.commentSection}>
        {comments.map((comment, i) => (
          <View style={{ flexDirection: "row", marginVertical: 5 }} key={i}>
            <View>
              <Avatar
                size="small"
                rounded
                source={{ uri: comment.profile_image }}
                activeOpacity={0.7}
              />
            </View>
            <View
              style={{
                flex: 1,
                padding: 10,
                marginHorizontal: 10,
                backgroundColor: "#eee",
                borderRadius: 5
              }}
            >
              <Text style={{ fontWeight: "500", fontSize: 14 }}>
                {comment.name}
              </Text>
              <Text style={{ fontWeight: "200" }}>{comment.text}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  commentSection: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 5
  }
});
