import { motion, AnimatePresence } from 'framer-motion';
import { useAccountContext } from "./contexts/AccountContext";
import { useLoginContext } from "./contexts/LoginContext";
import PlayerInfo from './PlayerInfo';

function PlayerStats()
{
	const { loggedInAccounts } = useAccountContext();
	const { indexPlayerStats } = useLoginContext();

	return (
		<div className="flex flex-col items-center mt-4">
			<h2 className="text-2xl font-bold text-center">Stats</h2>
			<div className="w-full grid grid-cols-3 gap-2 p-2 mt-2">
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-green-800 font-black">Wins</div>
					<div className="stat-value">{loggedInAccounts[indexPlayerStats]?.wins}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title font-black">Draws</div>
					<div className="stat-value">{loggedInAccounts[indexPlayerStats]?.draws}</div>
				</div>
				<div className="stat flex flex-col items-center">
					<div className="stat-title text-red-800 font-black">Losses</div>
					<div className="stat-value">{loggedInAccounts[indexPlayerStats]?.loses}</div>
				</div>
			</div>
		</div>
	)
}

export default PlayerStats