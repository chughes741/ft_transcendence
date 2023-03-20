import { openSocket } from 'socket.io-client';

const socket = openSocket("http://localhost:80");

export default socket;

//https://stackoverflow.com/questions/36120119/reactjs-how-to-share-a-websocket-between-components