import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import PopUpMenu from "../popups/PopUpMenu";
import styled from 'styled-components';
import { io } from 'socket.io-client';
import { Vector3 } from 'three';

// function convert(degrees) {
//   var pi = Math.PI;
//   return degrees * (pi/180);
// }

function convert(degrees:number): number {
	return (degrees * (Math.PI / 180));
}


//Create ball object
function Ball() {
	const mesh = useRef<THREE.Mesh>(null!);
	let ballRot = 0;
	//Connect client socket to backend
	const socket = io("http://localhost:3000");
	socket.emit('startMove');
	socket.on('serverUpdate', (data) => {
		console.log("rot update " + data.rot);
		ballRot = data.rot;
	})
	useFrame(() => {
		// mesh.current.rotation.x = ballRot;
		mesh.current.rotateOnWorldAxis(new Vector3(1,0,0), ballRot);
	});

	return (
		<mesh
			ref = { mesh }
			position={new Vector3(-1,0,0)}>
			<boxGeometry args={[0.5, 0.5, 0.5]} />
			<meshPhongMaterial color="red" />
		</mesh>
	)
}

//Create window border object
function Border(props: ThreeElements['mesh']) {
	const mesh = useRef<THREE.Mesh>(null!);
	const [ hovered, setHover ] = useState(false);
	const [ active, setActive ] = useState(false);
	// useFrame((state, delta) => (mesh.current.rotation.x += delta))

	return (
		<mesh
			{ ...props }
			ref = { mesh }
			scale = { active ? 1.5 : 1 }
			onClick={(event) => setActive(!active)}
			onPointerOver={(event) => setHover(true)}
			onPointerOut={(event) => setHover(false)} 
			>
			<planeGeometry args={[6, 4]} />
			<meshStandardMaterial color={hovered ? 'green' : 'blue' } />
		</mesh>
	)
}

function Circle() {
	const mesh = useRef<THREE.Mesh>(null!);
	let ballRot = 0;
	//Connect client socket to backend
	const socket = io("http://localhost:3000");
	socket.emit('gameStart');
	socket.on('serverUpdate', (data) => {
		if ( ballRot === 90)
			socket.emit('gameEnd');
		else {
			console.log("rot update " + data.rot);
			ballRot = data.rot
		}
	})

	
	useFrame(() => {
		mesh.current.rotation.z = convert(ballRot);
	});

	return (
		<mesh
			ref={ mesh }
			>
			<circleGeometry args={[0.1]} />
				<mesh position={new Vector3(-1,0,0)} >
					<circleGeometry args={[0.5]} />
					<meshStandardMaterial color="red" />
				</mesh>
		</mesh>
	)
}



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
			<PopUpMenu id="popup" />
			<GameWindow>
				<Canvas>
					{/* <Border /> */}
					{/* <Ball /> */}
					<Circle />
					<ambientLight args={[0xff0000]} intensity={0.1} />
					<directionalLight position={[0, 5, 3]} intensity={0.5} />
				</Canvas>
			</GameWindow>
		</>
	);
}



