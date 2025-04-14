
import { motion } from "framer-motion";
import TournamentSetupForm from "./TournamentSetupForm";

export default function TournamentSetup() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4"
		>
			<TournamentSetupForm />
		</motion.div>
	);
}
