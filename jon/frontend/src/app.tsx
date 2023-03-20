import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';


// const newSocket = io(`http://${window.location.hostname}:3000`);
const socket = io('http://localhost:8080');

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    //Function to respond to server ping
    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  //Function to ping server
  const sendPing = () => {
    socket.emit('ping');
  }

  //Return object to be displayed
  return (
    <div>
      <p>Connected: { '' + isConnected }</p>
      <p>Last pong: { lastPong || '-' }</p>
      <button onClick={ sendPing }>Send ping</button>
    </div>
  );
}

//Export react app
export default App;


// https://socket.io/how-to/use-with-react-hooks


/*
Add and remove a listener from an event:

    const myListener = () => {
      // ...
    }

    socket.on("my-event", myListener);

    // then later
    socket.off("my-event", myListener);

// remove all listeners for that event
socket.off("my-event");

// remove all listeners for all events
socket.off();


Add new handler for given event:

    socket.on("news", (data) => {
      console.log(data);
    });

    // with multiple arguments
    socket.on("news", (arg1, arg2, arg3, arg4) => {
      // ...
    });
    // with callback
    socket.on("news", (cb) => {
      cb(0);
    });


Register new catch-all listener:

    socket.onAny((event, ...args) => {
    console.log(`got ${event}`);
    });

Adds a one-time listener function for the event named eventName. The next time eventName is triggered, this listener is removed and then invoked.

    socket.once("my-event", () => {
      // ...
    });
*/