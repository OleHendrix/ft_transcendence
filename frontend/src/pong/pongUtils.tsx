import { useAccountContext } from "../contexts/AccountContext";
import { usePongContext } from "../contexts/PongContext";
import { Result, PlayerData } from "../types";


export function formatTime(ms: number): string
{
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ParseResult()
{
	const { pongState: pong, match} = usePongContext();
	const { loggedInAccounts } = useAccountContext();

	if (pong.result === Result.PLAYING)
		return <></>;
	const [winner, loser] = pong.result === Result.P1WON ? [match.p1,     match.p2    ] : [match.p2,     match.p1    ];
	const [s1,     s2   ] = pong.result === Result.P1WON ? [pong.p1Score, pong.p2Score] : [pong.p2Score, pong.p1Score];
	let message1 = (winner.id === loggedInAccounts[0].id)
		? `Congrats, ${winner.username}!`
		: `Better luck next time, ${loser.username}`;
	let message2 = (pong.p1Score < pong.maxPoints && pong.p2Score < pong.maxPoints)
		? `${loser.username} forfeited`
		: `${winner.username} won with ${s1}-${s2}!`;

	return (
		<div>
			<h1 className="block text-4xl text-center font-medium mb-1">{message1}</h1>
			<h1 className="block text-2xl text-center font-small text-gray-500">{message2}</h1>
		</div>
	);
}

export function getOpponent(): PlayerData
{
	const { match} = usePongContext();
	const { loggedInAccounts } = useAccountContext();

	if (match.p1.id !== loggedInAccounts[0].id)
		return match.p1;
	else if (match.p2.id === -1)
		return { id: -1, username: "AI 👾"};
	else
		return match.p2;
}