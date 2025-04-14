import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './css/index.css'
import App from './App.tsx'
import SignUpModal from './signup/SignUpModal.tsx';
import LoginModal from './login/LoginModal.tsx';
import Leaderboard from './Leaderboard.tsx';
import TournamentSetup from './tournament/TournamentSetup.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
		{ path: '/signup', element: <SignUpModal />},
		{ path: '/login', element: <LoginModal />},
		{ path: '/leaderboard', element: <Leaderboard />},
		{ path: '/tournament-setup', element: <TournamentSetup />},
		]
	}
]);

createRoot(document.getElementById('root')!).render(
//   <StrictMode>
	<RouterProvider router={router} />
    // <App />
//   </StrictMode>
)
