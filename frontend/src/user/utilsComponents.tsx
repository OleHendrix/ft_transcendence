import { motion, AnimatePresence } from 'framer-motion';
import { BiLogOut } from 'react-icons/bi';
import { FiEdit3, FiCamera } from "react-icons/fi";
import { IoIosStats } from 'react-icons/io';
import { LiaUserEditSolid } from 'react-icons/lia';
import { MdOutlineDeleteForever } from 'react-icons/md';
import Player from '../../assets/Player.svg';

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
			className={`${width} ${variant === 'primary' ? 'bg-[#ff914d] hover:bg-[#ab5a28]' : 'bg-[#134588] hover:bg-[#103568]'} ${disabled ? 'opacity-30' : 'hover:cursor-pointer'} 
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
	return (
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

interface DisplayInfoProps
{
	keyword: string;
	value: string | undefined;
}

export function DisplayInfo({ keyword, value }: DisplayInfoProps)
{
	return (
		<div className="w-full">
			<div className="flex items-end justify-between gap-2">
				<p className="block text-sm font-medium mb-1">{keyword}</p>
			</div>
			<div className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600 flex justify-between">
				<p>{value}</p>
			</div>
		</div>
	)
}

interface LogoutDeleteButtonProps
{
	keyword: "logout" | "delete";
	onClick: () => void;
}

export function LogoutDeleteButton({ keyword, onClick }: LogoutDeleteButtonProps)
{
	return (
		<button className="absolute items-center top-4 left-4 text-gray-400 hover:text-white hover:cursor-pointer"
			onClick={onClick}>
			{keyword === 'logout' ? <BiLogOut size={24} /> : <MdOutlineDeleteForever size={24} />}
		</button>	
	)
}

export function ImageDisplay({ avatar }: { avatar?: string })
{
	return (
		<>
			<img src={avatar !== '' ? avatar : Player} className="h-16 w-16 rounded-full object-cover shadow-lg" />
			{ avatar && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div> }
		</>
	)
}

