import Navbar from "./Navbar";
import Hero from "./Hero";
import Modals from "./Modals";
import PongGame from "./PongGame";
import './index.css'
import { PlayerProvider, usePlayerContext } from './PlayerContext';
import { LoginProvider } from "./LoginContext";

function MainContent()
{
	const { isPlaying } = usePlayerContext();

	return (
		<>
			{!isPlaying && <Hero />}
			{isPlaying  && <PongGame />}
		</>
	)
}

function App()
{
	return (
		<div className='h-screen w-screen bg-[#222222] font-satoshi text-white'>
			<PlayerProvider>
				<LoginProvider>
					<Navbar />
					<MainContent />
					<Modals />
				</LoginProvider>
			</PlayerProvider>
		</div>
	)
}

export default App
