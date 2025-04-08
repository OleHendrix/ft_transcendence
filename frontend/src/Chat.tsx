import { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import Player from "./assets/Player.svg";
import { BiSolidChat, BiSearch } from "react-icons/bi";
import { FiPlus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { RiGroup2Line } from "react-icons/ri";
import axios from 'axios';
import { useAccountContext } from "./contexts/AccountContext";
import { useChatContext } from "./contexts/ChatContext";
import { format } from 'date-fns';

function Chat()
{
	const {loggedInAccounts} 													= useAccountContext();
	const {receiverId, chatSessionId, isOpen, messageReceived} 					= useChatContext();
	const {setChatMessages, setChatSessionId, setMessageReceived, setIsOpen}	= useChatContext();

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

		socket.onmessage = function(message)
		{
			console.log(`Frontend:useEffect:socket.onMessage.setmessageReceived(true)`);
			setMessageReceived(true);
		};
		
		return () => {
			console.log("Closing WebSocket...");
			socket.close();
		};
	}, [chatSessionId]);

	return(
		<div className="absolute left-[2vw] bottom-[2vw] hover:cursor-pointer">
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
		onClick={(e) =>
		{
			if (!(e.target as HTMLElement).closest('.chat'))
				setIsOpen(false);
		}}>
		<div className="chat absolute left-[2vw] bottom-[2vw] flex flex-col items-start p-6 pt-10 h-[700px] w-[800px] bg-black/90 shadow-2xl rounded-2xl z-50">
			<button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
				<IoMdClose size={24} />
			</button>

			<ChatHeader />
			<MessageList />
		</div>
	</div>
);
}

function ChatHeader()
{
	const {accounts, loggedInAccounts} 	= useAccountContext();
	const {setReceiverId} 				= useChatContext();

	return (
		<div className="flex justify-end space-x-2 w-full flex-wrap mb-2">
			{accounts
				.filter((account) => 
					account.username !== loggedInAccounts[0]?.username && !account.admin )
				.map((account, index) => (
					<div key={index} className="flex items-center flex-col space-y-0.5 w-12">
						<motion.img
							src={Player}
							className="h-10 w-auto cursor-pointer"
							whileHover={{ scale: 1.07 }}
							whileTap={{ scale: 0.93 }}
							onClick={() => setReceiverId(account.id)}/>
						<p className="text-[10px] opacity-50 w-full text-center truncate">{account.username}</p>
					</div>
				))}
			<div className="flex items-center flex-col space-y-0.5 w-12">
				<motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }} onClick={() => setReceiverId(-1)}>
					<RiGroup2Line className="h-10 w-auto cursor-pointer text-[#ff914d] hover:text-[#ab5a28] transition-colors" />
				</motion.div>
				<p className="text-[10px] text-[#ff914d] opacity-90 font-bold w-full text-center truncate">Group</p>
			</div>
		</div>
	);
}

function MessageList() {
	const { loggedInAccounts } = useAccountContext();
	const { setMessageReceived, chatMessages, setChatMessages, receiverId, messageReceived, isBlocked, setIsBlocked, amIBlocker, setAmIBlocker} = useChatContext();
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatMessages]);

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
				{amIBlocker && (
					<button 
						onClick={unblockUser} 
						className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold transition hover:bg-red-600"
					>
						Unblock User
					</button>
				)}
			</div>
		);
	}
	
	return (
		<div className="h-full w-full flex flex-col gap-4 items-end overflow-y-auto">
			<div className="h-[35vw] w-full flex p-2 flex-col mt-5 bg-white/10 rounded-2xl overflow-y-auto">
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
								<div
									className={`chat-bubble px-4 py-2 rounded-lg font-bold flex flex-col items-center ${
										isSender ? "bg-[#ff914d] text-white" : "bg-[#134588] text-white"
									}`}
								>
									<p className="mb-2">
										🎮 {isSender ? "You sent a game invite!" : `${message.senderUsername} invited you to play a game!`}
									</p>
									{isSender && msgStatus === 1 && (
										<div className="flex gap-2">
											<button
												onClick={() => handleGameInviteResponse(message.id, 4)}
												className="bg-red-500 text-white px-2 py-0.5 rounded-lg font-bold transition hover:bg-green-600"
											>
												Cancel
											</button>
										</div>
									)}

									{!isSender && msgStatus === 1 && (
										<div className="flex gap-2">
											<button
												onClick={() => handleGameInviteResponse(message.id, 2)}
												className="bg-green-500 text-white px-2 py-0.5 rounded-lg font-bold transition hover:bg-green-600"
											>
												Accept
											</button>
											<button
												onClick={() => handleGameInviteResponse(message.id, 3)}
												className="bg-red-500 text-white px-2 py-0.5 rounded-lg font-bold transition hover:bg-red-600"
											>
												Decline
											</button>
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
		<div className="absolute bottom-full right-5 mb-5 bg-black text-white p-3 rounded-xl shadow-lg w-64 z-50">
			<ul className="mt-2 space-y-2">
				<li
					className="cursor-pointer bg-gray-900 p-2 rounded-md hover:bg-gray-700 transition-colors"
					onClick={sendGameInvite}
				>
					Send game invite
				</li>
				<li
					className="cursor-pointer bg-gray-900 p-2 rounded-md hover:bg-gray-700 transition-colors"
					onClick={blockUser}
				>
					Block this bitch
				</li>
				<li
					className="cursor-pointer bg-gray-900 p-2 rounded-md hover:bg-gray-700 transition-colors"
					onClick={unblockUser}
				>
					Unblock this bitch
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

	return (
		<div className="relative w-full">
			<input
				className="w-full bg-white/10 p-3 rounded-2xl pr-12"
				placeholder="Type your message..."
				onKeyDown={handleKeyDown}
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