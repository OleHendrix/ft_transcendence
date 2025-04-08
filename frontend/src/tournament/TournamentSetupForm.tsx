// components/tournament/TournamentSetupForm.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useAccountContext } from '../contexts/AccountContext';
import { IoMdClose } from 'react-icons/io';
import axios from 'axios';


export default function TournamentSetupForm() {
	const { setShowTournamentSetup, loggedInAccounts } = useAccountContext();

	async function createTournament( numberOfPlayers: number )
	{
		const host = { id: loggedInAccounts[0].id, username: loggedInAccounts[0].username };
 		try {
			const response = await axios.post(`http://${window.location.hostname}:5001/api/create-tournament`,
			{
				host,
				numberOfPlayers
			});
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
					<h1 className="flex justify-center text-3xl gap-2 font-normal font-black items-center"> 
						select number of players 
					</h1>

						<div className="flex flex-row space-x-4 ml-2">
								<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto`}
									onClick={() => createTournament(4)}>
									4 players
								</motion.button>
								<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto`}
									onClick={() => createTournament(8)}>
									8 players
								</motion.button>
								<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto`}
									onClick={() => createTournament(16)}>
									16 players
								</motion.button>
								<motion.button className={`flex items-center h-10 space-x-2 bg-[#134588] text-white px-4 py-0 rounded-3xl w-auto`}
									onClick={() => createTournament(32)}>
									32 players
								</motion.button>
						</div>
					
					</section>

				</motion.div>
			</motion.div>
			</AnimatePresence>
	);
}
