import React from "react";
import { graphql } from "react-apollo";
import { CREATE_VIBE, ALL_EVENTS_QUERY } from "../graphql/queries";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { DIVIDER_COLOR } from "../common/styles/common-styles";
import { Haptic } from "expo";

class CreateVibeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Create Vibe",
      headerRight: (
        <Button
          containerStyle={styles.rightIcon}
          clear
          title="Done"
          titleStyle={{ color: "blue" }}
          disabled={navigation.getParam("isCreateDisabled")}
          disabledTitleStyle={{ color: DIVIDER_COLOR }}
          onPress={navigation.getParam("createVibe")}
        />
      )
    };
  };

  state = {
    desc: "",
    isCreateDisabled: false
  };

  componentDidMount() {
    this.props.navigation.setParams({
      createVibe: () => this.createVibe(),
      isCreateDisabled: this.state.isCreateDisabled
    });
  }

  updateCache = (store, { data: { createVibe } }) => {
    const data = store.readQuery({
      query: ALL_EVENTS_QUERY,
      variables: { offset: 0 }
    });

    store.writeQuery({
      query: ALL_EVENTS_QUERY,
      variables: { offset: 0 },
      data: {
        allEvents: [createVibe, ...data.allEvents]
      }
    });
  };

  async createVibe() {
    this.setState({ isCreateDisabled: true });
    const { desc } = this.state;
    const vibe = { type: "vibe", desc };

    if (desc < 1) {
      alert("You must provide a valid status.");
      return;
    }

    try {
      await this.props.mutate({
        CREATE_VIBE,
        variables: vibe,
        update: this.updateCache
      });

      this.setState({ desc: "" });
      Haptic.notification(Haptic.NotificationTypes.Success);
      this.props.navigation.goBack();
    } catch (err) {
      throw new Error(err);
    }

    this.setState({ isCreateDisabled: false });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextField
          label="What's going on?"
          value={this.state.desc}
          onChangeText={content => this.setState({ desc: content })}
          multiline={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff"
  }
});

export default graphql(CREATE_VIBE)(CreateVibeScreen);
