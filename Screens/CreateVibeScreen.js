import React from "react";
import { graphql } from "react-apollo";
import { CREATE_VIBE, ALL_EVENTS_QUERY } from "../graphql/queries";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { Button } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { DIVIDER_COLOR } from "../common/styles/common-styles";
import { Haptic } from "expo";
import { commonHelper } from "../Helpers";

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
    isCreateDisabled: false,
    rateLimit: null
  };

  async componentDidMount() {
    const rateLimit = await commonHelper.getRateLimitFilter();
    this.setState({ rateLimit });

    this.props.navigation.setParams({
      createVibe: () => this.createVibe(),
      isCreateDisabled: this.state.isCreateDisabled
    });
  }

  _updateCache = (store, { data: { createVibe } }) => {
    const { rateLimit } = this.state;
    const { allEvents } = store.readQuery({
      query: ALL_EVENTS_QUERY,
      variables: { offset: 0, rate_threshold: rateLimit }
    });

    store.writeQuery({
      query: ALL_EVENTS_QUERY,
      variables: { offset: 0, rate_threshold: rateLimit },
      data: {
        allEvents: [createVibe, ...allEvents]
      }
    });
  };

  async createVibe() {
    this.setState({ isCreateDisabled: true });
    const { desc } = this.state;

    if (desc < 1) {
      alert("You must provide a valid status.");
      return;
    }

    try {
      await this.props.mutate({
        CREATE_VIBE,
        variables: { desc },
        update: this._updateCache
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
      <KeyboardAvoidingView
        alwaysVisible={true}
        behavior="height"
        style={styles.container}
      >
        <ScrollView style={{ flex: 1 }}>
          <TextField
            label="What's going on?"
            value={this.state.desc}
            onChangeText={content => this.setState({ desc: content })}
            multiline={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingBottom: 65,
    backgroundColor: "#fff"
  }
});

export default graphql(CREATE_VIBE)(CreateVibeScreen);
