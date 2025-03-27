import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { motion } from 'framer-motion';
import { usePlayerContext } from "./contexts/PlayerContext";
import Player from "./assets/Player.svg";
import { BiSolidChat, BiSearch } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { RiGroup2Line } from "react-icons/ri";
import axios from 'axios';

interface message
{
	id: number,
	content: string,
	timestamp: string,
	chatSessionId: number,
	receiverId: number,
	senderId: number
}

function Chat()
{
	const {players, loggedInPlayers} = usePlayerContext();
	const [receiverId, setReceiverId] = useState(-1);
	const [isOpen, setIsOpen] = useState(false);
	const [messageReceived, setMessageReceived] = useState(false);
	const [chatSessionId, setChatSessionId] = useState(-1);
	const [testChats, setTestChats] = useState<message[]>([]);

	useEffect(() =>
	{
		async function fetchMessages()
		{
			try {
				const response = await axios.get('http://localhost:5001/api/get-messages',
				{
					params:
					{
						senderId: loggedInPlayers[0].id,
						receiverId: receiverId
						// last_message: null
					}
				})
				if (response.data.success)
				{
					setTestChats(response.data.messages);
					// setMessageReceived(false);
					setChatSessionId(response.data.chatSessionId);
				}
				
			} catch (error: any) {
				console.log(error.response);
			}
		}
		fetchMessages();
	}, [receiverId, messageReceived])

	useEffect(() => {
		if (!chatSessionId) return;
	
		console.log("frontend csid:", chatSessionId);
		const socket = new WebSocket(`ws://localhost:5001/ws/chat?chatSessionId=${chatSessionId}`);
		console.log("help me");
		socket.onmessage = function(message) {
			console.log("socket on message")
			setMessageReceived(true);
		};
	
		return () => {
			console.log("closed");
			socket.close();
		}
	}, [chatSessionId]);

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
  					<div className="chat absolute left-[2vw] bottom-[2vw] flex justify-start flex-col items-start p-6 pt-10 h-[700px] w-[800px] bg-black/90 shadow-2xl rounded-2xl z-50">
							<button className="absolute top-2 right-2 text-gray-400 hover:text-white hover:cursor-pointer"
								onClick={() => setIsOpen(false)}>
								<IoMdClose size={24} />
							</button>
						<div className="flex justify-end space-x-2 w-full flex-wrap mb-2">
							{players.filter(player => player.id !== loggedInPlayers[0].id).map((player, index) =>
								<div className="flex items-center flex-col space-y-0.5 w-12">
									<motion.img src={Player} className="h-10 w-auto hover:cursor-pointer" whileHover={{scale: 1.07}} whileTap={{scale: 0.93}}
										onClick={() => {
											setReceiverId(player.id);
											}}/>
									<p className="text-[10px] opacity-50 w-full text-center truncate">{player.username}</p>
								</div>
							)}
								<div className="flex items-center flex-col space-y-0.5 w-12">
									<motion.div whileHover={{scale: 1.07}} whileTap={{scale: 0.93}}
										onClick={() => setReceiverId(-1)}>
										<RiGroup2Line className="h-10 w-auto hover:cursor-pointer text-[#ff914d] hover:text-[#ab5a28] transition-colors"/>
									</motion.div>
									<p className="text-[10px] text-[#ff914d] opacity-90 font-bold w-full text-center truncate">Group</p>
								</div>
						</div>
						<div className="flex justify-end items-center gap-1 w-full">
							<input className="w-[12ch] bg-white/10 px-3 py-2 text-center text-[12px] rounded-2xl" placeholder="Search player"/>
							{/* <BiSearch size={20} className="text-white/30"/> */}
						</div>
						<div className="h-full w-full flex gap-4 justify-start flex-col items-start overflow-y-auto">
							<div className="h-[35vw] w-full flex p-2 flex-col mt-5 bg-white/10 rounded-2xl overflow-y-auto">
							{testChats.map((message, index) =>
								<div className={`chat ${loggedInPlayers[0].id !== message.senderId ? 'chat-start' : 'chat-end'}`}>
									<div className="chat-header">
										{message.senderId}
										<time className="text-xs opacity-50">{message.timestamp}</time>
									</div>
									<div className="chat-bubble">{message.content}</div>
								</div>
							)}
							</div>
							<input className="w-full bg-white/10 p-3 rounded-2xl" placeholder="Type your message..."
							onKeyDown={(e) =>
							{
								if (e.key === 'Enter')
								{
									const target = e.target as HTMLInputElement
									const message = target.value.trim();
									if (message)
									{
										async function sendMessage()
										{
											const response = await axios.post('http://localhost:5001/api/send-message',
											{
												senderId: loggedInPlayers[0].id,
												receiverId: receiverId,
												content: message
											})
											if (response.data.success)
												setMessageReceived(true);
											target.value = '';
											console.log(response);
										}
										sendMessage();
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