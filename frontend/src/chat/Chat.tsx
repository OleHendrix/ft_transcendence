import { useEffect, useState, useRef } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Player from "../../assets/Player.svg";
import { BiSolidChat } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdBlock } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { RiGroup2Line } from "react-icons/ri";
import { CgUnblock } from "react-icons/cg";
import { BiRocket } from "react-icons/bi";
import { GameInvite, DefaultMessage, FriendRequest, IsTypingBubble, EmptyChatBanner } from "./ChatUtils";
import { PlayerData } from "../types";
import axios from 'axios';
import SearchBar from "../utils/SearchBar";
import { useAccountContext } from ".././contexts/AccountContext";
import { useChatContext } from ".././contexts/ChatContext";
import "../css/TypingLoader.css";
import { AddGame } from "../Hero";
import { secureApiCall } from "../jwt/secureApiCall";
import { API_URL } from '../utils/network';
import { WS_URL } from '../utils/network';

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
				const userId = loggedInAccounts[0]?.id;
				if (!userId) return;

				const response = await secureApiCall(userId, (accessToken) =>
					axios.get(`${API_URL}/api/get-messages`,
					{
						headers:
						{
							Authorization: `Bearer ${accessToken}`
						},
						params:
						{
							senderId: userId,
							receiverId,
						},
					})
				);

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
		const socket = new WebSocket(`${WS_URL}/ws/chat?chatSessionId=${chatSessionId}`);

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
			// console.log("Closing WebSocket...");
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
		className="fixed inset-0 backdrop-blur-sm z-20"
		onClick={() => setIsOpen(false)}>
		<div className="chat absolute left-[2vw] bottom-[2vw] flex flex-col justify-between p-6 pt-10 h-[calc(100vh-6vw)] w-[95vw] md:w-[40vw] md:min-w-[475px] bg-black/90 shadow-2xl rounded-2xl z-50" onClick={(e) => e.stopPropagation()}>
			<button className="absolute top-2 right-2 text-gray-400 hover:text-white hover:cursor-pointer" onClick={() => setIsOpen(false)}>
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
	const {accounts, loggedInAccounts, setTriggerFetchAccounts} 		= useAccountContext();
	const [searchInput, setSearchInput] 								= useState('');
	const {receiverId, setReceiverId, setReceiverUsername} 				= useChatContext();

	useEffect(() => setTriggerFetchAccounts(true), []);

	if (!accounts || !loggedInAccounts.length)
		return <div className="text-gray-400 text-sm">Loading chat...</div>;

	return (
		<div className="w-full flex flex-col max-w-full">
		<div className="flex justify-end space-x-2 mb-2 overflow-x-auto">
			{accounts
				.filter((account) => 
					account.username !== loggedInAccounts[0]?.username && !account.admin )
				.filter((account) => account.username.toLowerCase().includes(searchInput.toLowerCase()))
				.map((account, index) => (
					<div key={index} className={`flex items-center flex-col space-y-0.5 w-12 flex-shrink-0 ${receiverId !== account.id ? 'opacity-40' : 'opacity-100'}`}>
						<div className="relative">
						<motion.img
							src={account.avatar !== '' ? account.avatar : Player}
							className="h-10 w-10 cursor-pointer rounded-full object-cover shadow-lg"
							whileHover={{ scale: 1.07 }}
							whileTap={{ scale: 0.93 }}
							onClick={() => {setReceiverId(account.id); setReceiverUsername(account.username)}}/>
							{account.avatar !== '' && <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black to-transparent opacity-70"></div>}
							</div>
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
		<div className="w-full flex justify-end">
		<SearchBar setSearchInput={setSearchInput} /> 
		</div>
		</div>
	);
}

function MessageList()
{
	const { loggedInAccounts } = useAccountContext();
	const { setMessageReceived, chatMessages, setChatMessages, receiverId, receiverUsername, messageReceived, isBlocked, setIsBlocked, amIBlocker, setAmIBlocker, isTyping, setIsTyping} = useChatContext();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() =>
	{
		if (messagesEndRef.current)
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages, isTyping]);

	useEffect(() =>
	{
		async function typeStatus()
		{
			const startTime = Date.now();
			const elapsedTime = Date.now() - startTime;
			const remainingTime = Math.max(0, 3000 - elapsedTime);
			await new Promise(resolve => setTimeout(resolve, remainingTime));
			setIsTyping('');
		}; typeStatus()
	}, [isTyping])

	useEffect(() =>
	{
		async function checkIfBlocked()
		{
			try
			{
				const userId = loggedInAccounts[0]?.id;
				if (!userId) return;

				const response = await secureApiCall(userId, (accessToken) =>
					axios.get(`${API_URL}/api/is-blocked`,
					{
						headers:
						{
							Authorization: `Bearer ${accessToken}`
						},
						params:
						{
							senderId: userId,
							receiverId,
						},
					})
				);
				setIsBlocked(response.data.blocked);
				setAmIBlocker(response.data.amIBlocker); 
			}
			catch (error)
			{
				console.error("Error checking block status:", error);
			}
		}; checkIfBlocked();
		if (receiverId)
			checkIfBlocked();
	}, [receiverId, messageReceived, isBlocked]);

	async function unblockUser()
	{
		try
		{
			const userId = loggedInAccounts[0]?.id;
			if (!userId) return;

			const unblock = await secureApiCall(userId, (accessToken) =>
				axios.post(`${API_URL}/api/unblock-user`, 
				{
					receiverId,
					senderId: userId
				},
				{
					headers:
					{
						Authorization: `Bearer ${accessToken}`
					}
				})
			);
			if (unblock.data.succes)
			{
				console.log("unBlockUser:Succes");
				setIsBlocked(false);
				setMessageReceived(true);
			}
		}
		catch (error)
		{
			console.log("unBlockuser:ERROR:", error);
		}
	}

	if (isBlocked)
	{
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
			{!chatMessages.length && receiverId !== -1 && <EmptyChatBanner receiverUsername={receiverUsername} />}
			{chatMessages.map((message) =>
			{
				const isGameInvite = message.content === "::gameInvite::";
				const isFriendRequest = message.content === "::friendRequest::";
				const isSender = loggedInAccounts[0]?.id === message.senderId;
				if (isGameInvite)
					return <GameInvite key={message.id} message={message} isSender={isSender} />;
				else if (isFriendRequest)
					return <FriendRequest key={message.id} message={message} isSender={isSender} />;
				else
					return <DefaultMessage key={message.id} message={message} isSender={isSender} />;
			})}
			{isTyping && <IsTypingBubble isTyping={isTyping} />}
			<div ref={messagesEndRef} />
		</div>
		<MessageInput />
		</div>
	);
}

function MessageMenu({ setMessageMenu }: { setMessageMenu: (open: boolean) => void }) 
{
	const { loggedInAccounts, setIsPlaying } = useAccountContext();
	const { receiverId, setMessageReceived, setIsBlocked } = useChatContext();
	const navigate = useNavigate();

	function inviteSocket(msgID: number) {
		console.log("in invite socket", msgID);
		const socket = new WebSocket(`${WS_URL}/invite/send`);

		socket.addEventListener("open", () => {
			socket.send(JSON.stringify({ ID: msgID, senderID: loggedInAccounts[0].id }));
		});

		socket.addEventListener("message", (event) => {
			try {
				const opponent = JSON.parse(event.data);
				AddGame(
					{id: loggedInAccounts[0].id, username: loggedInAccounts[0].username}, 
					{id: opponent.id, username: opponent.username}, 
					false,
					setIsPlaying,
					navigate
				);
			} catch (error) {
				console.error("Invalid event.data:", event.data);
			}
		});

		const handleUnload = () => {
			socket.close();
		};
		window.addEventListener("beforeunload", handleUnload);
	}

	const sendGameInvite = async () => 
	{
		try
		{
			const userId = loggedInAccounts[0]?.id;
			if (!userId) return;

			const response = await secureApiCall(userId, (accessToken) =>
				axios.post(`${API_URL}/api/send-message`,
				{
						content: "::gameInvite::",
						senderId: userId,
						receiverId: receiverId,
						status: 1 // pending invite
				},
				{
					headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
				})
			);

			if (response.data.success) {
				console.log("SendGameInvite:succes");
				setMessageReceived(true);
				inviteSocket(response.data.messageToClient.id);
			}
		} catch (error) {
			console.log("SendGameInvite:ERROR:", error);
		}
		setMessageMenu(false);
	}

	async function sendFriendRequest()
	{
		try
		{
			const response = await axios.post(`${API_URL}/api/send-friendship`,
			{
				requesterId: loggedInAccounts[0].id,
				receiverId: receiverId
			})
			if (response.data.success)
				setMessageReceived(true);
		}
		catch (error: any)
		{
			console.log(error.response)
		}
		setMessageMenu(false);
	}

	const blockUser = async () => {
		try {
			const block = await secureApiCall(loggedInAccounts[0]?.id, (accessToken) =>
				axios.post(`${API_URL}/api/block-user`,
				{
					receiverId,
					senderId: loggedInAccounts[0]?.id
				},
				{
					headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
				})
			);
			if (block.data.succes) {
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
			const unblock = await axios.post(`${API_URL}/api/unblock-user`, {
				receiverId,
				senderId: loggedInAccounts[0]?.id
			})
			if (unblock.data.succes) {
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
				<li className="cursor-pointer flex items-center gap-1 bg-[#ff914d] hover:bg-[#ab5a28] p-2 rounded-md transition-colors"
					onClick={sendFriendRequest}>
						<FaUserFriends size={16}/>
					Send friend request
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

		try
		{
			const userId = loggedInAccounts[0]?.id;
			if (!userId) return;

			const response = await secureApiCall(userId, (accessToken) =>
				axios.post(`${API_URL}/api/send-message`,
				{
					senderId: loggedInAccounts[0]?.id,
					receiverId: receiverId,
					content: message,
					status: 0
				},
				{
					headers:
						{
							Authorization: `Bearer ${accessToken}`
						}
				})
			);
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
			await axios.post(`${API_URL}/api/send-istyping`,
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