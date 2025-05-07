import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './css/index.css'
import App from './App.tsx'
import SignUpModal from './signup/SignUpModal.tsx';
import LoginModal from './login/LoginModal.tsx';
import Leaderboard from './Leaderboard.tsx';
import TournamentMenu from './tournament/TournamentMenu.tsx';
import TournamentWaitingRoom from './tournament/TournamentWaitingRoom.tsx';
import PongGame from './pong/PongGame.tsx';
import PlayerInfoProtection from './user/PlayerInfoProtection.tsx';
import PlayerInfo from './user/PlayerInfo.tsx';
import PlayerStats from './user/Playerstats.tsx';
import { Queue } from './Hero.tsx';
import ErrorPage from './ErrorPage.tsx';
import TournamentProtection from './tournament/TournamentProtection.tsx';

const router = createBrowserRouter(
[
	{
		path: '/',
		element: <App />,
		errorElement: <ErrorPage/>,
		children: [
		{ path: 'signup', element: <SignUpModal />},
		{ path: 'login', element: <LoginModal />},
		{ path: 'playerstats/:username', element: <PlayerStats />},
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
		{ path: '/queue', element: <Queue />},
		{ path: '/pong-game', element: <PongGame />},
		{ path: 'tournament',
			children:
			[
				{ path: 'menu', element: <TournamentMenu />},
				{ path: 'waiting-room/:id', element: <TournamentProtection><TournamentWaitingRoom /></TournamentProtection>,
					// children:	
					// [
					// 	{ path: 'pong-game', element: <PongGame />}
					// ]
				},
			]
		}
		]
	}
],
{
	// future:
	// {
	// 	v7_startTransition: true,
	// 	v7_relativeSplatPath: true,
	// }
}
);

createRoot(document.getElementById('root')!).render(
  	// <StrictMode>
		<RouterProvider router={router} />
	// </StrictMode>
)
