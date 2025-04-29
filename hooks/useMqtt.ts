import { useEffect, useState, useRef } from "react";
import type { IClientOptions } from "mqtt";
import mqtt from "mqtt";

class MqttService {
  public client: mqtt.MqttClient | null = null;
  public isConnected: boolean = false;
  private subscribedTopics: Set<string> = new Set(); // Track subscribed topics
  private subscriptionQueue: string[] = []; // Queue for topics to subscribe to when connected

  async connect(options?: IClientOptions) {
    // Check if running in the browser, if not, do nothing
    if (typeof window === "undefined") {
      console.error("MQTT cannot be connected on the server side");

      return;
    }

    if (!this.client) {
      this.client = mqtt.connect(options || {});

      this.client.on("connect", () => {
        console.log("Connected to MQTT broker successfully.");
        this.isConnected = true;

        // Process the subscription queue after connection
        this.subscriptionQueue.forEach((topic) => this.subscribe(topic));
        this.subscriptionQueue = []; // Clear queue after processing
      });

      this.client.on("error", (err) => {
        console.error("Error while connecting to MQTT broker", err);
        this.isConnected = false;
      });

      this.client.on("close", () => {
        console.log("Connection to MQTT broker closed.");
        this.isConnected = false;
      });

      // this.client.on('message', (topic, message) => {
      //   console.log(`Received message: ${message.toString()} on topic: ${topic}`)
      // })
    }
  }

  subscribe(topic: string) {
    console.log(
      "Trying to subscribe:",
      topic,
      this.client,
      this.isConnected,
      !this.subscribedTopics.has(topic)
    );

    if (this.client && this.isConnected && !this.subscribedTopics.has(topic)) {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscribe error:", err);
        } else {
          console.log(`Subscribed to topic: ${topic}`);
          this.subscribedTopics.add(topic); // Add topic to set to avoid multiple subscriptions
        }
      });
    } else if (!this.isConnected) {
      // Queue subscription if the client isn't connected yet
      console.log(`Queueing subscription for topic: ${topic}`);
      this.subscriptionQueue.push(topic);
    } else if (this.subscribedTopics.has(topic)) {
      console.log(`Already subscribed to topic: ${topic}`);
    }
  }

  publish(topic: string, message: string) {
    if (this.client && this.isConnected) {
      this.client.publish(topic, message, (err) => {
        if (err) {
          console.error("Publish error:", err);
        } else {
          console.log(`Published message: ${message} to topic: ${topic}`);
        }
      });
    } else {
      console.error("Cannot publish: Client is not connected or disconnecting");
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
    }
  }

  getClient() {
    return this.client;
  }
}

export const mqttService = new MqttService();

interface TopicHandlers {
  [topic: string]: (
    topicParts: { [key: string]: string[] },
    message: string,
    meta?: any
  ) => void;
}

interface Messages {
  [topic: string]: string;
}

const useMqtt = (
  topicHandlers: TopicHandlers,
  options?: IClientOptions,
  meta?: any
) => {
  const [messages, setMessages] = useState<Messages>({});
  const isInitialized = useRef(false); // Track if the hook has already been initialized

  const metaRef = useRef(meta);

  const defaultOptions: IClientOptions = {
    keepalive: 600,
    clean: true,
    username: "",
    password: "",
    protocol: "wss",
    path: "/mqtt",
    host: "broker.emqx.io",
    port: 8084,
    connectTimeout: 10000,
    will:{
        topic:"eio/disconnect",
        payload:"My name is parth" 
    }
  };

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  useEffect(() => {
    // Ensure code only runs on the client side
    if (typeof window === "undefined") {
      return;
    }

    if (isInitialized.current) return; // Prevent multiple initializations
    isInitialized.current = true; // Mark as initialized

    // Clean up on unmount
    return () => {
      //mqttService.disconnect()
      //console.log('Disconnected from MQTT broker.')
    };
  }, [defaultOptions, options, topicHandlers]); // Only run effect when these change

  const connect = () => {
    // Connect to the MQTT broker
    mqttService
      .connect({ ...defaultOptions, ...options })
      .then(() => {
        console.log("MQTT Service connected.");

        // Subscribe to the topics dynamically based on topicHandlers
        Object.keys(topicHandlers).forEach((topic) => {
          mqttService.subscribe(topic);
        });

        // Handle incoming messages
        mqttService.getClient()?.on("message", (topic, message) => {
          //console.log(`Received message: ${message.toString()} on topic: ${topic}`)

          // Handle the topic with wildcards and pass topic parts and message
          Object.keys(topicHandlers).forEach((pattern) => {
            // Use a simple method to check if the topic matches the wildcard pattern
            if (matchTopicWithWildcard(topic, pattern)) {
              const topicParts = splitTopicWithWildcards(topic, pattern);
              const handler = topicHandlers[pattern];

              if (handler) {
                handler(topicParts, message.toString(), metaRef.current); // Pass both topic parts and the message
                //setMessages(() => ({ [topic]: message.toString() }))
              }
            }
          });

          // Optionally, update the messages state to store all received messages
          //setMessages(() => ({ [topic]: message.toString() }))
        });
      })
      .catch((error) => {
        console.error("Error connecting to MQTT broker:", error);
      });
  };

  const disconnect = () => {
    if (mqttService.isConnected) {
      mqttService.disconnect();
    }
  };

  const publish = (topic: string, msg: string): void => {
    mqttService.publish(topic, msg);
  };

  return { messages, publish, connect, disconnect };
};

// Helper function to check if the topic matches a wildcard pattern
const matchTopicWithWildcard = (topic: string, pattern: string): boolean => {
  const topicParts = topic.split("/");
  const patternParts = pattern.split("/");

  // Ensure both arrays have the same length or pattern has a multi-level wildcard at the end
  if (patternParts.length > topicParts.length) {
    return false;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const topicPart = topicParts[i];

    if (patternPart === "+") {
      // Single-level wildcard matches any value at this level
      continue;
    } else if (patternPart === "#") {
      // Multi-level wildcard matches any remaining levels
      return true;
    } else if (patternPart !== topicPart) {
      return false;
    }
  }

  return patternParts.length === topicParts.length;
};

// Helper function to split the topic based on the wildcard pattern
const splitTopicWithWildcards = (
  topic: string,
  pattern: string
): { [key: string]: string[] } => {
  const topicParts = topic.split("/");
  const patternParts = pattern.split("/");
  const topicValues: { [key: string]: string[] } = {};

  patternParts.forEach((part, index) => {
    const topicPart = topicParts[index];

    if (part === "+") {
      // When + is present, capture the corresponding part as an array (even if only one)
      topicValues[part] = [...(topicValues[part] || []), topicPart]; // Always return an array
    } else if (part === "#") {
      // When # is present, capture all remaining parts as an array
      topicValues["#"] = topicParts.slice(index); // Everything after # is captured as an array
    }
  });

  return topicValues;
};

export default useMqtt;
