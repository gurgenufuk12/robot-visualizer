import { useEffect, useState, useRef } from "react";

const useROS2Bridge = (
  url = "ws://localhost:9090",
  topic = "/joint_states"
) => {
  const [jointStates, setJointStates] = useState<{ [key: string]: number }>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log("Connected to ROSBridge WebSocket");
        setIsConnected(true);

        // `joint_states` topic'ine abone ol
        const subscribeMessage = {
          op: "subscribe",
          topic: topic,
          type: "sensor_msgs/msg/JointState",
        };
        wsRef.current?.send(JSON.stringify(subscribeMessage));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.topic === topic && data.msg) {
          const newJointStates: { [key: string]: number } = {};
          data.msg.name.forEach((jointName: string, index: number) => {
            newJointStates[jointName] = data.msg.position[index]; // Gelen açıları kaydet
          });
          setJointStates(newJointStates);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current.onclose = () => {
        console.log("Disconnected from ROSBridge WebSocket");
        setIsConnected(false);
        setTimeout(() => connectWebSocket(), 3000); // Bağlantı koparsa 3 saniye sonra tekrar dene
      };
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, [url, topic]);

  // Bağlantıyı manuel kapatma
  const closeConnection = () => {
    wsRef.current?.close();
  };

  return { jointStates, isConnected, closeConnection };
};

export default useROS2Bridge;
