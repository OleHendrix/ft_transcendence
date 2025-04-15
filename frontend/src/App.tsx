import './css/index.css'
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Hero from "./Hero";
import Modals from "./Modals";
import PongGame from "./pong/PongGame";
import Chat from "./chat/Chat";
import Leaderboard from "./Leaderboard";
import { PlayerState } from "./types"
import { ChatProvider } from "./contexts/ChatContext";
import { LoginProvider } from "./contexts/LoginContext";
import { AccountProvider, useAccountContext } from './contexts/AccountContext';
import { TournamentProvider, useTournamentContext } from "./contexts/TournamentContext";
import TournamentLobbyList from './tournament/TournamentLobbyList';
import TournamentWaitingRoom from './tournament/TournamentWaitingRoom';

function MainContent()
{
	const { isPlaying, showLeaderboard } = useAccountContext();
	const { showTournamentSetup, showTournamentLobbyList, showTournamentWaitingRoom } = useTournamentContext();

	return (
		<>
			<ChatProvider>
				{isPlaying !== PlayerState.playing && !showTournamentWaitingRoom && <Hero />}
				{isPlaying === PlayerState.idle && <Chat/>}
			</ChatProvider>
			{/* {isPlaying === PlayerState.playing  && <PongGame />} */}
			{/* {isPlaying !== PlayerState.playing && showLeaderboard  && <Leaderboard />}
			{isPlaying !== PlayerState.playing && showTournamentSetup && <TournamentSetup/> }
			{isPlaying !== PlayerState.playing && showTournamentLobbyList && <TournamentLobbyList/> }
			{isPlaying !== PlayerState.playing && showTournamentWaitingRoom && <TournamentWaitingRoom/> } */}
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
				<TournamentProvider>
					<Navbar />
					<MainContent />
					{/* <Modals /> */}
					<Outlet />
				</TournamentProvider>
				</LoginProvider>
			</AccountProvider>
			</div>
		</div>
	)
}

export default App
