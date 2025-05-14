import './css/index.css'
import { Outlet } from 'react-router-dom';
import Navbar from "./Navbar";
import Hero from "./Hero";	
import Chat from "./chat/Chat";
import { PlayerState } from "./types"
import { ChatProvider } from "./contexts/ChatContext";
import { AccountProvider, useAccountContext } from './contexts/AccountContext';
import { PlayerinfoProvider } from './contexts/PlayerinfoContext';
import { PongProvider } from './contexts/PongContext';

function MainContent()
{
	const { isPlaying } = useAccountContext();

	return (
		<>
				{isPlaying !== PlayerState.playing && <Navbar />}
				{isPlaying !== PlayerState.playing && <Hero />}
				{isPlaying === PlayerState.idle && <Chat/>}
		</>
	)
}

function App()
{
	return (
		<div className='h-screen min-h-screen w-screen overflow-x-hidden font-satoshi text-white
						bg-gradient-to-tr from-zinc-800 to-zinc-900'>
			<div className="flex flex-col w-full h-full">
			<AccountProvider>
				<PlayerinfoProvider>
				<PongProvider>
					<ChatProvider>
						<MainContent />
						<Outlet />
					</ChatProvider>
				</PongProvider>
				</PlayerinfoProvider>
			</AccountProvider>
			</div>
		</div>
	)
}

export default App
