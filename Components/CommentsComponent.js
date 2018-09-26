import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-elements";
import { WaveIndicator } from "react-native-indicators";
import { PRIMARY_DARK_COLOR } from '../common/styles/common-styles';

export default class CommentsComponent extends React.Component {
  render() {
    const { comments, loading, error } = this.props;

    if (loading)
      return (
        <View>
          <WaveIndicator color={PRIMARY_DARK_COLOR} size={80} />
        </View>
      );

    return (
      <View style={styles.commentSection}>
        {comments.map((comment, i) => (
          <View style={{ flexDirection: "row", marginVertical: 5 }} key={i}>
            <View>
              <Avatar
                size="small"
                rounded
                source={
                  comment.comment_user.profile_image
                    ? { uri: comment.comment_user.profile_image }
                    : null
                }
                icon={{ name: "person", size: 20 }}
                activeOpacity={0.7}
              />
            </View>
            <View style={styles.commentContainer}>
              <Text style={{ fontWeight: "500", fontSize: 14 }}>
                {comment.comment_user.first_name}{" "}
                {comment.comment_user.last_name}
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
  },
  commentContainer: {
    flex: 1,
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: "#eee",
    borderRadius: 5
  }
});
