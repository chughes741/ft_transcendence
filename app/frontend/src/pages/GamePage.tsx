import { Canvas } from "@react-three/fiber";
import SideBar from "src/components/SideBar";

import styled from "styled-components";

const MyMesh = () => {
  return (
    <mesh>
      <sphereGeometry />
      <meshPhongMaterial
        color="hotpink"
        transparent
      />
    </mesh>
  );
};

const GameWindow = styled.div`
  height: 100vh;
  width: 100vw;
  color: #fff;
`;

export default function GamePage() {
  return (
    <>
      <GameWindow>
        <SideBar />
        <Canvas>
          <MyMesh />
          <ambientLight
            args={[0xff0000]}
            intensity={0.1}
          />
          <directionalLight
            position={[0, 5, 3]}
            intensity={0.5}
          />
        </Canvas>
      </GameWindow>
    </>
  );
}
