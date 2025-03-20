import Navbar from "./Navbar";
import Hero from "./Hero";
import PongGame from "./PongGame";
import './index.css'
import { PlayerProvider, usePlayerContext } from './Context';

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
				{<Navbar />}
				{<MainContent />}
			</PlayerProvider>
		</div>
	)
}

export default App
