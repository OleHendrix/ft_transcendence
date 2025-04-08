import { createContext, ReactNode, useMemo, useState, useContext, SetStateAction, Dispatch } from "react";

interface message
{
	id: 				number,
	content: 			string,
	timestamp: 			string,
	receiverId: 		number,
	chatSessionId: 		number,
	senderUsername:		string,
	senderId: 			number,
	status:				number,
}

type ChatContextType = 
{
	receiverId: 		number;
	setReceiverId:		Dispatch<SetStateAction<number>>;
	isOpen:				boolean;
	setIsOpen:			Dispatch<SetStateAction<boolean>>;
	messageReceived:	boolean;
	setMessageReceived:	Dispatch<SetStateAction<boolean>>;
	chatSessionId:		number;
	setChatSessionId:	Dispatch<SetStateAction<number>>;
	chatMessages:		message[];
	setChatMessages:	Dispatch<SetStateAction<message[]>>;
	messageMenu:		boolean;
	setMessageMenu:		Dispatch<SetStateAction<boolean>>;
	isTyping:			string;
	setIsTyping:		Dispatch<SetStateAction<string>>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: {children: ReactNode})
{
	const [receiverId, setReceiverId] 			= useState(-1);
	const [isOpen, setIsOpen] 					= useState(false);
	const [messageReceived, setMessageReceived] = useState(false);
	const [chatSessionId, setChatSessionId] 	= useState(1);
	const [chatMessages, setChatMessages] 		= useState<message[]>([]);
	const [messageMenu, setMessageMenu] 		= useState(false);
	const [isTyping, setIsTyping]				= useState('');

	const value = useMemo(() => (
	{
		receiverId, setReceiverId,
		isOpen, setIsOpen,
		messageReceived, setMessageReceived,
		chatSessionId, setChatSessionId,
		chatMessages, setChatMessages,
		messageMenu, setMessageMenu,
		isTyping, setIsTyping
	}), [receiverId, isOpen, messageReceived, chatSessionId, chatMessages, isTyping, setIsTyping]);

	return (
		<ChatContext.Provider value={value}>
			{ children }
		</ChatContext.Provider>
	);
}

export function useChatContext()
{
	const context = useContext(ChatContext);
	if (!context)
		throw new Error("useChatContext must be used within a ChatProvider");
	return context;
}
export default ChatProvider