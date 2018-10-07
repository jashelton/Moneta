import React from "react";
import { UPDATE_USER } from "../graphql/queries";
import { graphql } from "react-apollo";
import { View, Modal, StyleSheet } from "react-native";
import {
  PRIMARY_DARK_COLOR,
  TEXT_ICONS_COLOR
} from "../common/styles/common-styles";
import { Avatar, Button, Divider } from "react-native-elements";
import { TextField } from "react-native-material-textfield";
import { RNS3 } from "react-native-aws3";
import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  BUCKET,
  BUCKET_REGION
} from "react-native-dotenv";
import { commonHelper } from "../Helpers";

class EditProfileModal extends React.Component {
  options = {
    keyPrefix: "",
    bucket: BUCKET,
    region: BUCKET_REGION,
    accessKey: AWS_ACCESS_KEY,
    secretKey: AWS_SECRET_ACCESS_KEY,
    successActionStatus: 201
  };

  constructor(props) {
    super(props);

    this.state = {
      imageFile: null,
      first_name: props.userDetails.first_name,
      last_name: props.userDetails.last_name
    };

    this.prepS3Upload = this.prepS3Upload.bind(this);
    this.submitUpdatedUser = this.submitUpdatedUser.bind(this);
  }

  componentDidMount() {
    this.options.keyPrefix = `user_${this.props.userDetails.id}/`;
  }

  createDateString() {
    const time = new Date();
    const now = Date.now();

    return `${time.getFullYear()}-${time.getMonth() +
      1}-${time.getDate()}_${now}`;
  }

  // Check permission on CAMERA_ROLL and store what is needed to upload image to S3.
  async prepS3Upload() {
    const result = await commonHelper.selectImage(false);

    if (!result.cancelled) {
      const { imageFile } = this.state;
      imageFile = {
        uri: result.uri,
        name: this.createDateString(),
        type: result.type
      }; // Required fields for S3 upload
      this.setState({ imageFile });
    }
  }

  async submitUpdatedUser() {
    let { imageFile, first_name, last_name } = this.state;

    const user = {
      first_name,
      last_name
    };

    if (imageFile && imageFile.uri) {
      const s3Upload = await RNS3.put(imageFile, this.options);
      user.profile_image = s3Upload.body.postResponse.location;
    }

    await this.props.mutate({ UPDATE_USER, variables: { ...user } });

    this.props.toggleEditProfile();
  }

  render() {
    const { toggleEditProfile, userDetails, isVisible } = this.props;
    const { imageFile, first_name, last_name } = this.state;

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={toggleEditProfile}
      >
        <View style={styles.modalHeader}>
          <Button
            title="Cancel"
            titleStyle={{ color: TEXT_ICONS_COLOR }}
            clear={true}
            onPress={toggleEditProfile}
          />
          <Button
            title="Done"
            titleStyle={{ color: TEXT_ICONS_COLOR }}
            clear={true}
            onPress={this.submitUpdatedUser}
          />
        </View>
        <View style={styles.editImageContainer}>
          <Avatar
            size="xlarge"
            rounded
            source={
              imageFile && imageFile.uri
                ? { uri: imageFile.uri }
                : userDetails.profile_image
                  ? { uri: userDetails.profile_image }
                  : null
            }
            icon={userDetails.profile_image ? null : { name: "add-a-photo" }}
            activeOpacity={0.7}
            onPress={this.prepS3Upload}
          />
        </View>
        <Divider />
        <View style={styles.editProfileBody}>
          <TextField
            label="First Name"
            value={first_name}
            onChangeText={first_name => this.setState({ first_name })}
          />
          <TextField
            label="Last Name"
            value={last_name}
            onChangeText={last_name => this.setState({ last_name })}
          />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalHeader: {
    height: 60,
    backgroundColor: PRIMARY_DARK_COLOR,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  editImageContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 25
  },
  editProfileBody: {
    padding: 15
  }
});

export default graphql(UPDATE_USER)(EditProfileModal);
