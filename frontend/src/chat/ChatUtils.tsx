import { motion } from 'framer-motion';
import { FaUserFriends } from "react-icons/fa";
import { RiGamepadLine } from "react-icons/ri";
import { Message, PlayerState } from '../types'
import { useChatContext } from '../contexts/ChatContext';
import { useAccountContext } from '../contexts/AccountContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MessageProps
{
	message: Message;
	isSender: boolean;
}

export function GameInvite( {message, isSender} : MessageProps)
{
	const { loggedInAccounts, setIsPlaying } = useAccountContext();
	const { receiverId, setChatMessages } = useChatContext();
	const navigate = useNavigate();
 
	async function handleGameInviteResponse(messageId: number, newStatus: number)
	{
		try
		{
			await axios.post(`http://${window.location.hostname}:5001/api/change-msg-status`,
			{
				senderId: loggedInAccounts[0]?.id,
				receiverId,
				status: newStatus,
				messageId,
			});
			if (newStatus === 2) {
				const result = await axios.post(`http://${window.location.hostname}:5001/invite/accept`, { msgID: messageId, user: {id: loggedInAccounts[0].id , username: loggedInAccounts[0].username}});
				if (result.data === true) {
					setIsPlaying(PlayerState.playing);
					navigate('/pong-game');
				}
			} else if (newStatus >= 3) {
				await axios.post(`http://${window.location.hostname}:5001/invite/decline`, { msgID: messageId });
			}

			setChatMessages((prevMessages) => // update localstorage 
				prevMessages.map((msg) =>
					msg.id === messageId ? { ...msg, status: newStatus } : msg
				)
			);
		}
		catch (error)
		{
			console.log("Error occurred when changing msg status:", error);
		}
	};

	return (
		<div key={message.id} className="mt-5 -mx-2 w-[calc(100%+1rem)] flex flex-col bg-white/2 py-4 gap-1 items-center shadow-2xl">

			<time className="text-xs opacity-30">
		 		{format(new Date(message.timestamp), "HH:mm")}
		 	</time>
			{!isSender &&
			(
				<h1 className="text-base italic opacity-100 hover:underline" onClick={() => navigate(`/playerstats/${message.senderUsername}`)}>
					{message.senderUsername}
				</h1>
			)}
			<p className="text-xs font-light opacity-50 mt-2">{isSender ? 'You sended an invite to play!' : 'Wants to play a game!'}</p>
			<RiGamepadLine size={18} className='opacity-40' />
			{isSender && message.status === 1 &&
			(
				<motion.button className="text-xs bg-red-900 hover:bg-red-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
					onClick={() => handleGameInviteResponse(message.id, 4)}>
					Cancel invite
				</motion.button>
			)}
			{!isSender && message.status === 1 &&
			(
				<div className="flex gap-2">
					<motion.button className="text-xs bg-red-900 hover:bg-red-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
						onClick={() => handleGameInviteResponse(message.id, 3)}>
						Cancel
					</motion.button>
					<motion.button className="text-xs bg-green-900 hover:bg-green-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
						onClick={() => handleGameInviteResponse(message.id, 2)}>
						Accept
					</motion.button>
				</div>
			)}
			{message.status === 2 && <p className="text-xs font-light opacity-70 text-green-400 mt-2">{isSender ? "Your invite was accepted!" : "You accepted the game invite"}</p>}
		 	{message.status === 3 && <p className="text-xs font-light opacity-70 text-red-400 mt-2">{isSender ? "Your invite was declined" : "You declined the game invite"}</p>}
		 	{message.status === 4 && <p className="text-xs font-light opacity-70 text-red-400 mt-2"> {"The invite was cancelled"}</p>}
		</div>
	)
}

export function FriendRequest( {message, isSender} : MessageProps)
{
	const { loggedInAccounts } = useAccountContext();
	const { receiverId, receiverUsername } = useChatContext();
	const navigate = useNavigate();
 
	async function handleFriendshipResponse(messageId: number, newStatus: number)
	{
		try
		{
			const response = await axios.post(`http://${window.location.hostname}:5001/api/update-friendship`,
			{
				senderId: loggedInAccounts[0]?.id,
				receiverId,
				status: newStatus,
				messageId
			})
		}
		catch (error: any)
		{
			console.log(error)
		}
	}

	return (
		<div key={message.id} className="mt-5 -mx-2 w-[calc(100%+1rem)] flex flex-col bg-white/2 py-4 gap-1 items-center shadow-2xl">
			<time className="text-xs opacity-30">
		 		{format(new Date(message.timestamp), "HH:mm")}
		 	</time>
			{!isSender &&
			(
				<h1 className="text-base italic opacity-100 hover:underline" onClick={() => navigate(`/playerstats/${message.senderUsername}`)}>
					{message.senderUsername}
				</h1>
			)}
			<p className="text-xs font-light opacity-50 mt-2">{isSender ? 'You sended a friend request!' : 'Wants to be friends!'}</p>
			<FaUserFriends size={18} className='opacity-30' />
			{isSender && message.status === 1 &&
			(
				<motion.button className="text-xs bg-red-900 hover:bg-red-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
					onClick={() => handleFriendshipResponse(message.id, 4)}>
					Cancel invite
				</motion.button>
			)}
			{!isSender && message.status === 1 &&
			(
				<div className="flex gap-2">
					<motion.button className="text-xs bg-red-900 hover:bg-red-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
						onClick={() => handleFriendshipResponse(message.id, 3)}>
						Cancel
					</motion.button>
					<motion.button className="text-xs bg-green-900 hover:bg-green-800 py-1 px-2 rounded-md flex gap-2 mt-2 shadow-2xl cursor-pointer" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.89 }}
						onClick={() => handleFriendshipResponse(message.id, 2)}>
						Accept
					</motion.button>
				</div>
			)}
			{message.status === 2 && <p className="text-xs font-light opacity-70 text-green-400 mt-2">{`You are now friends with ${isSender ?  receiverUsername : message.senderUsername}`}</p>}
		 	{message.status === 3 && <p className="text-xs font-light opacity-70 text-red-400 mt-2">{isSender ? `${receiverUsername} declined the friend request` : "You declined the friend request"}</p>}
		 	{message.status === 4 && <p className="text-xs font-light opacity-70 text-red-400 mt-2"> {"The friend request was cancelled"}</p>}
		</div>
	)
}

export function DefaultMessage({ message, isSender }: MessageProps)
{
	const navigate = useNavigate();

	return (
		<div key={message.id} className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
			<div className="chat-header font-bold hover:underline" onClick={() => navigate(`/playerstats/${message.senderUsername}`)}>
				{message.senderUsername}
				<time className="text-xs opacity-50">
					{format(new Date(message.timestamp), "HH:mm")}
				</time>
			</div>
			<div className={`chat-bubble ${isSender ? "bg-[#ff914d]" : "bg-[#134588]"}`}>
				{message.content}
			</div>
		</div>
	)
}

export function EmptyChatBanner( {receiverUsername }: {receiverUsername: string})
{
	const navigate = useNavigate();

	return (
		<div className="mt-5 w-full flex flex-col items-center">
			<p className="text-xs font-light opacity-30">You're chatting with</p>
			<h1 className="text-base font-light opacity-100 hover:underline" onClick={() => navigate(`/playerstats/${receiverUsername}`)}>
				{receiverUsername}
			</h1>
			<p className="text-xs font-light opacity-30 mt-2">Send your first message...</p>
		</div>
	)
}

export function IsTypingBubble( { isTyping }: {isTyping: string})
{
	return (
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
	)
}




