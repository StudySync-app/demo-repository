import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FolderedMediaManagerScreen() {
  // Move this INSIDE the component
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      { paddingTop: insets.top, paddingBottom: insets.bottom }
    ]}>
      <Text style={styles.text}>File media</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18
  }
});