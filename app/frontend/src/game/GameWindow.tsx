import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { socket } from "src/contexts/WebSocket.context";
//Local includes
import { GameStateDto } from "./game.types";
import { BallConfig, GameColours, PaddleConfig } from "./game.config";
import { Mesh } from "three";
import GameLoader from "./components/GameLoader";

/**
 *
 * @param gameState
 * @returns
 */
function Ball(gameState: GameStateDto) {
  const mesh = useRef<Mesh>();

  useFrame(() => {
    mesh.current.position.x = gameState.ball_pos_x;
    mesh.current.position.y = gameState.ball_pos_y;
    mesh.current.position.z = 0;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[BallConfig.radius]} />
      <meshPhongMaterial color={GameColours.ball} />
    </mesh>
  );
}

/**
 *
 * @param gameState
 * @returns
 */
function PaddleLeft(gameState: GameStateDto) {
  const ref = useRef<Mesh>(null!);

  // Update paddle position based on mouse position
  // state.pointer gives a value between -1 and 1, so need to multiply by the gamePlayArea / 2 to get proper position
  useFrame((state) => {
    if (gameState.player_side === "left") {
      ref.current.position.y = state.pointer.y * 4;
      socket.emit("clientGameStateUpdate", {
        match_id: gameState.match_id,
        player_side: gameState.player_side,
        paddle_pos: state.pointer.y
      });
    } else {
      ref.current.position.y = gameState.paddle_left_pos;
    }
  });
  return (
    <mesh
      ref={ref}
      position={[-7, 0, 0]}
    >
      <boxGeometry
        args={[PaddleConfig.width, PaddleConfig.height, PaddleConfig.depth]}
      />
      <meshPhongMaterial color={GameColours.paddle} />
    </mesh>
  );
}

/**
 *
 * @param gameState
 * @returns
 */
function PaddleRight(gameState: GameStateDto) {
  const ref = useRef<Mesh>(null!);
  const get = useThree((state) => state.get);

  useFrame(() => {
    if (gameState.player_side === "right") {
      ref.current.position.y = get().pointer.y * 4;
      socket.emit("clientGameStateUpdate", {
        match_id: gameState.match_id,
        player_side: gameState.player_side,
        paddle_pos: ref.current.position.y
      });
    } else {
      ref.current.position.y = gameState.paddle_right_pos;
    }
  });
  return (
    <mesh
      ref={ref}
      position={[7, 0, 0]}
    >
      <boxGeometry
        args={[PaddleConfig.width, PaddleConfig.height, PaddleConfig.depth]}
      />
      <meshPhongMaterial color={GameColours.paddle} />
    </mesh>
  );
}

//Create window border object
function Floor() {
  const mesh = useRef<Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={[0, 0, -5]}
    >
      <planeGeometry args={[50, 30]} />
      <meshStandardMaterial color={GameColours.background} />
    </mesh>
  );
}

function OuterFrameTop() {
  const mesh = useRef<Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={[0, 3.7, 0]}
    >
      <boxGeometry args={[18, 0.25, 0.5]} />
      <meshPhongMaterial color={"red"} />
    </mesh>
  );
}

function OuterFrameBottom() {
  const mesh = useRef<Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={[0, -3.7, 0]}
    >
      <boxGeometry args={[18, 0.25, 0.5]} />
      <meshPhongMaterial color={"red"} />
    </mesh>
  );
}

function OuterFrameLeft() {
  const mesh = useRef<Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={[-7.5, 0, 0]}
    >
      <boxGeometry args={[0.25, 18, 0.5]} />
      <meshPhongMaterial color={"blue"} />
    </mesh>
  );
}

function OuterFrameRight() {
  const mesh = useRef<Mesh>(null!);
  return (
    <mesh
      ref={mesh}
      position={[7.5, 0, 0]}
    >
      <boxGeometry args={[0.25, 18, 0.5]} />
      <meshPhongMaterial color={"blue"} />
    </mesh>
  );
}

/**
 * Render the game display object
 * @returns
 */
export default function Game() {
  let gameState: GameStateDto = new GameStateDto("", "right", 0, 0, 0, 0);

  socket.on("serverUpdate", (GameState: GameStateDto) => {
    console.log(GameState);
    gameState = GameState;
  });
  return (
    <>
      <Canvas>
        {/* Gameplay Objects */}
        <Ball {...gameState} />
        <PaddleLeft {...gameState} />
        <PaddleRight {...gameState} />

        {/* Scene Objects */}
        <Floor />
        <OuterFrameTop />
        <OuterFrameBottom />
        <OuterFrameLeft />
        <OuterFrameRight />

        {/* Lighting */}
        <ambientLight
          args={[0xffffff]}
          intensity={0.1}
        />
        <directionalLight
          position={[0, 5, 3]}
          intensity={0.5}
        />
      </Canvas>
      <GameLoader />
    </>
  );
}
