import { useAccountContext } from "../contexts/AccountContext";
import { useLoginContext } from "../contexts/LoginContext";
import { useState, useEffect } from "react";

function PlayerStats()
{
	const { accounts, loggedInAccounts } = useAccountContext();
	const { indexPlayerStats, showPlayerStats } = useLoginContext();
	const [ index, setIndex ]  = useState(-1);

	useEffect(() =>
	{
		setIndex(loggedInAccounts[indexPlayerStats].id - 2);
	}, [ showPlayerStats ]);

	return (
		<div className="flex flex-col items-center mt-4">
			<h2 className="text-2xl font-bold text-center">Stats</h2>
			<p className='stat-title mt-2 font-black text-xl'>{accounts[index]?.elo}</p>
			<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-green-800 font-black">Wins</div>
					<div className="stat-value">{accounts[index]?.wins}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title font-black">Draws</div>
					<div className="stat-value">{accounts[index]?.draws}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-red-800 font-black">Losses</div>
					<div className="stat-value">{accounts[index]?.losses}</div>
				</div>
			</div>
		</div>
	)
}

export default PlayerStats