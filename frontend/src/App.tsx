import './css/index.css'
import Navbar from "./Navbar";
import Hero from "./Hero";
import Modals from "./Modals";
import PongGame from "./pong/PongGame";
import Chat from "./chat/Chat";
import Leaderboard from "./Leaderboard";
import TournamentSetup from "./tournament/TournamentSetup"
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
			{isPlaying !== PlayerState.playing && <Hero />}
			<ChatProvider>
				{isPlaying === PlayerState.idle && <Chat/>}
			</ChatProvider>
			{isPlaying === PlayerState.playing  && <PongGame />}
			{isPlaying !== PlayerState.playing && showLeaderboard  && <Leaderboard />}
			{isPlaying !== PlayerState.playing && showTournamentSetup && <TournamentSetup/> }
			{isPlaying !== PlayerState.playing && showTournamentLobbyList && <TournamentLobbyList/> }
			{isPlaying !== PlayerState.playing && showTournamentWaitingRoom && <TournamentWaitingRoom/> }
		</>
	)
}

function App()
{
	return (
		<div className='h-screen w-screen bg-[#222222] font-satoshi text-white'>
		<AccountProvider>
			<LoginProvider>
				<TournamentProvider>
					<Navbar />
					<MainContent />
					<Modals />
				</TournamentProvider>
			</LoginProvider>
		</AccountProvider>
		</div>
	)
}

export default App
