// components/tournament/TournamentSetupForm.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useAccountContext } from '../contexts/AccountContext';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';
import { useTournamentContext } from '../contexts/TournamentContext';


export default function TournamentSetupForm() {
	const { setShowTournamentSetup, setShowTournamentLobbyList } = useTournamentContext();
	const { loggedInAccounts } = useAccountContext();

	async function createTournament( maxPlayers: number )
	{
		const host = { id: loggedInAccounts[0].id, username: loggedInAccounts[0].username };
 		try {
			const response = await axios.post(`http://${window.location.hostname}:5001/api/create-tournament`,
			{
				host,
				maxPlayers
			});
			if (!response) return;
			const tournamentId = response.data.tournamentId;
			console.log("tournament created with tournamentId:", tournamentId);
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
						onClick={() => setShowTournamentSetup(false)}
					>
						<IoMdClose size={24} />
					</button>

					{/* Player Count Section */}
					<section className="w-full">
					<h1 className="text-3xl font-black text-center mb-6">
						Create Tournament:
					</h1>
					<h1 className="text-2xl font-black text-center mb-6">
						Select number of players
					</h1>

					<div className="flex justify-center mt-6 gap-4">
						{[4, 8, 16, 32].map((count) => (
							<motion.button
								key={count}
								className="h-10 px-4 py-0 rounded-3xl bg-[#134588] text-white text-sm font-medium"
								onClick={() => createTournament(count)}
							>
								{count} players
							</motion.button>
						))}
					</div>
					</section>

					{/* Join existing tournament*/}
					<section className="w-full">
					<h1 className="text-3xl font-black text-center mb-6">
						Join existing tournament
					</h1>

					<div className="flex justify-center mt-6 gap-4">

					<motion.button
						className="h-10 px-4 py-0 rounded-3xl bg-[#134588] text-white text-sm font-medium"
						onClick={() => {
							setShowTournamentLobbyList(true); 
							setShowTournamentSetup(false)
						}}
					>
						Find a lobby
					</motion.button>

					</div>
					</section>

				</motion.div>
			</motion.div>
			</AnimatePresence>
	);
}
