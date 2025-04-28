import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiCamera } from "react-icons/fi";
import { IoIosStats } from 'react-icons/io';
import { LiaUserEditSolid } from 'react-icons/lia';

interface StyledButtonProps
{
	onClick: () => void;
	variant: 'primary' | 'secondary';
	width?: string;
	text: string;
	disabled?: boolean;
}

export function StyledButton({ onClick, variant, width = 'w-full', text, disabled = false }: StyledButtonProps)
{
	return (
		<motion.button
			className={`${width} ${variant === 'primary' ? 'bg-[#ff914d] hover:bg-[#ab5a28]' : 'bg-red-900 hover:bg-red-700'} ${disabled ? 'opacity-30' : 'hover:cursor-pointer'} 
                text-white text-xs py-2 px-2 rounded-3xl font-bold transition-colors shadow-2xl`}
			whileHover={!disabled ? { scale: 1.03 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}
			onClick={onClick} disabled={disabled}>
			{text}
		</motion.button>
	);
}

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

interface ProfileActionButtonProps
{
	keyword: "edit" | "stats";
	onClick: () => void;
}

export function ProfileActionButton({ keyword, onClick }: ProfileActionButtonProps)
{
	return (
		<div className="flex flex-col items-center">
			<motion.button className="items-center mt-1 text-[#ff914d] hover:text-[#ab5a28] cursor-pointer"
				whileHover={{ scale: 1.17 }}
				whileTap={{ scale: 0.87 }}
				onClick={onClick}>
				{keyword === 'edit' ? <LiaUserEditSolid size={24} /> : <IoIosStats size={24} />}
			</motion.button>
			<p className="font-thin text-xs opacity-40">{keyword === 'edit' ? 'Edit profile' : 'Show Stats'}</p>
		</div>
	);
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