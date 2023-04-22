import React, { useRef, useContext, useEffect } from "react";
import { Canvas, useFrame, ThreeElements, useThree } from "@react-three/fiber";
import { Mesh } from "three";

import { socket } from "src/contexts/WebSocket.context";
import { useRootViewModelContext } from "src/root.context";
import { useGameViewModelContext } from "./game.viewModel";
import { BallConfig, GameColours, PaddleConfig } from "./game.config";
import { GameEndedEvent, GameEvents, GameState } from "kingpong-lib";

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
function Ball() {
  const mesh = useRef<Mesh>();
  const { gameState } = useGameViewModelContext();

  useFrame(() => {
    console.log(gameState);
    mesh.current.position.x = gameState.ball_x;
    mesh.current.position.y = gameState.ball_y;
    mesh.current.position.z = 0;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[BallConfig.radius]} />
      <meshStandardMaterial
        emissive={"orange"}
        emissiveIntensity={50}
      />
    </mesh>
  );
}

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
function PaddleLeft() {
  const { self } = useRootViewModelContext();
  const { playerSide, lobbyId, gameState } = useGameViewModelContext();

  const ref = useRef<Mesh>(null!);

  /** Update paddle position based on mouse position
   *    state.pointer gives a value between -1 and 1,
   *    so need to multiply by the gamePlayArea / 2 to get proper position */
  useFrame((state) => {
    if (playerSide === "left") {
      ref.current.position.y = state.pointer.y * 4;
      socket.emit(GameEvents.ClientGameStateUpdate, {
        match_id: lobbyId,
        lobby_id: lobbyId,
        username: self.username,
        paddle_position: state.pointer.y * 4
      });
    } else {
      ref.current.position.y = gameState.paddle_left_y;
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
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
function PaddleRight() {
  const { self } = useRootViewModelContext();
  const { playerSide, lobbyId, gameState } = useGameViewModelContext();

  const ref = useRef<Mesh>(null!);

  useFrame((state) => {
    if (playerSide === "right") {
      ref.current.position.y = state.pointer.y * 4;
      socket.emit(GameEvents.ClientGameStateUpdate, {
        match_id: lobbyId,
        lobby_id: lobbyId,
        username: self.username,
        paddle_position: state.pointer.y * 4
      });
    } else {
      ref.current.position.y = gameState.paddle_right_y;
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

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
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

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
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

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
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

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
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

/**
 * Render the game display object
 *
 * @returns {JSX.Element}
 */
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
 *
 * @returns {JSX.Element}
 */
export default function Game() {
  const { gameState, setGameState, setScoreLeft, setScoreRight, displayLobby } =
    useGameViewModelContext();

  useEffect(() => {
    socket.on(GameEvents.ServerGameStateUpdate, (payload: GameState) => {
      setGameState(payload);
      setScoreLeft(payload.score_left);
      setScoreRight(payload.score_right);
    });

    socket.on(GameEvents.GameEnded, (payload: GameEndedEvent) => {
      setGameState(payload.game_state);
      setScoreLeft(payload.game_state.score_left);
      setScoreRight(payload.game_state.score_right);
    });

    return () => {
      socket.off(GameEvents.ServerGameStateUpdate);
      socket.off(GameEvents.GameEnded);
    };
  }, [displayLobby]);

  if (!gameState) return <div>Loading...</div>;

  return (
    <Canvas>
      {/* Gameplay Objects */}
      <Ball />
      <PaddleLeft />
      <PaddleRight />

      {/* Scene Objects */}
      <Floor />
      {/* <OuterFrameTop />
      <OuterFrameBottom />
      <OuterFrameLeft />
      <OuterFrameRight /> */}

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
  );
}
