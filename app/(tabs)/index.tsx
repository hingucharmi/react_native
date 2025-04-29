import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import mqtt from "mqtt";
import useMqtt from "@/hooks/useMqtt";

const app = () => {
  const [interval, setInterval] = useState("");
  const [macMessage, setMacMessage] = useState("");

  const { publish, connect, disconnect } = useMqtt({
    "demo/#": handleDemoEvent,
    "test/+/demo/+": (parts, message) => {
      console.log("subscribe", "test/+/demo/+", parts, message);
    },
  });

  const MqttConnection = () => {
    connect();
  };

  const doDisconnect = () => {
    disconnect();
  };

  function handleDemoEvent(parts, message) {
    console.log("subscribe", "demo/#", parts, message);
  }

  return (
    <ImageBackground
      source={require("@/assets/images/react-logo.png")}
      resizeMode="cover"
      style={styles.image}
    >
      <View style={styles.container}>
        {/* Interval Input */}
        <Text style={styles.title}>MQTT Connections:</Text>
        <Text style={styles.title}>Interval</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter interval (e.g., 5000)"
          keyboardType="numeric"
          inputMode="numeric"
          textContentType="telephoneNumber"
          value={interval}
          onChangeText={(text) => {
            // Accept only digits
            if (/^\d*$/.test(text)) {
              setInterval(text);
            }
          }}
          defaultValue="5"
        />

        {/* MAC Address Input */}
        <Text style={styles.title}>MAC Address (00:1A:7D:DA:71:13)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter MAC (e.g., 00:1A:7D:DA:71:13)"
          autoCapitalize="characters"
          value={macMessage}
          onChangeText={setMacMessage}
          defaultValue="00:1A:7D:DA:71:13"
        />

        {/* Button Connect MQTT */}

        {/* <Pressable style={styles.button} onPress={toggleMqttConnection}>
          <Text style={styles.buttonText}>
            {mqttClient ? "Disconnect MQTT" : "Connect MQTT"}
          </Text>
        </Pressable> */}
        <View style={styles.button}>
          <Button title="Start MQTT" onPress={MqttConnection} />

          {/* Button diconnected MQTT */}
          <Button title="STOP MQTT" onPress={doDisconnect} />
        </View>

        <View style={styles.button}>
          <Button title="Start GPS" onPress={MqttConnection} />

          {/* Button diconnected MQTT */}
          <Button title="STOP GPS" onPress={doDisconnect} />
        </View>
      </View>
    </ImageBackground>
  );
};

export default app;

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",

    justifyContent: "center",
    marginHorizontal: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  link: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    textDecorationLine: "underline",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-around",
    // backgroundColor: "#1E90FF",
    // paddingVertical: 14,
    // paddingHorizontal: 20,
    // borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
