import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion } from 'framer-motion';
import { usePlayerContext } from "./contexts/PlayerContext";
import Player from "./assets/Player.svg";
import { BiSolidChat } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import axios from 'axios';


function Chat()
{
	const {players} = usePlayerContext();
	const [isOpen, setIsOpen] = useState(false);
	const [testChats, setTestChats] = useState(
	[
		{
			name: 'John',
			time: '12:45',
			message: 'Hello my guy, how are you?',
			status: 'Seen' 
		},
		{
			name: "Mary",
			time: '12:51',
			message: 'Hey John, I\'m good, How are you?',
			status: 'Delivered'
		}
	])

	return(
		<div className="absolute left-[2vw] bottom-[2vw] hover:cursor-pointer">
			{!isOpen &&
			(
				<motion.div whileHover={{scale: 1.17}} whileTap={{scale: 0.89}}>
					<BiSolidChat className="text-[#ff914d] hover:text-[#ab5a28] transition-colors cursor-pointer" size={32}
					onClick={() => setIsOpen(true)}/>
				</motion.div>
			)}
			{isOpen &&
			(
				<div className="fixed inset-0 backdrop-blur-sm z-40"
					onClick={(e) => 
					{
						const target = e.target as HTMLElement
						if (!target.closest('.chat'))
							setIsOpen(false);
					}}>
  					<div className="chat absolute left-[2vw] bottom-[2vw] flex justify-start flex-col items-start p-6 h-[25vw] w-[20vw] bg-black/90 rounded-2xl z-50">
							<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
								onClick={() => setIsOpen(false)}>
								<IoMdClose size={24} />
							</button>
						<div className="flex justify-start space-x-2">
							{players.map((player, index) =>
								<div className="flex items-center flex-col space-y-0.5 w-12">
									<motion.img src={Player} className="h-10 w-auto hover:cursor-pointer" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}}/>
									<p className="text-[10px] opacity-50 w-full text-center truncate">{player.username}</p>
								</div>
							)}
						</div>
						<div className="h-full w-full flex gap-4 justify-start flex-col items-start">
							<div className="h-full w-full flex p-2 flex-col mt-5 bg-white/10 rounded-2xl">
							{testChats.map((message, index) =>
								<div className={`chat ${index % 2 == 0 ? 'chat-start' : 'chat-end'}`}>
									<div className="chat-header">
										{message.name}
										<time className="text-xs opacity-50">{message.time}</time>
									</div>
									<div className="chat-bubble">{message.message}</div>
								</div>
							)}
							</div>
							<input className="w-full bg-white/10 p-3 rounded-2xl" placeholder="Type your message..."
							onKeyDown={(e) =>
							{
								if (e.key === 'Enter')
								{
									const target = e.target as HTMLInputElement
									if (target.value.trim())
									{
										async function sendMessage()
										

									}
								}
							}
							}/>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default Chat