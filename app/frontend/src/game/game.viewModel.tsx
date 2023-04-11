import { GameModelType, useGameModel } from "./game.model";
import { GameContext } from "./game.context";
import  * as GameTypes  from "src/game/game.types";
import { socket } from "src/contexts/WebSocketContext";
export interface GameViewModelType extends GameModelType {
    setPlayerState: (state: boolean) => Promise<boolean>;
}
  

export const GameViewModelProvider = ({ children }) => {
    const gameModel = useGameModel();
    const {lobbyId, setPlayerReady} = gameModel;

    const setPlayerState = async (state: boolean) => {
        console.log("in toggle button:");
        console.log(lobbyId);
        const payload: GameTypes.PlayerReadyDto = new GameTypes.PlayerReadyDto(lobbyId, state);
        socket.emit("playerReady", payload, (response: boolean | {error: string}) => {
            if (typeof response === "object") {
                alert(response.error);
            } else {
                setPlayerReady(true);
            }
        });
        return true;
    };

    return (
        <GameContext.Provider
            value={{
                ...gameModel,
                setPlayerState
                //...
            }}
        >
            {children}
        </GameContext.Provider>
    );
};
