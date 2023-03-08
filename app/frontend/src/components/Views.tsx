import { Routes, Route } from 'react-router-dom';
import LoginPage from "../pages/LoginPage";
import WelcomePage from '../pages/WelcomePage';
import GameTest from "../pages/GameTest";
import ChatTest from "../pages/ChatTest";

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