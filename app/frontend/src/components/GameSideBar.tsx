import { useState, useContext } from "react";
import "./GameSideBar.tsx.css";
import { WebSocketContext } from "src/contexts/WebSocketContext";

class JoinGameQueueDto {
  client_id: string;
  join_time: number;
}

export default function GameSideBar() {
  const socket = useContext(WebSocketContext);
  const [active, setActive] = useState(false);

  function onClick() {
    // setActive(!active);
    const payload: JoinGameQueueDto = new JoinGameQueueDto;
    payload.client_id = 'testguy';
    payload.join_time = Date.now();

    socket.emit("joinGameQueue", payload);
  }

  socket.on('lobbyCreated', () => {
    console.log('Players have successfully joined the lobby');
  })

  return (
    <>
      <div
        className={`game-side-bar-overlay ${active ? "active" : ""}`}
        onClick={onClick}
      ></div>
      <div className={`game-side-bar ${active ? "active" : ""}`}>
        <div
          onClick={onClick}
          className={`test ${active ? "active" : ""}`}
        >
          AHH
        </div>
        <div className={`test2 ${active ? "active" : ""}`}>OHHHHHHHHHH</div>
      </div>
    </>
  );
}
