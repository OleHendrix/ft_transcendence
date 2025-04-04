import { createContext, ReactNode, useMemo, useState, useContext, SetStateAction, Dispatch } from "react";

interface Message {
	id: number;
	content: string;
	timestamp: string;
	receiverId: number;
	chatSessionId: number;
	senderUsername: string;
	senderId: number;
	status: number;
}

type ChatContextType = {
	receiverId: number;
	setReceiverId: Dispatch<SetStateAction<number>>;
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
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
	const [receiverId, setReceiverId] = useState(-1);
	const [isOpen, setIsOpen] = useState(false);
	const [messageReceived, setMessageReceived] = useState(false);
	const [chatSessionId, setChatSessionId] = useState(1);
	const [chatMessages, setChatMessages] = useState<Message[]>([]);
	const [messageMenu, setMessageMenu] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [amIBlocker, setAmIBlocker] = useState(false);

	const value = useMemo(
		() => ({
			receiverId,
			setReceiverId,
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
		}),
		[receiverId, isOpen, messageReceived, chatSessionId, chatMessages, isBlocked, amIBlocker]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
	const context = useContext(ChatContext);
	if (!context) throw new Error("useChatContext must be used within a ChatProvider");
	return context;
}

export default ChatProvider;
