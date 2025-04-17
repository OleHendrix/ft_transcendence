import './css/index.css'
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Hero from "./Hero";
import PongGame from "./pong/PongGame";
import Chat from "./chat/Chat";
import Leaderboard from "./Leaderboard";
import { PlayerState } from "./types"
import { ChatProvider } from "./contexts/ChatContext";
import { LoginProvider } from "./contexts/LoginContext";
import { AccountProvider, useAccountContext } from './contexts/AccountContext';
import { TournamentProvider, useTournamentContext } from "./contexts/TournamentContext";
import { PongProvider } from './contexts/PongContext';

function MainContent()
{
	const { isPlaying, showLeaderboard } = useAccountContext();
	const { showTournamentWaitingRoom } = useTournamentContext();

	return (
		<>
				{isPlaying !== PlayerState.playing && <Navbar />}
				{isPlaying !== PlayerState.playing && !showTournamentWaitingRoom && <Hero />}
				{isPlaying === PlayerState.idle && <Chat/>}
			{/* {isPlaying === PlayerState.playing  && <PongGame />} */}
			{/* {isPlaying !== PlayerState.playing && showLeaderboard  && <Leaderboard />} */}
		</>
	)
}

function App()
{
	return (
		<div className='h-screen min-h-screen w-screen overflow-x-hidden bg-[#222222] font-satoshi text-white'>
			<div className="flex flex-col w-full h-full bg-[#222222]">
			<AccountProvider>
			<LoginProvider>
				<PongProvider>
				<TournamentProvider>
					<ChatProvider>

					<MainContent />
					{/* <Modals /> */}
					<Outlet />
					</ChatProvider>
				</TournamentProvider>
				</PongProvider>
				</LoginProvider>
			</AccountProvider>
			</div>
		</div>
	)
}

export default App
