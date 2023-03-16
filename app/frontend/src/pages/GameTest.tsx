import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import PopUpMenu from "../popups/PopUpMenu";
import styled from 'styled-components';
import { io } from 'socket.io-client';
import { BufferGeometry, Vector3 } from 'three';
import { once } from 'events';

// function convert(degrees) {
//   var pi = Math.PI;
//   return degrees * (pi/180);
// }

function convert(degrees: number): number {
	return (degrees * (Math.PI / 180));
}

class Vec2 {
	x: number;
	y: number;
}

class BallData {
	pos: Vec2 = new Vec2;
	direction: Vec2 = new Vec2;
	speed: number;
}

class PaddleData {
	pos: Vec2 = new Vec2;
}

class GameBounds {
	width: number;
	height: number;
}

class GameData {
	last_update_time: number;
	is_new_round: boolean;
	last_serve_side: string;
	bounds: GameBounds = new GameBounds;
	ball: BallData = new BallData;
	paddle_left: PaddleData = new PaddleData;
	paddle_right: PaddleData = new PaddleData;
}

// function renderBall(ballData: BallData, mesh: React.MutableRefObject<THREE.Mesh<BufferGeometry, THREE.Material | THREE.Material[]>>) {
// 	mesh.current.position.x = ballData.pos.x;
// 	mesh.current.position.y = ballData.pos.y;
// 	mesh.current.position.z = 0;
// }

//Create ball object
function Ball() {
	const mesh = useRef<THREE.Mesh>(null!);
	let ballData: BallData;
	let x = 0;
	let y = 0;

	let fuckyou = 0;


	//Connect client socket to backend
	const socket = io("http://localhost:3000");
	if (!fuckyou) {
		socket.emit('gameStart');
		fuckyou = 1;
	}
	socket.on('serverUpdate', (data: GameData) => {
		console.log(data);
		ballData = data.ball;
	})

	x = ballData.pos.x;
	y = ballData.pos.y;

	// const x: number = ballData.pos.x;
	// const y: number = ballData.pos.y;
	// useFrame(renderBall.bind(ballData, mesh));
	useFrame(() => {
		mesh.current.position.x = x;
		mesh.current.position.y = y;
		mesh.current.position.z = 0;
	});

	return (
		<mesh ref={mesh}>
			<sphereGeometry args={[0.5]} />
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
			ref={mesh}>
			<planeGeometry args={[6, 4]} />
			<meshStandardMaterial color='blue' />
		</mesh>
	)
}

// function Circle() {
// 	const mesh = useRef<THREE.Mesh>(null!);
// 	let ballRot = 0;
// 	//Connect client socket to backend
// 	const socket = io("http://localhost:3000");
// 	socket.emit('gameStart');
// 	socket.on('serverUpdate', (data) => {
// 		if (ballRot === 90)
// 			socket.emit('gameEnd');
// 		else {
// 			console.log("rot update " + data.rot);
// 			ballRot = data.rot
// 		}
// 	})


// 	useFrame(() => {
// 		mesh.current.rotation.z = convert(ballRot);
// 	});

// 	return (
// 		<mesh
// 			ref={ mesh }
// 			>
// 			<circleGeometry args={[0.1]} />
// 				<mesh position={new Vector3(-1,0,0)} >
// 					<circleGeometry args={[0.5]} />
// 					<meshStandardMaterial color="red" />
// 				</mesh>
// 		</mesh>
// 	)
// }



//Div styling for game frame
const GameWindow = styled.div`
	height: 100vh;
	width: 100vw;
	color: #fff;
`;




//Main game frame
export default function Game() {

	return (
		<>
			<GameWindow>
				<Canvas>
					<Ball />
					{/* <Border /> */}
					<ambientLight args={[0xff0000]} intensity={0.1} />
					<directionalLight position={[0, 5, 3]} intensity={0.5} />
				</Canvas>
			</GameWindow>
		</>
	);
}



