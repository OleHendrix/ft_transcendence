import { createContext, useState, useEffect, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type LoginContextType = 
{
	showSignupModal: boolean;
	setShowSignupModal: Dispatch<SetStateAction<boolean>>;
	showLoginModal: boolean;
	setShowLoginModal: Dispatch<SetStateAction<boolean>>;
	showPlayerStats: boolean;
	setShowPlayerStats: Dispatch<SetStateAction<boolean>>;
	indexPlayerStats: number;
	setIndexPlayerStats: Dispatch<SetStateAction<number>>;
};

const LoginContext = createContext<LoginContextType | null>(null);

export function LoginProvider({ children }: {children: ReactNode})
{
	const [showSignupModal, setShowSignupModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showPlayerStats, setShowPlayerStats] = useState(false);
	const [indexPlayerStats, setIndexPlayerStats] = useState(-1);
	

	const value = useMemo(() => (
	{
		showSignupModal, setShowSignupModal,
		showLoginModal, setShowLoginModal,
		showPlayerStats, setShowPlayerStats,
		indexPlayerStats, setIndexPlayerStats
	}), [showSignupModal, showLoginModal, showPlayerStats, indexPlayerStats, setIndexPlayerStats]);

	return (
		<LoginContext.Provider value={value}>
			{ children }
		</LoginContext.Provider>
	);
}

export function useLoginContext()
{
	const context = useContext(LoginContext);
	if (!context)
		throw new Error("Error");
	return context;
}