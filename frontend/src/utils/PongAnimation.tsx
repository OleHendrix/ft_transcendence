import "./css/ponganimation.css";

export function PongAnimation()
{
	return (
		<div className="pong-wrapper w-full">
			<div className="pong-game">
				<div className="paddle left-paddle"></div>
				<div className="ball"></div>
				<div className="paddle right-paddle"></div>
			</div>
		</div>
	)
}