import { useState } from "react";
import { usePlayerContext } from "./contexts/PlayerContext";
import { useLoginContext } from "./contexts/LoginContext";
import Player from "./assets/Player.svg";
import Player1 from "./assets/Player1.svg";
import Player2 from "./assets/Player2.svg";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import PlayerStats from "./Playerstats";
import EditProfile from "./EditProfile";
import { LiaUserEditSolid } from "react-icons/lia";
import { TfiSave } from "react-icons/tfi";

function ShowInfo()
{
	const { loggedInPlayers }  = usePlayerContext();
	const { indexPlayerStats } = useLoginContext();

	return (
		<div className="flex flex-col w-full text-left items-start space-y-4">
			<div className="w-full">
				<p className="block text-sm font-medium mb-1">Username</p>
				<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.username}</p>
			</div>
			<div className="w-full">
				<p className="block text-sm font-medium mb-1">Email</p>
				<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.email}</p>
			</div>
			<div className="w-full">
				<p className="block text-sm font-medium mb-1">Password</p>
				<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{('').padStart(10, '*')}</p>
			</div>
			<div className="w-full">
				<p className="block text-sm font-medium mb-1">2FA Enabled</p>
				<p className="w-full p-2 opacity-50 bg-[#3a3a3a] font-medium rounded-3xl border border-gray-600">{loggedInPlayers[indexPlayerStats]?.totpSecret ? 'Yes' : 'No'}</p>
			</div>
		</div>
	);
}

function PlayerInfo()
{
	const { loggedInPlayers, setLoggedInPlayers }  = usePlayerContext();
	const { setShowPlayerStats, indexPlayerStats } = useLoginContext();

	const [editProfile, setEditProfile] = useState(false);

	return (
		<AnimatePresence>
			<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-full max-w-md relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
					<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
						onClick={() => setShowPlayerStats(false)}>
						<IoMdClose size={24} />
					</button>
					<div className="flex flex-col items-center gap-2">
						<h2 className="text-2xl font-bold text-center">{loggedInPlayers[indexPlayerStats]?.username}</h2>
						<img src={loggedInPlayers.length > 2 ? Player : indexPlayerStats === 0 ? Player1 : indexPlayerStats === 1 ? Player2 : Player} className="h-16 w-auto"/>
					</div>
					{!editProfile && <motion.button className="items-center"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() => { setEditProfile(true) } }><LiaUserEditSolid />
					</motion.button>}
					{editProfile && <motion.button className="items-center"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() => { setEditProfile(false) } }><TfiSave />
					</motion.button>}
					{editProfile  && <EditProfile />}
					{!editProfile && <ShowInfo />}
					{!editProfile && <PlayerStats />}
					<motion.button className="w-full pt-2 bg-[#ff914d] px-4 py-2 font-bold shadow-2xl rounded-3xl hover:bg-[#ab5a28] hover:cursor-pointer"
						whileHover={ {scale: 1.03}}
						whileTap={ {scale: 0.97}}
						onClick={() =>
						{
							const updatedPlayers = loggedInPlayers.filter((player, index) => index !== indexPlayerStats)
							setLoggedInPlayers(updatedPlayers);
							localStorage.setItem('loggedInPlayers', JSON.stringify(updatedPlayers));
							setShowPlayerStats(false)
						}}>Logout
					</motion.button>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

export default PlayerInfo