import React from "react";
import { Mutation } from "react-apollo";
import { CREATE_VIBE } from "../graphql/queries";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { DIVIDER_COLOR } from "../common/styles/common-styles";
import { Haptic } from "expo";

export default class CreateVibeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Create Vibe",
      headerRight: (
        <Button
          containerStyle={styles.rightIcon}
          clear
          title="Done"
          titleStyle={{ color: "blue" }}
          disabled={navigation.getParam("isDisabled")}
          disabledTitleStyle={{ color: DIVIDER_COLOR }}
          onPress={navigation.getParam("createVibe")}
        />
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      desc: "",
      privacy: "Public",
      isCreateDisabled: false
    };

    this.createVibe = this.createVibe.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      createVibe: () => this.createVibe(),
      isDisabled: this.state.isCreateDisabled
    });
  }

  clearVibe() {
    let { desc, privacy } = this.state;
    desc = "";
    privacy = "Public";

    this.setState({ desc, privacy });
  }

  async createVibe() {
    this.setState({ isCreateDisabled: true });

    const { desc } = this.state;

    if (desc.length > 240 || desc < 1) {
      alert("You must provide a valid status.");
      return;
    }

    const vibe = {
      event_type: "vibe",
      description: this.state.desc,
      privacy: this.state.privacy
    };

    try {
      const response = await this.props.createEvent(vibe);
      if (response.error) throw response.error;

      this.clearVibe();

      Haptic.notification(Haptic.NotificationTypes.Success);
      this.props.navigation.goBack();
    } catch (err) {
      throw err;
    }

    this.setState({ isCreateDisabled: false });
  }

  render() {
    const { desc } = this.state;

    return (
      <Mutation mutation={CREATE_VIBE} variables={{ desc }}>
        {createVibe => (
          <View style={styles.container}>
            <TextField
              label="What's going on?"
              value={desc}
              onChangeText={content => this.setState({ desc: content })}
              characterRestriction={240}
              multiline={true}
            />
          </View>
        )}
      </Mutation>
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
