import React from "react";
import ViewToggle from "../Components/ViewToggle";
import { PublisherBanner } from "expo";
import { EVENT_DETAILS_AD_UNIT } from "react-native-dotenv";

export const PublisherBannerComponent = props => {
  let adDidError = null;
  return (
    <ViewToggle
      hide={adDidError}
      style={{ alignItems: "center", position: "absolute", bottom: 0 }}
    >
      <PublisherBanner
        adUnitID={
          process.env.NODE_ENV === "development"
            ? "ca-app-pub-3940256099942544/6300978111"
            : EVENT_DETAILS_AD_UNIT
        }
        testDeviceID="EMULATOR"
        onDidFailToReceiveAdWithError={() => {
          adDidError = true;
          props.bannerError();
        }}
        onAdViewDidReceiveAd={() => (adDidError = false)}
      />
    </ViewToggle>
  );
};
