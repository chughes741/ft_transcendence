import React, { useRef, useContext, useEffect } from "react";
import { Canvas, useFrame, ThreeElements, useThree } from "@react-three/fiber";
import { socket } from "src/contexts/WebSocket.context";
//Local includes
import { GameStateDto } from "./game.types";
import { BallConfig, GameColours, PaddleConfig } from "./game.config";
import { Mesh } from "three";
import { ServerGameStateUpdateEvent, GameEvents, GameState} from "kingpong-lib"
import { useGameViewModelContext } from "./game.viewModel";
import { useRootViewModelContext } from "src/root.context";
/**
 *
 * @param gameState
 * @returns
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
      <meshPhongMaterial color={GameColours.ball} />
    </mesh>
  );
}

// export declare class ClientGameStateUpdateRequest {
//   match_id: string;
//   lobby_id: string;
//   username: string;
//   paddle_position: number;
// }

/**
 *
 * @param gameState
 * @returns
 */
function PaddleLeft() {
  const ref = useRef<Mesh>(null!);
  const {playerSide, lobbyId, gameState} = useGameViewModelContext();
  const { self } = useRootViewModelContext();
  // Update paddle position based on mouse position
  // state.pointer gives a value between -1 and 1, so need to multiply by the gamePlayArea / 2 to get proper position
  useFrame((state) => {
    if (playerSide === "left") {
      ref.current.position.y = state.pointer.y * 4;
      socket.emit(GameEvents.ClientGameStateUpdate, {
        match_id: lobbyId,
        lobby_id: lobbyId,
        username: self.username,
        paddle_position: state.pointer.y
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
 *
 * @param gameState
 * @returns
 */
function PaddleRight() {
  const ref = useRef<Mesh>(null!);
  const {playerSide, lobbyId, gameState} = useGameViewModelContext();
  const { self } = useRootViewModelContext();

  useFrame((state) => {
    if (playerSide === "right") {
      ref.current.position.y = state.pointer.y * 4;
      socket.emit(GameEvents.ClientGameStateUpdate, {
        match_id: lobbyId,
        lobby_id: lobbyId,
        username: self.username,
        paddle_position: state.pointer.y
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

  const { gameState, setGameState } = useGameViewModelContext();

  socket.on(GameEvents.ServerGameStateUpdate, (payload: GameState) => {
    setGameState(payload);
  });
  // useEffect(() => {
  //   socket.on(GameEvents.ServerGameStateUpdate, (payload: GameState) => {
  //     gamestate.ball_pos_x = payload.ball_x;
  //     gamestate.ball_pos_y = payload.ball_y;
  //     // gameState.match_id = payload.game_state.match_id;
  //     gamestate.paddle_left_pos = payload.paddle_left_y;
  //     gamestate.paddle_right_pos = payload.paddle_right_y;
  //   });

  //   return () => {
  //     socket.off(GameEvents.ServerGameStateUpdate);
  //   };
  // }, [gamestate]);

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


  //Get local copy of socket
  // const socket = useContext(WebSocketContext);
  // let gameState: GameData = new GameData();
  // socket.on("serverUpdate", (GameState: GameData) => {
  //   console.log(GameState);
  //   gameState = GameState;
  // });