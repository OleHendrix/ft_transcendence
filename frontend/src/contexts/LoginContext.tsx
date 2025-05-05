import { createContext, useState, useMemo, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type LoginContextType = 
{
	showSignUpModal: boolean;
	setShowSignUpModal: Dispatch<SetStateAction<boolean>>;
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
	const [showSignUpModal,  setShowSignUpModal]  = useState(false);
	const [showLoginModal,   setShowLoginModal]   = useState(false);
	const [showPlayerStats,  setShowPlayerStats]  = useState(false);
	const [indexPlayerStats, setIndexPlayerStats] = useState(-1);

	const value = useMemo(() => (
	{
		showSignUpModal, setShowSignUpModal,
		showLoginModal, setShowLoginModal,
		showPlayerStats, setShowPlayerStats,
		indexPlayerStats, setIndexPlayerStats
	}), [showSignUpModal, showLoginModal, showPlayerStats, indexPlayerStats, setIndexPlayerStats]);

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