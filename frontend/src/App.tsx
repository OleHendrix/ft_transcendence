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
		<div className='h-screen min-h-screen w-screen overflow-x-hidden bg-[#222222] font-satoshi text-white'>
			<div className="flex flex-col w-full h-full bg-[#222222]">
				<AccountProvider>
				<LoginProvider>
					<Navbar />
					<MainContent />
					<Modals />
				</LoginProvider>
				</AccountProvider>
			</div>
		</div>
	)
}

export default App
