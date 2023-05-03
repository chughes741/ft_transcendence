import JoinGameQueue from "./components/game.joinGameQueue";
import { useGameViewModelContext } from "./game.viewModel";
import GamePage from "./GamePage";

export default function GameWindow() {
  const { displayQueue } = useGameViewModelContext();

  return <>{displayQueue === true ? <JoinGameQueue /> : <GamePage />}</>;
}
