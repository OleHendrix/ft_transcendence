import { createContext, ReactNode, useMemo, useState, useContext, SetStateAction, Dispatch } from "react";
import { Message } from '../types';

type ChatContextType =
{
	receiverId: number;
	setReceiverId: Dispatch<SetStateAction<number>>;
	receiverUsername: string;
	setReceiverUsername: Dispatch<SetStateAction<string>>;
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	messageReceived: boolean;
	setMessageReceived: Dispatch<SetStateAction<boolean>>;
	chatSessionId: number;
	setChatSessionId: Dispatch<SetStateAction<number>>;
	chatMessages: Message[];
	setChatMessages: Dispatch<SetStateAction<Message[]>>;
	messageMenu: boolean;
	setMessageMenu: Dispatch<SetStateAction<boolean>>;
	isBlocked: boolean;
	setIsBlocked: Dispatch<SetStateAction<boolean>>;
	amIBlocker: boolean;
	setAmIBlocker: Dispatch<SetStateAction<boolean>>;
	isTyping:			string;
	setIsTyping:		Dispatch<SetStateAction<string>>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode })
{
	const [receiverId, setReceiverId] = useState(-1);
	const [receiverUsername, setReceiverUsername] = useState('')
	const [isOpen, setIsOpen] = useState(false);
	const [messageReceived, setMessageReceived] = useState(false);
	const [chatSessionId, setChatSessionId] = useState(1);
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [messageMenu, setMessageMenu] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [amIBlocker, setAmIBlocker] = useState(false);
	const [isTyping, setIsTyping]				= useState('');

	const value = useMemo(
		() => ({
			receiverId,
			setReceiverId,
			receiverUsername,
			setReceiverUsername,
			isOpen,
			setIsOpen,
			messageReceived,
			setMessageReceived,
			chatSessionId,
			setChatSessionId,
			chatMessages,
			setChatMessages,
			messageMenu,
			setMessageMenu,
			isBlocked,
			setIsBlocked,
			amIBlocker,
			setAmIBlocker,
			isTyping, setIsTyping
	}),
		[receiverId, receiverUsername, isOpen, messageReceived, chatSessionId, chatMessages, isTyping, setIsTyping, isBlocked, amIBlocker]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
	const context = useContext(ChatContext);
	if (!context) throw new Error("useChatContext must be used within a ChatProvider");
	return context;
}

export default ChatProvider;
