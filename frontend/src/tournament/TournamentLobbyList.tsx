import { motion, AnimatePresence } from 'framer-motion';
import { useAccountContext } from '../contexts/AccountContext';
import { IoMdClose } from 'react-icons/io';
import { useTournamentContext } from '../contexts/TournamentContext';

export default function TournamentLobbyList() {
	const { loggedInAccounts } = useAccountContext();
	const { setShowTournamentLobbyList } = useTournamentContext();

	async function createTournament( maxPlayers: number )
	{
 		try {
			// const response = await axios.post(`http://${window.location.hostname}:5001/api/create-tournament`,
			// {
			// 	host,
			// 	maxPlayers
			// });
			// if (!response) return;
			// const tournamentId = response.data.tournamentId;
			// console.log("tournament created with tournamentId:", tournamentId);
		} catch ( error: any ) {
			console.log(error);
		}
	};
	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-[#1a1a1a]/90"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					className="flex flex-col items-center bg-[#2a2a2a]/90 text-white p-8 gap-8 rounded-lg w-full min-w-[400px] min-h-[500px] max-w-xl max-h-[600px] relative shadow-xl"
					initial={{ scale: 0.9, y: 20 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.9, y: 20 }}
					transition={{ type: "spring", stiffness: 300, damping: 25 }}
					>
					{/* close button */ }
					<button
						className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowTournamentLobbyList(false)}
					>
						<IoMdClose size={24} />
					</button>

				</motion.div>
			</motion.div>
			</AnimatePresence>
	);
}
