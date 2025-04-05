import axios from "axios";
import { useAccountContext } from "./contexts/AccountContext";
import { useLoginContext } from "./contexts/LoginContext";
import { useEffect, useState } from 'react';

interface	Stats
{
	wins:	number;
	draws:	number;
	losses:	number;
	elo:	number;
}

function PlayerStats()
{
	const { loggedInAccounts } = useAccountContext();
	const { indexPlayerStats, showPlayerStats } = useLoginContext();
	const [ stats, setStats ]  = useState<Stats>();

	useEffect(() =>
	{
		async function getStats()
		{
			try
			{
				const response = await axios.post(`http://${window.location.hostname}:5001/api/get-stats`,
					{ userId: loggedInAccounts[indexPlayerStats].id });
				const playerStats = response.data as Stats;
				setStats(playerStats);
				console.log('stats', stats, 'data', response.data);
			}
			catch (error)
			{
				console.error('failed to fetch Stats', error);
			}
		} getStats();
	}, [ showPlayerStats ]);

	return (
		<div className="flex flex-col items-center mt-4">
			<h2 className="text-2xl font-bold text-center">Stats</h2>
			<p className='stat-title mt-2 font-black text-xl'>{stats?.elo}</p>
			<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-green-800 font-black">Wins</div>
					<div className="stat-value">{stats?.wins}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title font-black">Draws</div>
					<div className="stat-value">{stats?.draws}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-red-800 font-black">Losses</div>
					<div className="stat-value">{stats?.losses}</div>
				</div>
			</div>
		</div>
	)
}

export default PlayerStats