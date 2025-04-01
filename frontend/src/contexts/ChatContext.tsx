import { createContext, ReactNode, useMemo, useState, useContext, SetStateAction, Dispatch } from "react";

interface message
{
	id: 				number,
	content: 			string,
	timestamp: 			string,
	receiverUsername: 	string,
	chatSessionId: 		number,
	senderUsername: 	string
}

type ChatContextType = 
{
	receiverUsername: string;
	setReceiverUsername: Dispatch<SetStateAction<string>>;
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	messageReceived: boolean;
	setMessageReceived: Dispatch<SetStateAction<boolean>>;
	chatSessionId: number;
	setChatSessionId: Dispatch<SetStateAction<number>>;
	testChats: message[];
	setTestChats: Dispatch<SetStateAction<message[]>>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: {children: ReactNode})
{
	const [receiverUsername, setReceiverUsername] 			= useState('');
	const [isOpen, setIsOpen] 					= useState(false);
	const [messageReceived, setMessageReceived] = useState(false);
	const [chatSessionId, setChatSessionId] 	= useState(-1);
	const [testChats, setTestChats] 			= useState<message[]>([]);

	const value = useMemo(() => (
	{
		receiverUsername, setReceiverUsername,
		isOpen, setIsOpen,
		messageReceived, setMessageReceived,
		chatSessionId, setChatSessionId,
		testChats, setTestChats,
	}), [receiverUsername, isOpen, messageReceived, chatSessionId, testChats]);

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