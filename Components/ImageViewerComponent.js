import React from "react";
import { Modal } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

export default ImageViewerComponent = props => {
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
        onClick={() => onClose()}
      />
    </Modal>
  );
};
