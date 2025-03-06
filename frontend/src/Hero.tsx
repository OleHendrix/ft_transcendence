import { RiGamepadLine } from "react-icons/ri";
import "./ponganimation.css";

function SimplePong()
{
	return (
		<div className="pong-wrapper">
		<div className="pong-game">
			<div className="paddle left-paddle"></div>
			<div className="ball"></div>
			<div className="paddle right-paddle"></div>
		</div>
		</div>
	)
}

function Hero()
{
	return(
		<div className="w-full h-180 flex justify-between">
			<div className="w-1/2 flex justify-center flex-col p-24 space-y-8">
				<h1 className="text-5xl  font-semibold text-brand-orange">Are you ready for an <span className="font-black italic text-[#ff914d]">transcending</span> game of Pong?</h1>
				<p className="text-xl">Get ready for the ultimate Pong experience. Challenge your friends in fast-paced, competitive matches where every point matters. Are you ready to outplay, outlast, and outscore?</p>
				<div className="flex justify-start space-x-4 font-bold text-lg">
				    <button className="flex items-center space-x-2 bg-[#ff914d] hover:bg-[#ab5a28] text-white py-1 px-4 rounded-3xl shadow-lg">
						<p>Login</p>
        			</button>
					<button className="flex items-center space-x-2 bg-[#134588] hover:bg-[#246bcb] text-white py-2 px-4 rounded-3xl">
						<p>Play</p>
						<RiGamepadLine />
					</button>
				</div>
			</div>
			<div className="w-1/2 flex justify-center flex-col p-24 space-y-8">
				<SimplePong />
			</div>
		</div>
	)
}

export default Hero