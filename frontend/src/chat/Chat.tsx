import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Player from "../../assets/Player.svg";
import { BiSolidChat, BiSearch } from "react-icons/bi";
import { FiPlus, FiCheckCircle } from "react-icons/fi";
import { MdOutlineCancel, MdBlock } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { RiGroup2Line } from "react-icons/ri";
import { CgUnblock } from "react-icons/cg";
import { BiRocket } from "react-icons/bi";
import axios from 'axios';
import { useAccountContext } from ".././contexts/AccountContext";
import { useChatContext } from ".././contexts/ChatContext";
import { format } from 'date-fns';
import "../css/TypingLoader.css";

function Chat()
{
	const {loggedInAccounts} 													= useAccountContext();
	const {receiverId, chatSessionId, isOpen, messageReceived} 					= useChatContext();
	
	const {setChatMessages, setChatSessionId, setMessageReceived, setIsOpen, isTyping, setIsTyping}	= useChatContext();
	useEffect(() =>
	{
		async function getMessages()
		{
			try
			{
				const response = await axios.get(`http://${window.location.hostname}:5001/api/get-messages`,
				{
					params:
					{
						senderId: loggedInAccounts[0].id,
						receiverId: receiverId
					}
				})

				if (response.data.success)
				{
					setChatMessages(response.data.messages);
					setChatSessionId(response.data.chatSessionId);
				}
			} catch (error: any) {
				console.log(error.response);
			} finally {
				setTimeout(() => setMessageReceived(false), 0);
			}
		}

		if (receiverId !== null && loggedInAccounts.length > 0) {
			getMessages();
		}
	}, [receiverId, messageReceived, isOpen])

	useEffect(() =>
	{
		if (!chatSessionId) return;

		console.log(`frontend:useEffect:chatSessionId change, creating new websocket with: /ws/chat/?scid:${chatSessionId}`);
		const socket = new WebSocket(`ws://${window.location.hostname}:5001/ws/chat?chatSessionId=${chatSessionId}`);

		socket.onmessage = function(event)
		{
			const message = JSON.parse(event.data)
			if (message.isTyping && message.isTyping !== loggedInAccounts[0].username && !isTyping)
				setIsTyping(message.isTyping);
			else
			{
				console.log(`Frontend:useEffect:socket.onMessage.setmessageReceived(true)`);
				setMessageReceived(true);
				setIsTyping('');
			}
		};
		
		return () => {
			console.log("Closing WebSocket...");
			socket.close();
		};
	}, [chatSessionId]);

	return(
		<div className="fixed left-[2vw] bottom-[2vw] hover:cursor-pointer z-10">
		{!isOpen &&
		(
			<motion.div whileHover={{ scale: 1.17 }} whileTap={{ scale: 0.89 }}>
				<BiSolidChat
					size={32}
					className="text-[#ff914d] hover:text-[#ab5a28] transition-colors cursor-pointer"
					onClick={() => loggedInAccounts.length > 0 && setIsOpen(true)}
				/>
			</motion.div>
		)}
		{isOpen && <ChatWindow setIsOpen={setIsOpen}/>}
	</div>
);
}

function ChatWindow( { setIsOpen }: { setIsOpen: (open: boolean) => void } )
{
	return (
	<div
		className="fixed inset-0 backdrop-blur-sm z-40"
		onClick={(e: any) =>
		{
			if (!(e.target as HTMLElement).closest('.chat'))
				setIsOpen(false);
		}}>
		<div className="chat absolute left-[2vw] bottom-[2vw] flex flex-col justify-between p-6 pt-10 h-[calc(100vh-6vw)] w-[95vw] md:w-[40vw] md:min-w-[475px] bg-black/90 shadow-2xl rounded-2xl z-50">
			<button className="absolute top-2 right-2 text-gray-400 hover:text-white hover:cursor-pointer" onClick={() => setIsOpen(false)}>
				<IoMdClose size={24} />
			</button>

			<ChatHeader />
			<MessageList/>
		</div>
	</div>
);
}

