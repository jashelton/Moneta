import React from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableHighlight,
  Image,
  View
} from "react-native";
import { Icon } from "react-native-elements";

export default class ImageSelectionComponent extends React.Component {
  state = {
    imageLimit: 6
  };

  _renderImages = () => {
    const { images, prepS3Upload } = this.props;
    let items = [];
    for (let i = 0; i < this.state.imageLimit; i++) {
      items.push(
        <TouchableHighlight
          key={i}
          style={styles.imageItem}
          underlayColor="#eee"
          onPress={() => prepS3Upload()}
        >
          {!images[i] ? (
            <Icon
              style={styles.iconBtn}
              size={30}
              color="#d0d0d0"
              name="add-a-photo"
            />
          ) : (
            <Image
              style={styles.uploadedImage}
              source={{ uri: images[i].s3.uri }}
            />
          )}
        </TouchableHighlight>
      );
    }

    return items;
  };

  render() {
    return <View style={styles.imageGrid}>{this._renderImages()}</View>;
  }
}

const styles = StyleSheet.create({
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    height: Dimensions.get("window").height / 2
  },
  imageItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: "33%",
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#fff"
  },
  uploadedImage: {
    width: "100%",
    height: "100%"
  }
});
