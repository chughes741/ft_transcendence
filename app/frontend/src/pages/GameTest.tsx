import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

import styled from 'styled-components';

// const FrameCounter = () => {


// 	return (
// 		<mesh>
// 			<boxGeometry />

// 		</mesh>
// 	)
// }

const MyMesh = () => {
	// useFrame(({ clock }) => {
	// 	const a = clock.getElapsedTime()
	// 	console.log(a)
	// })
	return (
		<mesh>
			<sphereGeometry />
			<meshPhongMaterial color="hotpink" transparent />
		</mesh>
	)
}

const GameWindow = styled.div`
	height: 80vh;
	width: 30vw;
	color: #fff;
`;

export default function Game() {












	return (
		<GameWindow>
			<Canvas>
				<MyMesh />
				<ambientLight args={[0xff0000]} intensity={0.1} />
				<directionalLight position={[0, 5, 3]} intensity={0.5} />
			</Canvas>
		</GameWindow>
	);
}