function ChatHeader()
{
	const {accounts, loggedInAccounts} 				= useAccountContext();
	const {receiverId, setReceiverId, setReceiverUsername} 				= useChatContext();

	return (
		<div className="w-full max-w-full">
		<div className="flex justify-end space-x-2 mb-2 overflow-x-scroll overscroll-x-contain whitespace-nowrap">
			{accounts
				.filter((account) => 
					account.username !== loggedInAccounts[0]?.username && !account.admin )
				.map((account, index) => (
					<div key={index} className={`flex items-center flex-col space-y-0.5 w-12 flex-shrink-0 ${receiverId !== account.id ? 'opacity-40' : 'opacity-100'}`}>
						<motion.img
							src={Player}
							className="h-10 w-10 cursor-pointer"
							whileHover={{ scale: 1.07 }}
							whileTap={{ scale: 0.93 }}
							onClick={() => {setReceiverId(account.id); setReceiverUsername(account.username)}}/>
						<p className="text-[10px] opacity-90 w-full text-center truncate">{account.username}</p>
					</div>
				))}
			<div className={`flex items-center flex-col space-y-0.5 w-12 ${receiverId !== -1 ? 'opacity-20' : 'opacity-100'}`}>
				<motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={() => setReceiverId(-1)}>
					<RiGroup2Line className="h-10 w-auto cursor-pointer text-[#ff914d] hover:text-[#ab5a28] transition-colors" />
				</motion.div>
				<p className="text-[10px] text-[#ff914d] opacity-90 font-bold w-full text-center truncate">Group</p>
			</div>
		</div>
		</div>
	);
}

