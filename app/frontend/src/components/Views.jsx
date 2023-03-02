import { Routes, Route } from 'react-router-dom';
import Login from "../LoginPage/Login";
import WelcomeTest from './WelcomeTest';

const Views = () => {
	return <Routes>
		<Route path="/" element={<Login />} />
		<Route path="/login" element={<WelcomeTest />} />
		<Route path="*" element={<Login />} />
	</Routes>;
};

export default Views;