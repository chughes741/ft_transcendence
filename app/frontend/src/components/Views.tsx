import { Routes, Route } from 'react-router-dom';
import LoginPage from "./LoginPage";
import WelcomePage from './WelcomePage';
import GameTest from "./GameTest";
import ChatTest from "./ChatTest";

const Views = () => {
	return <Routes>
		<Route path="/" element={<WelcomePage />} />
		<Route path="/login" element={<LoginPage />} />
		<Route path="*" element={<WelcomePage />} />
		<Route path="/gametest" element={<GameTest />} />
		<Route path="/chattest" element={<ChatTest />} />
	</Routes>;
};

export default Views;