function MessageList( ) {
	const { loggedInAccounts } = useAccountContext();
	const { setMessageReceived, chatMessages, setChatMessages, receiverId, receiverUsername, messageReceived, isBlocked, setIsBlocked, amIBlocker, setAmIBlocker, isTyping, setIsTyping} = useChatContext();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatMessages, isTyping]);

	useEffect(() =>
	{
		async function typeStatus()
		{
			const startTime = Date.now();
			const elapsedTime = Date.now() - startTime;
			const remainingTime = Math.max(0, 5000 - elapsedTime);
			await new Promise(resolve => setTimeout(resolve, remainingTime));
			setIsTyping('');
		}; typeStatus()
	}, [isTyping])

	const handleGameInviteResponse = async (messageId: number, newStatus: number) => {
		try {
			console.log(`Updating message ${messageId} status to ${newStatus}`);
	
			await axios.post(`http://${window.location.hostname}:5001/api/change-msg-status`, {
				senderId: loggedInAccounts[0]?.id,
				receiverId,
				status: newStatus,
				messageId,
			});

			setChatMessages((prevMessages) => // update localstorage 
				prevMessages.map((msg) =>
					msg.id === messageId ? { ...msg, status: newStatus } : msg
				)
			);
	
			console.log(`Game invite ${newStatus === 2 ? "accepted" : "declined"} for message ${messageId}`);
		} catch (error) {
			console.log("Error occurred when changing msg status:", error);
		}
		
	};

	useEffect(() => {
		const checkIfBlocked = async () => {
			try {
				const response = await axios.get(`http://${window.location.hostname}:5001/api/is-blocked`, {
					params: {
						senderId: loggedInAccounts[0]?.id,
						receiverId,
					},
				});
	
				setIsBlocked(response.data.blocked);
				setAmIBlocker(response.data.amIBlocker); // Store whether the user is the blocker
			} catch (error) {
				console.error("Error checking block status:", error);
			}
		};
	
		if (receiverId) {
			checkIfBlocked();
		}
	}, [receiverId, messageReceived, isBlocked]);

	const unblockUser = async () => {
		try {
			const unblock = await axios.post(`http://${window.location.hostname}:5001/api/unblock-user`, {
				receiverId,
				senderId: loggedInAccounts[0]?.id
			})
			if (unblock.data.succes)
			{
				console.log("unBlockUser:Succes");
				setIsBlocked(false);
				setMessageReceived(true);
			}
		} catch (error) {
			console.log("unBlockuser:ERROR:", error);
		}
	}

	if (isBlocked) {
		return (
			<div className="h-full w-full flex flex-col gap-4 items-center justify-center text-gray-400">
				<p>You cannot send or receive messages from this user.</p>
				{amIBlocker &&
				(
					<button onClick={unblockUser} className="bg-[#134588] text-white flex items-center gap-1 px-4 py-2 rounded-lg font-bold transition hover:bg-[#246bcb] cursor-pointer">
						<CgUnblock size={18} />
						Unblock User
					</button>
				)}
			</div>
		);
	}
	
	return (
		<div className="h-full w-full flex flex-col gap-4 items-end overflow-y-auto">
			<div className="h-full w-full flex p-2 flex-col mt-5 bg-white/10 rounded-2xl overflow-y-auto">
				{!chatMessages.length && receiverId !== -1 &&
				(
					<div className="mt-5 w-full flex flex-col items-center">
						<p className="text-xs font-light opacity-30">You're chatting with</p>
						<h1 className="text-base font-light opacity-100">{receiverUsername}</h1>
						<p className="text-xs font-light opacity-30 mt-2">Send your first message...</p>
					</div>
				)}
				{chatMessages.map((message) => {
					const isGameInvite = message.content === "::gameInvite::";
					const msgStatus = message.status;
					const isSender = loggedInAccounts[0]?.id === message.senderId;

					return (
						<div key={message.id} className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
							<div className="chat-header font-bold">
								{message.senderUsername}
								<time className="text-xs opacity-50">
									{format(new Date(message.timestamp), "HH:mm")}
								</time>
							</div>

							{isGameInvite ? (
								<div className="chat-bubble px-4 py-2 rounded-lg flex flex-col items-center bg-black/40 text-white shadow-2xl">
									<p className="mb-2">
										{isSender ? "You sent a game invite!" : `${message.senderUsername} invited you to play a game!`}
									</p>
									{isSender && msgStatus === 1 && (
										<div className="flex gap-2">
											<motion.div whileHover={{ scale: 1.17 }} whileTap={{ scale: 0.89 }}>
												<MdOutlineCancel
													className="text-red-800 hover:text-red-600 transition-colors cursor-pointer"
													size={18}
													onClick={() => handleGameInviteResponse(message.id, 4)}
												/>
											</motion.div>
										</div>
									)}

									{!isSender && msgStatus === 1 && (
										<div className="flex gap-2">
											<motion.div whileHover={{ scale: 1.17 }} whileTap={{ scale: 0.89 }}>
												<FiCheckCircle
													size={18}
													className="text-green-800 hover:text-green-600 transition-colors cursor-pointer"
													onClick={() => handleGameInviteResponse(message.id, 2)}
												/>
											</motion.div>
											<motion.div whileHover={{ scale: 1.17 }} whileTap={{ scale: 0.89 }}>
												<MdOutlineCancel
													size={18}
													className="text-red-800 hover:text-red-600 transition-colors cursor-pointer"
													onClick={() => handleGameInviteResponse(message.id, 3)}
												/>
											</motion.div>
										</div>
									)}
									{msgStatus === 2 && <p className="text-green-400 mt-2">✔️ {isSender ? "Your invite was accepted!" : "You accepted the game invite"}</p>}
									{msgStatus === 3 && <p className="text-red-400 mt-2">❌ {isSender ? "Your invite was declined" : "You declined the game invite"}</p>}
									{msgStatus === 4 && <p className="text-red-400 mt-2"> {"The invite was cancelled"}</p>}
								</div>
							) : (
								<div className={`chat-bubble ${isSender ? "bg-[#ff914d]" : "bg-[#134588]"}`}>
									{message.content}
								</div>
							)}
						</div>
					);
				})}
				{isTyping &&
				(
					<div className="chat chat-start">
						<div className="chat-header font-bold">
							{isTyping}
						</div>
						<div className="chat-bubble bg-[#134588] text-white">
							<div className="typing-indicator">
								<span></span>
								<span></span>
								<span></span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<MessageInput isBlocked={isBlocked} />
		</div>
	);
}

function MessageMenu({ setMessageMenu }: { setMessageMenu: (open: boolean) => void }) 
{
	const { loggedInAccounts } = useAccountContext();
	const { receiverId, setMessageReceived, setIsBlocked } = useChatContext();
	const sendGameInvite = async () => 
	{
		try {
			const response = await axios.post(`http://${window.location.hostname}:5001/api/send-message`, {
					content: "::gameInvite::",
					senderId: loggedInAccounts[0]?.id,
					receiverId: receiverId,
					status: 1 // pending invite
			});

			if (response.data.success)
			{
				console.log("SendGameInvite:succes");
				setMessageReceived(true);
			}
		} catch (error) {
			console.log("SendGameInvite:ERROR:", error);
		}
		setMessageMenu(false);
	}

	const blockUser = async () => 
	{
		try {
			const block = await axios.post(`http://${window.location.hostname}:5001/api/block-user`, {
				receiverId,
				senderId: loggedInAccounts[0]?.id
			})
			if (block.data.succes)
			{
				console.log("BlockUser:Succes");
				setIsBlocked(true);
				setMessageReceived(true);
			}
		} catch (error) {
			console.log("Blockuser:ERROR:", error);
		}
	}

	const unblockUser = async () => {
		try {
			const unblock = await axios.post(`http://${window.location.hostname}:5001/api/unblock-user`, {
				receiverId,
				senderId: loggedInAccounts[0]?.id
			})
			if (unblock.data.succes)
			{
				console.log("unBlockUser:Succes");
				setIsBlocked(false);
				setMessageReceived(true);
			}
		} catch (error) {
			console.log("unBlockuser:ERROR:", error);
		}
	}

	return (
		<div className="absolute bottom-full flex right-0 mb-5 bg-[#222222] text-gray-100 p-3 rounded-xl shadow-2xl z-50">
			<ul className="space-y-2 text-sm font-bold">
				<li className="cursor-pointer flex items-center gap-1 bg-[#ff914d] hover:bg-[#ab5a28] p-2 rounded-md transition-colors"
					onClick={sendGameInvite}>
						<BiRocket size={16}/>
					Send game invite
				</li>
				<li className="cursor-pointer flex items-center gap-1 p-2 bg-[#ff914d] hover:bg-[#ab5a28] rounded-md transition-colors"
					onClick={blockUser}>
						<MdBlock size={16}/>
					Block user
				</li>
			</ul>
		</div>
	);
}

function MessageInput()
{
	const {loggedInAccounts} 					= useAccountContext();
	const {receiverId, setMessageReceived}		= useChatContext();
	const [isMessageMenuOpen, setMessageMenu] 	= useState(false);

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) =>
	{
		if (e.key !== 'Enter') return;

		const target = e.target as HTMLInputElement;
		const message = target.value.trim();

		if (!message) return;

		try {
			const response = await axios.post(`http://${window.location.hostname}:5001/api/send-message`,
			{
				senderId: loggedInAccounts[0]?.id,
				receiverId: receiverId,
				content: message,
				status: 0
			});

			if (response.data.success)
			{
				console.log("MessageInput: setMessageReceived(true)");
				setMessageReceived(true);
			}
			target.value = '';
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	async function sendIsTyping()
	{
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/send-istyping`,
			{
				senderId: loggedInAccounts[0]?.id,
				receiverId: receiverId
			})
		}
		catch (error: any)
		{
			console.error("Error in send isTyping", error)
		}
	}

	return (
		<div className="relative w-full">
			<input
				className="w-full bg-white/10 p-3 rounded-2xl pr-12"
				placeholder="Type your message..."
				onKeyDown={handleKeyDown}
				onChange={sendIsTyping}
			/>
			<motion.div
				whileHover={{ scale: 1.17 }}
				whileTap={{ scale: 0.89 }}
				className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#ff914d] hover:text-[#ab5a28] transition-colors cursor-pointer"
				onClick={() => setMessageMenu((prev) => !prev)}
			>
				<FiPlus size={25} />
			</motion.div>

			{isMessageMenuOpen && <MessageMenu setMessageMenu={setMessageMenu} />}
		</div>
	);
}

export default Chat