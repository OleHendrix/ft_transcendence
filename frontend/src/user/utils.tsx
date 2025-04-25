import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiCamera } from "react-icons/fi";

interface EditIconProps
{
  onClick: () => void;
  keyName: string;
}

export function EditIcon({ onClick, keyName }: EditIconProps)
{
	return(
		<motion.button className="items-start mb-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer opacity-30 hover:opacity-100"
			key="edit-username" 
			whileHover={ {scale: 1.17}}
			whileTap={ {scale: 0.87}}
			onClick={onClick}><FiEdit3 size={18} />
		</motion.button>
	)
}

interface InputFieldProps
{
	name: string;
	value?: string;
	placeholder?: string;
	validation: Record<string, boolean>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isPasswordField?: boolean; 
}

export function InputField({ name, value, placeholder, validation, onChange, isPasswordField } : InputFieldProps)
{
	function getBorderColor()
	{
		if (validation['Already logged in'] || validation['Username exists'] || validation['Email exists'])
			return 'border-[#ff914d] focus:border-[#ff914d]';
		else if (isPasswordField && validation['Password don\'t matches'])
			return 'border-red-800';
		else if (isPasswordField && validation['Password matches!'])
			return 'border-green-500';
		else
			return 'border-gray-600 focus:border-white';
	}
	return (
		<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border ${getBorderColor()} focus:outline-none`}
			name={name} type={name === "email" ? 'email' : (name === "password" || name === "confirmPassword") ? 'password' : 'text'} value={value} placeholder={placeholder} onChange={onChange}/>
		);
}