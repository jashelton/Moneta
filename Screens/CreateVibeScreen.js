import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { connect } from "react-redux";
import { createEvent, clearErrors } from "../reducer";
import { DIVIDER_COLOR } from "../common/styles/common-styles";
import SnackBar from "react-native-snackbar-component";
import { Haptic } from "expo";
import { adHelper } from "../Helpers";

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
      vibeText: "",
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
    let { vibeText, privacy } = this.state;
    vibeText = "";
    privacy = "Public";

    this.setState({ vibeText, privacy });
  }

  async createVibe() {
    this.setState({ isCreateDisabled: true });

    const { vibeText } = this.state;

    if (vibeText.length > 240 || vibeText < 1) {
      alert("You must provide a valid status.");
      return;
    }

    const vibe = {
      event_type: "vibe",
      description: this.state.vibeText,
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
    const { vibeText } = this.state;
    const { error } = this.props;

    if (error) {
      return (
        <View style={styles.container}>
          <SnackBar
            visible={error ? true : false}
            textMessage={error}
            actionHandler={() => this.props.clearErrors()}
            actionText="close"
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TextField
          label="What's going on?"
          value={vibeText}
          onChangeText={content => this.setState({ vibeText: content })}
          characterRestriction={240}
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

const mapStateToProps = state => {
  return {
    loading: state.loading,
    error: state.error
  };
};

const mapDispatchToProps = { createEvent, clearErrors };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateVibeScreen);
