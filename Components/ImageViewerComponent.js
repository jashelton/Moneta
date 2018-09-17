import React from "react";
import { StyleSheet, Modal, TouchableHighlight } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { Icon } from "react-native-elements";

const ImageViewerComponent = props => {
  const { visible, image, onClose } = props;
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={() => onClose()}
    >
      <ImageViewer
        imageUrls={[{ url: image }]}
        index={0}
        onSwipeDown={() => onClose()}
        enableSwipeDown={true}
        renderIndicator={() => null}
        saveToLocalByLongPress={false}
        renderHeader={() => (
          <TouchableHighlight
            style={styles.headerStyles}
            onPress={() => onClose()}
          >
            <Icon name="close" size={38} color="#fff" />
          </TouchableHighlight>
        )}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  headerStyles: {
    position: "absolute",
    width: "100%",
    padding: 15,
    alignItems: "flex-end",
    zIndex: 10000
  }
});

export default ImageViewerComponent;
