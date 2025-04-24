import { SignUpValidatonType } from "../../types"
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface SignUpButtonProps
{
	validation: SignUpValidatonType;
	emptyForm: boolean
}

export function SignUpButton({validation, emptyForm}: SignUpButtonProps)
{
	return (
		<div className="pt-2">
			<motion.button className={`w-full bg-[#ff914d]
				${(emptyForm || validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? 'opacity-30'
				: 'hover:bg-[#ab5a28] hover:cursor-pointer'} text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl`}
				type="submit" disabled={(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match'])}
				whileHover={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? { scale: 1.03 } : {}}
				whileTap={!(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match']) ? { scale: 0.97 } : {}}>Sign Up
			</motion.button>
		</div>
	)
}

export function LoginMessage()
{
	return (
		<motion.div className="text-center text-sm text-gray-400 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
			Already have an account?{" "} 
			<Link to="/login"
				className="text-[#ff914d] hover:underline font-bold"> Log in
			</Link>
		</motion.div>
	)
}