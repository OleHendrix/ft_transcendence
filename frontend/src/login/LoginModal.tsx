import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import { LoginFormType } from "../types";
import { defaultLoginValidation } from "../objects";
import { useAccountContext } from "../contexts/AccountContext";
import CloseButton from "../utils/CloseButton";
import { checkLogin, check2FA, resetValidation, InputField, ValidationMessage, LoginButton } from "./utils";

function LoginModal()
{
	const { loggedInAccounts, setLoggedInAccounts } = useAccountContext();
	const [show2FA, setShow2FA] = useState(false);
	const [token, setToken] = useState('');
	const [tempJwt, setTempJwt] = useState('');
	const [formData, setFormData] = useState<LoginFormType>({ username: '', password: '' });
	const [emptyForm, setEmptyForm] = useState(true);
	const [validation, setValidation] = useState(defaultLoginValidation);

	const navigate = useNavigate();

	useEffect(() =>
	{
		resetValidation({ formData, loggedInAccounts, setValidation, setEmptyForm });
	}, [formData, loggedInAccounts]);

	return (
		<div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-xl">
				<CloseButton onClick={() => navigate('/')} />
				<h2 className="text-2xl font-bold mb-6 text-center">Login your account</h2>
				<form className="space-y-4" onSubmit={async (e) =>
				{
					e.preventDefault();
					const authProps = { formData, token, tempJwt, setShow2FA, setTempJwt, setValidation, setLoggedInAccounts };
					const success = show2FA ? await check2FA(authProps) : await checkLogin(authProps);
					if (success) navigate('/');
				}}>
				<InputField label="Username" type="text" name="username" placeholder="Type your username"
							validation={validation} onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} />
				<InputField label="Password" type="password" name="password" placeholder="Type your password"
							validation={validation} onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} />
				{show2FA &&
				<InputField label="2FA Code" type="text" name="token" placeholder="Enter 6 digit code" 
							validation={validation} onChange={(e) => setToken(e.target.value)} />}
				<ValidationMessage text="You're already logged in!" visible={validation['Already logged in']} colorClass="text-[#ff914d]" />
				<ValidationMessage text="Username not found, please try again." visible={validation['Username not found']} />
				<ValidationMessage text="Invalid Password" visible={validation['Password incorrect']} />
				<ValidationMessage text="Invalid 2FA Code" visible={validation['2FA Code incorrect']} />
				<div className="pt-2">
					<LoginButton disabled={emptyForm || Object.values(validation).some((value) => value)} label={show2FA ? "Authorize" : "Login"}/>
				</div>
			</form>
			</div>
		</div>
	);
}

export default LoginModal;