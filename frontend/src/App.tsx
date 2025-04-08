import Navbar from "./Navbar";
import Hero from "./Hero";
import Modals from "./Modals";
import PongGame from "./pong/PongGame";
import Chat from "./chat/Chat";
import { ChatProvider } from "./contexts/ChatContext";
import './css/index.css'
import { AccountProvider, useAccountContext } from './contexts/AccountContext';
import { LoginProvider } from "./contexts/LoginContext";
import { PlayerState } from "./types"
import Leaderboard from "./Leaderboard";

function MainContent()
{
	const { isPlaying, showLeaderboard } = useAccountContext();

	return (
		<>
			{isPlaying !== PlayerState.playing && <Hero />}
			<ChatProvider>
				{isPlaying === PlayerState.idle && <Chat/>}
			</ChatProvider>
			{isPlaying === PlayerState.playing  && <PongGame />}
			{isPlaying !== PlayerState.playing && showLeaderboard  && <Leaderboard />}
		</>
	)
}

function App()
{
	return (
		<div className='h-screen w-screen bg-[#222222] font-satoshi text-white'>
			<AccountProvider>
				<LoginProvider>
					<Navbar />
					<MainContent />
					<Modals />
				</LoginProvider>
			</AccountProvider>
		</div>
	)
}

export default App
