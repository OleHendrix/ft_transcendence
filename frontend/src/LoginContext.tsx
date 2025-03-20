import { createContext, useState, useEffect, Dispatch, SetStateAction, ReactNode, useContext } from "react";

type FormDataType =
{
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
};

type LoginContextType = 
{
	showSignupModal: boolean;
	setShowSignupModal: Dispatch<SetStateAction<boolean>>;
	showLoginModal: boolean;
	setShowLoginModal: Dispatch<SetStateAction<boolean>>;
	showPlayerStats: boolean;
	setShowPlayerStats: Dispatch<SetStateAction<boolean>>;
	indexPlayerStat: number;
	setIndexPlayerStat: Dispatch<SetStateAction<number>>;

	formData: FormDataType;
	setFormData: Dispatch<SetStateAction<FormDataType>>;
	emptyForm: boolean;
	setEmptyForm: Dispatch<SetStateAction<boolean>>;
	passwordConfirm: number;
	setPasswordConfirm: Dispatch<SetStateAction<number>>;
	alreadyExists: boolean;
	setAlreadyExists: Dispatch<SetStateAction<boolean>>;
	isLoading: boolean;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
};

const LoginContext = createContext<LoginContextType | null>(null);

export function LoginProvider({ children }: {children: ReactNode})
{
	const [showSignupModal, setShowSignupModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [showPlayerStats, setShowPlayerStats] = useState(false);
	const [indexPlayerStat, setIndexPlayerStat] = useState(-1);

	const [formData, setFormData] = useState({username: '', email: '', password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [passwordConfirm, setPasswordConfirm] = useState(1);
	const [alreadyExists, setAlreadyExists] = useState(false);
	const [isLoading, setIsLoading] = useState(false);


	return (
		<LoginContext.Provider value={{ showSignupModal, setShowSignupModal, showLoginModal, setShowLoginModal, showPlayerStats, setShowPlayerStats, indexPlayerStat, setIndexPlayerStat, 
										formData, setFormData, emptyForm, setEmptyForm, passwordConfirm, setPasswordConfirm, alreadyExists, setAlreadyExists, isLoading, setIsLoading }}>
			{ children }
		</LoginContext.Provider>
	);
}

export function useLoginContext()
{
	const context = useContext(LoginContext);
	if (!context)
		throw new Error("neeman");
	return context;
}