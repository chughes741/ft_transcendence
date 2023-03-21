import React, { useRef, useContext } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import styled from "styled-components";
import { WebSocketContext } from "src/contexts/WebSocketContext";
//Local includes
import { GameData } from "./game.types";
import {
  BallConfig,
  GameColours,
  GameConfig,
  PaddleConfig
} from "./game.config";
import { Vector3 } from "three";

//Create ball object
function Ball(gameState: GameData) {
  const mesh = useRef<THREE.Mesh>();

  useFrame(() => {
    mesh.current.position.x = gameState.ball.pos.x;
    mesh.current.position.y = gameState.ball.pos.y;
    mesh.current.position.z = 0;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[BallConfig.radius]} />
      <meshPhongMaterial color={GameColours.ball} />
    </mesh>
  );
}

//Create paddle objetcs
function PaddleLeft() {
  const mesh = useRef<THREE.Mesh>();
  return (
    <mesh>
      <boxGeometry
        args={[PaddleConfig.width, PaddleConfig.height, PaddleConfig.depth]}
      />
      <meshPhongMaterial color={GameColours.paddle} />
    </mesh>
  );
}

function PaddleRight() {
  const mesh = useRef<THREE.Mesh>(null!);
  return (
    <mesh>
      <boxGeometry
        args={[PaddleConfig.width, PaddleConfig.height, PaddleConfig.depth]}
      />
      <meshPhongMaterial color={GameColours.paddle} />
    </mesh>
  );
}

//Create window border object
function Border() {
  const mesh = useRef<THREE.Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={new Vector3(0, 0, GameConfig.backgroundZOffset)}
    >
      <planeGeometry
        args={[GameConfig.playAreaWidth, GameConfig.playAreaHeight]}
      />
      <meshStandardMaterial color={GameColours.background} />
    </mesh>
  );
}

//Div styling for game frame
const GameWindow = styled.div`
  height: 50vh;
  width: 60vw;
  color: #fff;
  position: centered;
  background: red;
`;

//Main game frame
export default function Game() {
  //Get local copy of socket
  const socket = useContext(WebSocketContext);
  let gameState: GameData = new GameData();
  socket.on("serverUpdate", (GameState: GameData) => {
    console.log(GameState);
    gameState = GameState;
  });
  return (
    <>
      <GameWindow>
        <Canvas>
          <Ball {...gameState} />
          <Border />
          <ambientLight
            args={[0xffffff]}
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
