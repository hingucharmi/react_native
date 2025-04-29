// import {
//   View,
//   Text,
//   StyleSheet,
//   ImageBackground,
//   Pressable,
//   TextInput,
//   Alert,
//   Button,
// } from "react-native";
// import React, { useEffect, useRef, useState } from "react";
// import MQTTConnection from './MQTTConnections'
// import {Buffer} from 'buffer';
// global.Buffer = Buffer;

// const app = () => {

//   const ip = "192.168.1.10";
//   const port = 8083;

//   const [interval, setInterval] = useState("");
//   const [mac, setMac] = useState("");
//   const [mqttClient, setMqttClient] = useState(false);
//   const [gpsActive, setGpsActive] = useState(false);
 
//   const mqttConnectRef = useRef<MQTTConnection>();

//   const onMQTTConnect = () => {
//     console.log('App onMQTTConnect');
//     setMqttClient(true);
//     mqttConnectRef.current?.subscribeChannel('abcd');
//   };

//   const onMQTTLost = () => {
//     setMqttClient(false);
//     console.log('App onMQTTLost');
//   };

//   const onMQTTMessageArrived = (message: any) => {
//     console.log('Message arrived', message);
//   };

//   const onMQTTMessageDelivered = (message: any) => {
//     console.log('Message delivered', message);
//   };

//   useEffect(()=>{
//     mqttConnectRef.current = new MQTTConnection()
//     mqttConnectRef.current.onMQTTConnect = onMQTTConnect
//     mqttConnectRef.current.onMQTTLost = onMQTTLost
//     mqttConnectRef.current.onMQTTMessageArrived = onMQTTMessageArrived
//     mqttConnectRef.current.onMQTTMessageDelivered = onMQTTMessageDelivered;

//     mqttConnectRef.current.connect(ip, port);

//     return () => {
//       mqttConnectRef.current?.close();
//     };
//   }, []);

//   const handlePress = () => {
//     if(mqttClient){
//       mqttConnectRef.current?.close();
//       setMqttClient(false);
//     }else{
//       mqttConnectRef.current?.connect(ip,port);
//     }
//   };



//   return (
//     <ImageBackground
//       source={require("@/assets/images/react-logo.png")}
//       resizeMode="cover"
//       style={styles.image}
//     >
//       <View style={styles.container}>
//         {/* Interval Input */}
//         <Text style={styles.title}>MQTT Connections:</Text>
//         <Text style={styles.title}>Interval</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter interval (e.g., 5000)"
//           keyboardType="numeric"
//           value={interval}
//           onChangeText={setInterval}
//           defaultValue="5"
//         />

//         {/* MAC Address Input */}
//         <Text style={styles.title}>MAC Address</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter MAC (e.g., 00:1A:7D:DA:71:13)"
//           autoCapitalize="characters"
//           value={mac}
//           onChangeText={setMac}
//           defaultValue="00:1A:7D:DA:71:13"
//         />
//         {/* Button MQTT */}
        
//       <Pressable style={styles.button} onPress={handlePress}>
//         <Text style={styles.buttonText}>
//           {mqttClient ? "Disconnect MQTT" : "Connect MQTT"}
//         </Text>
//       </Pressable>

//       {/* Button GPS */}
//       <Pressable style={styles.button} onPress={handlePress} disabled={!mqttClient}>
//         <Text style={styles.buttonText}>
//           {gpsActive ? "Stop GPS" : "Start GPS"}
//         </Text>
//       </Pressable>
       
//       </View>
//     </ImageBackground>
//   );
// };

// export default app;

// const styles = StyleSheet.create({
//   input: {
//     height: 48,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 20,
//     backgroundColor: "#fff",
//   },
//   container: {
//     flex: 1,
//     flexDirection: "column",

//     justifyContent: 'center',
//     marginHorizontal: 20,
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//     flex: 1,
//     resizeMode: "cover",
//     justifyContent: "center",
//   },
//   link: {
//     color: "white",
//     fontSize: 42,
//     fontWeight: "bold",
//     textAlign: "center",
//     textDecorationLine: "underline",
//     backgroundColor: "rgba(0,0,0,0.5)",
//     padding: 4,
//   },

//   title: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 4,
//     color: "#333",
//   },
//   button: {
//     backgroundColor: "#1E90FF",
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginBottom: 20,
//     alignItems: "center",
    
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 16,
//     fontWeight: "600",
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//   },
// });


