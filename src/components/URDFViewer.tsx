"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import URDFLoader from "urdf-loader";
import useROS2Bridge from "../hooks/useROS2Bridge";

function CameraViewButtons({
  setCameraPosition,
  setPositionName,
  positionName,
}: {
  setCameraPosition: (pos: THREE.Vector3) => void;
  setPositionName: (name: string) => void;
  positionName: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
      }}
    >
      <div className="flex gap-2">
        <button
          onClick={() => {
            setCameraPosition(new THREE.Vector3(0, 3, 6));
            setPositionName("Front");
          }}
          className="text-black"
        >
          Front
        </button>
        <button
          onClick={() => {
            setCameraPosition(new THREE.Vector3(0, 3, -6));
            setPositionName("Back");
          }}
          className="text-black"
        >
          Back
        </button>
        <button
          onClick={() => {
            setCameraPosition(new THREE.Vector3(-6, 3, 0));
            setPositionName("Left");
          }}
          className="text-black"
        >
          Left
        </button>
        <button
          onClick={() => {
            setCameraPosition(new THREE.Vector3(6, 3, 0));
            setPositionName("Right");
          }}
          className="text-black"
        >
          Right
        </button>
      </div>
      <span className="text-red-600">Camera Position :{positionName}</span>
    </div>
  );
}

const CameraController: React.FC<{ cameraPosition: THREE.Vector3 }> = ({
  cameraPosition,
}) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    camera.position.copy(cameraPosition);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    if (controls) {
      const orbitControls = controls as OrbitControls;
      orbitControls.target.set(0, 0, 0);
      orbitControls.update();
    }
  }, [cameraPosition, camera, controls]);

  return null;
};

const URDFViewer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [robot, setRobot] = useState<THREE.Object3D | null>(null);
  const { jointStates, isConnected } = useROS2Bridge();
  const [cameraPosition, setCameraPosition] = useState(
    new THREE.Vector3(0, 3, 6)
  );
  const [positionName, setPositionName] = useState("Front");

  useEffect(() => {
    const loader = new URDFLoader();
    setLoading(true);
    loader.load("/robot.urdf", (robotModel) => {
      robotModel.position.set(0, 0, 0);
      robotModel.rotation.set(-Math.PI / 2, 0, 0);
      robotModel.up.set(0, 0, 1);
      setRobot(robotModel);
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
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <p className="text-black">
        WebSocket: {isConnected ? "Bağlı" : "Bağlı değil"}
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <CameraViewButtons
            setCameraPosition={setCameraPosition}
            setPositionName={setPositionName}
            positionName={positionName}
          />

          <Canvas>
            <CameraController cameraPosition={cameraPosition} />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls makeDefault />
            {robot ? <primitive object={robot} /> : null}
            <gridHelper args={[10, 10]} />
          </Canvas>
        </>
      )}
    </div>
  );
};

export default URDFViewer;
