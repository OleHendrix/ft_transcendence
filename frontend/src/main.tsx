import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './css/index.css'
import App from './App.tsx'
import SignUpModal from './signup/SignUpModal.tsx';
import LoginModal from './login/LoginModal.tsx';
import Leaderboard from './Leaderboard.tsx';
import TournamentWaitingRoom from './tournament/TournamentWaitingRoom.tsx';
import TournamentLobbyList from './tournament/TournamentLobbyList.tsx';
import PongGame from './pong/PongGame.tsx';
import PlayerInfoProtection from './user/PlayerInfoProtection.tsx';
import PlayerInfo from './user/PlayerInfo.tsx';
import PlayerStats from './user/Playerstats.tsx';
import TournamentSetupForm from './tournament/TournamentSetupForm.tsx';
import ErrorPage from './ErrorPage.tsx';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <ErrorPage/>,
		children: [
		{ path: 'signup', element: <SignUpModal />},
		{ path: 'login', element: <LoginModal />},
		{ path: 'leaderboard', element: <Leaderboard />,
			children:
			[
				{ path: ':username', element: <PlayerStats />}
			]
		},
		{ path: 'playerinfo/:username', element: <PlayerInfoProtection><PlayerInfo /></ PlayerInfoProtection>,
			children:
			[
				{ path: 'stats', element: <PlayerStats />}
			]
		},
		{ path: '/pong-game', element: <PongGame />},
		{ path: 'tournament',
			children:
			[
				{ path: 'setup', element: <TournamentSetupForm />},
				{ path: 'lobby-list', element: <TournamentLobbyList />},
				{ path: 'waiting-room', element: <TournamentWaitingRoom />}
			]
		}
		]
	}
]);

createRoot(document.getElementById('root')!).render(
//   <StrictMode>
	<RouterProvider router={router} />
    // <App />
//   </StrictMode>
)
