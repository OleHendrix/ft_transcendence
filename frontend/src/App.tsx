import Navbar from "./Navbar";
import Hero from "./Hero";
import Modals from "./Modals";
import PongGame from "./PongGame";
import Chat from "./Chat";
import { ChatProvider } from "./contexts/ChatContext";
import './css/index.css'
import { AccountProvider, useAccountContext } from './contexts/AccountContext';
import { LoginProvider } from "./contexts/LoginContext";
import { PlayerState } from "./types"

function MainContent()
{
	const { isPlaying } = useAccountContext();

	return (
		<>
			{isPlaying !== PlayerState.playing && <Hero />}
			<ChatProvider>
				<Chat/>
			</ChatProvider>
			{isPlaying === PlayerState.playing  && <PongGame />}
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
