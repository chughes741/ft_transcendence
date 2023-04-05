import React, { useRef, useContext } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { WebSocketContext } from "src/contexts/WebSocketContext";
import { socket } from "src/contexts/WebSocketContext";
//Local includes
import { GameStateDto, ClientGameStateUpdate } from "./game.types";
import {
  BallConfig,
  GameColours,
  GameConfig,
  PaddleConfig
} from "./game.config";

//Create ball object
function Ball(gameState: GameStateDto) {
  const mesh = useRef<THREE.Mesh>();

  useFrame(() => {
    mesh.current.position.x = 0;
    mesh.current.position.y = 0;
    // mesh.current.position.x = gameState.ball_pos.x;
    // mesh.current.position.y = gameState.ball_pos.y;
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
function PaddleLeft(gameState: GameStateDto) {
  const mesh = useRef<THREE.Mesh>();

  //Update paddle position based on mouse position
  //state.pointer gives a value between -1 and 1, so need to multiply by the gameplayarea / 2 to get proper position
  useFrame((state) => {
    if (gameState.player_side === "left") {
      mesh.current.position.y = state.pointer.y * 4;
      socket.emit("clientGameStateUpdate", {
        match_id: gameState.match_id,
        player_side: gameState.player_side,
        paddle_pos: state.pointer.y
      });
    } else {
      mesh.current.position.y = gameState.paddle_left_pos;
    }
  });
  return (
    <mesh
      ref={mesh}
      position={[-7, 0, 0]}
    >
      <boxGeometry
        args={[PaddleConfig.width, PaddleConfig.height, PaddleConfig.depth]}
      />
      <meshPhongMaterial color={GameColours.paddle} />
    </mesh>
  );
}

function PaddleRight(gameState: GameStateDto) {
  const mesh = useRef<THREE.Mesh>();
  useFrame((state) => {
    if (gameState.player_side === "right") {
      mesh.current.position.y = state.pointer.y * 4;
      socket.emit("clientGameStateUpdate", {
        match_id: gameState.match_id,
        player_side: gameState.player_side,
        paddle_pos: state.pointer.y
      });
    } else {
      mesh.current.position.y = gameState.paddle_right_pos;
    }
  });
  return (
    <mesh position={[7, 0, 0]}>
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
      position={[0, 0, 0]}
    >
      <planeGeometry args={[16, 8]} />
      <meshStandardMaterial color={GameColours.background} />
    </mesh>
  );
}


//Main game frame
export default function Game() {
  let gameState: GameStateDto;

  socket.on("serverUpdate", (GameState: GameStateDto) => {
    console.log(GameState);
    gameState = GameState;
  });
  return (
    <Canvas>
      <Ball {...gameState} />
      <Border />
      <PaddleLeft {...gameState} />
      <PaddleRight {...gameState} />
      <ambientLight
        args={[0xffffff]}
        intensity={0.1}
      />
      <directionalLight
        position={[0, 5, 3]}
        intensity={0.5}
      />
    </Canvas>
  );
}
