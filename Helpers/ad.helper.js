import React from "react";
import { View } from "react-native";
import { AdMobInterstitial, AdMobBanner, PublisherBanner } from "expo";
import {
  EVENT_DETAILS_AD_UNIT,
  FULL_SCREEN_AD_UNIT
} from "react-native-dotenv";

export const adHelper = {
  displayAd,
  displayBannerAd,
  displayPublisherBanner
};

async function displayAd() {
  AdMobInterstitial.setAdUnitID(
    process.env.NODE_ENV === "development"
      ? "ca-app-pub-3940256099942544/6300978111"
      : FULL_SCREEN_AD_UNIT
  );
  AdMobInterstitial.setTestDeviceID("EMULATOR");
  await AdMobInterstitial.requestAdAsync();
  await AdMobInterstitial.showAdAsync();
}

function displayBannerAd() {
  return (
    <AdMobBanner
      adUnitID={
        process.env.NODE_ENV === "development"
          ? "ca-app-pub-3940256099942544/6300978111"
          : EVENT_DETAILS_AD_UNIT
      }
      testDeviceID="EMULATOR"
    />
  );
}

function displayPublisherBanner() {
  return (
    <View style={{ alignItems: "center" }}>
      <PublisherBanner
        adUnitID={
          process.env.NODE_ENV === "development"
            ? "ca-app-pub-3940256099942544/6300978111"
            : EVENT_DETAILS_AD_UNIT
        }
        testDeviceID="EMULATOR"
      />
    </View>
  );
}
