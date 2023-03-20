import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import styled from 'styled-components';
import { WebsocketContext } from 'src/contexts/WebsocketContext';
//Local includes
import { GameData } from './game.types';


//Init game
function initGameState(): GameData {
	const gameState: GameData = new GameData;
	gameState.last_update_time = Date.now();
	gameState.is_new_round = true;
	gameState.last_serve_side = 'left';
	gameState.bounds.width = 6;
	gameState.bounds.height = 4;
	gameState.ball.direction.x = 0;
	gameState.ball.direction.y = 0;
	gameState.ball.pos.x = 0;
	gameState.ball.pos.y = 0;
	gameState.ball.speed = 0;
	gameState.paddle_left.pos.x = 0;
	gameState.paddle_left.pos.y = 0;
	gameState.paddle_right.pos.x = 0;
	gameState.paddle_right.pos.y = 0;

	return gameState;
}


//Create ball object
function Ball() {
	const mesh = useRef<THREE.Mesh>(null!);
	let gameState: GameData = initGameState();
	//Connect client socket to backend
	socket.on('serverUpdate', async (GameState: GameData) => {
		console.log(GameState);
		gameState = await GameState;
	});

	//FIXME: hook runs before data has been received from server, need to handle this
	useFrame(() => {
		mesh.current.position.x = gameState.ball.pos.x;
		mesh.current.position.y = gameState.ball.pos.y;
		mesh.current.position.z = 0;
	});

	return (
		<mesh ref={mesh}>
			<sphereGeometry args={[0.1]} />
			<meshPhongMaterial color="white" />
		</mesh>
	)
}

//Create paddle objetcs
function PaddleLeft() {
	const mesh = useRef<THREE.Mesh>(null!);



	return (
		<mesh >
			<boxGeometry args={[1, 1, 1]} />
			<meshPhongMaterial color="red" />
		</mesh>
	)

}

function PaddleRight() {
	const mesh = useRef<THREE.Mesh>(null!);




	return (
		<mesh >
			<boxGeometry args={[1, 1, 1]} />
			<meshPhongMaterial color="red" />
		</mesh>
	)
}


//Create window border object
function Border(props: ThreeElements['mesh']) {
	const mesh = useRef<THREE.Mesh>(null!);

	return (
		<mesh
			{...props}
			ref={mesh}
			// translateZ={-1}
			>
			<planeGeometry args={[12, 8]} />
			<meshStandardMaterial color='black' />
		</mesh>
	)
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


	
	return (
		<>
			<GameWindow>
				<Canvas>
					<Ball />
					<Border />
					<ambientLight args={[0xffffff]} intensity={0.1} />
					<directionalLight position={[0, 5, 3]} intensity={0.5} />
				</Canvas>
			</GameWindow>
		</>
	);
}
