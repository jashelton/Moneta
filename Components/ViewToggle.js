import React from "react";
import { View, Text } from "react-native";

export default class ViewToggle extends React.Component {
  render() {
    const { hide } = this.props;
    if (hide) return null;
    return <View {...this.props} />;
  }
}
