import { Routes, Route } from 'react-router-dom';
import LoginPage from "./LoginPage.tsx";
import WelcomePage from './WelcomePage.tsx';

const Views = () => {
	return <Routes>
		<Route path="/" element={<LoginPage />} />
		<Route path="/welcome" element={<WelcomePage />} />
		<Route path="*" element={<LoginPage />} />
	</Routes>;
};

export default Views;