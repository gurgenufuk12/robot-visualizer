"use client";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import useROS2Bridge from "../hooks/useROS2Bridge";

const SetCameraPosition = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1, 3); // Kamerayı biraz yukarı ve ileri al
  }, [camera]);
  return null;
};

const URDFViewer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [robot, setRobot] = useState<THREE.Object3D | null>(null);
  const { jointStates, isConnected } = useROS2Bridge();
  console.log("🚀 ~ jointStates:", jointStates);

  useEffect(() => {
    const loader = new URDFLoader();
    setLoading(true);
    loader.load("/robot.urdf", (robot) => {
      robot.position.set(0, 0, 0); // Robotu merkeze yerleştir
      robot.rotation.set(-Math.PI / 2, 0, 0);
      robot.up.set(0, 0, 1);
      setRobot(robot);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    if (robot) {
      Object.keys(jointStates).forEach((jointName) => {
        const joint = robot.getObjectByName(jointName);
        if (joint) {
          if (jointName === "J2") {
            joint.rotation.z = jointStates[jointName] + Math.PI / 2;
          } else {
            joint.rotation.z = jointStates[jointName];
          }
        }
      });
    }
  }, [jointStates, robot]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <p className="text-black">
        WebSocket: {isConnected ? "Bağlı" : "Bağlı değil"}
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Canvas>
          <SetCameraPosition />
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enableZoom enableRotate />

          {/* GridHelper: 10x10 bir grid, her kare 1 birim */}
          <gridHelper args={[10, 10]} />

          {robot ? <primitive object={robot} /> : null}
        </Canvas>
      )}
    </div>
  );
};

export default URDFViewer;
