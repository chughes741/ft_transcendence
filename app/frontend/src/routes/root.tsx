import React from 'react';
import { useLoaderData } from 'react-router-dom';
import LoginPage from "src/pages/LoginPage"
import WelcomePage from 'src/pages/WelcomePage';

export async function rootLoader() {

    const data = await { message: "hello" };
    return data;
}

export default function Home() {
  const posts = useLoaderData();

  return (
	<WelcomePage />
  );
}
