import React from "react";
import { Mutation } from "react-apollo";
import { RATE_EVENT } from "../graphql/queries";
import { View, Text, StyleSheet } from "react-native";
import { AirbnbRating } from "react-native-ratings";

const RatingComponent = ({ event_id, current_rating, avg_rating }) => {
  return (
    <Mutation mutation={RATE_EVENT}>
      {rateEvent => (
        <View style={styles.container}>
          <View>
            <Text style={styles.text}>
              {avg_rating ? `Avg: ${avg_rating}` : "No ratings yet."}
            </Text>
            <AirbnbRating
              count={5}
              defaultRating={current_rating || 0}
              size={22}
              showRating={false}
              onFinishRating={value =>
                rateEvent({ variables: { event_id, value } })
              }
            />
            <Text style={styles.text}>
              {current_rating
                ? `My Rating: ${current_rating}`
                : "Rate Anonymously"}
            </Text>
          </View>
        </View>
      )}
    </Mutation>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 15
  },
  text: {
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "200"
  }
});

export default RatingComponent;
