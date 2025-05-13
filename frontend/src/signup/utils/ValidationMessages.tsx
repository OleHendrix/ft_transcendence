import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function AlreadyLoggedInMessage()
{
	return (
		<motion.div className="text-center text-sm text-[#ff914d] font-bold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<p>This user is already logged in</p>
		</motion.div>
	)
}

export function AccountExistsMessage()
{
	return (
		<motion.div className="flex flex-col text-center text-sm gap-2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
			<p>Account already exists</p>
			<Link to="/login"
				className="text-[#ff914d] hover:underline font-bold"> Please login here
			</Link>
		</motion.div>
	)
}