import { useEffect } from "react";
import { motion } from 'framer-motion';
import Player from "./assets/Player.svg";
import { BiSolidChat, BiSearch } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { RiGroup2Line } from "react-icons/ri";
import axios from 'axios';
import { useAccountContext } from "./contexts/AccountContext";
import { useChatContext } from "./contexts/ChatContext";


function Chat()
{
	const {loggedInAccounts} 												= useAccountContext();
	const {receiverId, chatSessionId, isOpen, messageReceived} 				= useChatContext();
	const {setTestChats, setChatSessionId, setMessageReceived, setIsOpen}	= useChatContext();

	/* get messages */
	useEffect(() =>
	{
		async function getMessages()
		{
			try {
				const response = await axios.get('http://localhost:5001/api/get-messages',
				{
					params:
					{
						senderId: loggedInAccounts[0].id,
						receiverId: receiverId
					}
				})
				if (response.data.success)
				{
					setTestChats(response.data.messages);
					setChatSessionId(response.data.chatSessionId);
				}
				
			} catch (error: any) {
				console.log(error.response);
			}
		}
		getMessages();
	}, [receiverId, messageReceived])

	useEffect(() => {
		if (!chatSessionId) return;
	
		console.log("frontend csid:", chatSessionId);
		const socket = new WebSocket(`ws://localhost:5001/ws/chat?chatSessionId=${chatSessionId}`);

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
		{/* Chat Icon */}
		{!isOpen && (
			<motion.div whileHover={{ scale: 1.17 }} whileTap={{ scale: 0.89 }}>
				<BiSolidChat
					size={32}
					className="text-[#ff914d] hover:text-[#ab5a28] transition-colors cursor-pointer"
					onClick={() => loggedInAccounts.length > 0 && setIsOpen(true)}
				/>
			</motion.div>
		)}

		{/* Chat Window */}
		{isOpen && (
			<ChatWindow
				setIsOpen={setIsOpen}
			/>
		)}
	</div>
);
}

function ChatWindow( { setIsOpen }: { setIsOpen: (open: boolean) => void } ) {
	return (
	<div
		className="fixed inset-0 backdrop-blur-sm z-40"
		onClick={(e) => {
			if (!(e.target as HTMLElement).closest('.chat'))
				setIsOpen(false);
		}}
	>
		<div className="chat absolute left-[2vw] bottom-[2vw] flex flex-col items-start p-6 pt-10 h-[700px] w-[800px] bg-black/90 shadow-2xl rounded-2xl z-50">
			<button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
				<IoMdClose size={24} />
			</button>

			<ChatHeader />
			<MessageList />
			<MessageInput />
		</div>
	</div>
);
}

function ChatHeader() {
	const {accounts, loggedInAccounts} 	= useAccountContext();
	const {setReceiverId} 				= useChatContext();

	return (
		<div className="flex justify-end space-x-2 w-full flex-wrap mb-2">
			{accounts
				.filter((account) => account.id !== loggedInAccounts[0]?.id)
				.map((account, index) => (
					<div key={index} className="flex items-center flex-col space-y-0.5 w-12">
						<motion.img
							src={Player}
							className="h-10 w-auto cursor-pointer"
							whileHover={{ scale: 1.07 }}
							whileTap={{ scale: 0.93 }}
							onClick={() => setReceiverId(account.id)}
						/>
						<p className="text-[10px] opacity-50 w-full text-center truncate">{account.username}</p>
					</div>
				))}

			{/* Group Chat Option */}
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
	const {loggedInAccounts} 	= useAccountContext();
	const {testChats} 			= useChatContext();

	return (
		<div className="h-full w-full flex flex-col gap-4 items-start overflow-y-auto">
			<div className="h-[35vw] w-full flex p-2 flex-col mt-5 bg-white/10 rounded-2xl overflow-y-auto">
				{testChats.map((message, index) => (
					<div key={index} className={`chat ${loggedInAccounts[0]?.id !== message.senderId ? 'chat-start' : 'chat-end'}`}>
						<div className="chat-header">
							{message.senderId}
							<time className="text-xs opacity-50">{message.timestamp}</time>
						</div>
						<div className="chat-bubble">{message.content}</div>
					</div>
				))}
			</div>
		</div>
	);
}

function MessageInput() {
	const {loggedInAccounts} 	= useAccountContext();
	const {receiverId, setMessageReceived} 	= useChatContext();

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;

		const target = e.target as HTMLInputElement;
		const message = target.value.trim();

		if (!message)
			return;

		try {
			const response = await axios.post('http://localhost:5001/api/send-message', {
				senderId: loggedInAccounts[0]?.id,
				receiverId: receiverId,
				content: message
			});

			if (response.data.success)
				setMessageReceived(true);
			target.value = '';
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	return (
		<input
			className="w-full bg-white/10 p-3 rounded-2xl"
			placeholder="Type your message..."
			onKeyDown={handleKeyDown}
		/>
	);
}

export default Chat