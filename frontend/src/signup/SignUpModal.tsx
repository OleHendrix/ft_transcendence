import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import { UsernameField, EmailField, PasswordField, ConfirmPasswordField } from '../utils/forms/InputFields';
import { AlreadyLoggedInMessage, AccountExistsMessage} from '../utils/forms/ValidationMessages';
import { SignUpButton, LoginMessage } from "../utils/forms/utils";
import { SubmitSignUp } from "../utils/forms/SubmitSignUp";
import { useAccountContext } from "../contexts/AccountContext";
import axios from "axios";

function SignUpModal()
{
	const { loggedInAccounts, setTriggerFetchAccounts } = useAccountContext();
	const [formData, setFormData] = useState({username: '', email: '', password: '', confirmPassword: ''});
	const [emptyForm, setEmptyForm] = useState(true);
	const [validation, setValidation] = useState(
		{
			'Already logged in': false,
			'Username exists': false,
			'Email exists': false,
			'Password does not match': false,
			'Password matches!': false
		});
	
	const navigate = useNavigate();
		
	useEffect(() =>
	{
		async function checkValidation()
		{
			try
			{
				const response = await axios.post(`http://${window.location.hostname}:5001/api/check-validation`,
					{
						username: formData.username,
						email: formData.email
					});
				if (!response.data.success)
				{
					setValidation(prev => (
						{
							...prev,
							[response.data.type]: true,
						}
					))
				}
				else
				{
					setValidation(prev => (
						{
							...prev,
							'Username exists': false,
							'Email exists': false
						}
					))
				}
			}
			catch (error: any)
			{
				console.error("Error in vaidation")
			}
		}; checkValidation();

		setValidation(prev => (
		{
			...prev,
			'Already logged in': (loggedInAccounts.some(account => account.username === formData.username || account.email === formData.email)),
			'Password does not match': (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) ? true : false,
			'Password matches!': (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword) ? true : false
		}));
		setEmptyForm(Object.values(formData).some(field => field === ""));
	}, [formData]);

	return(
	<AnimatePresence>
		<motion.div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
			<motion.div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				{/* {isLoading &&
				(
					<div className="absolute inset-0 bg-[#2a2a2a] bg-opacity-95 rounded-lg flex flex-col items-center justify-center z-10">
						<Loader />
					</div>
				)} */}
				<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
					onClick={() => navigate('/')}>
					<IoMdClose size={24} />
				</button>
				<h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
				<form className="space-y-4"
					onSubmit={ async (e) => 
					{
						e.preventDefault();
						if (await SubmitSignUp( formData ))
						{
							navigate('/login')
							setTriggerFetchAccounts(true)
						}
					}}>
					<UsernameField validation={validation} formData={formData} setFormData={setFormData} />
					<EmailField validation={validation} formData={formData} setFormData={setFormData} />
					<PasswordField validation={validation} formData={formData} setFormData={setFormData} />
					<ConfirmPasswordField validation={validation} formData={formData} setFormData={setFormData} />
					{validation['Already logged in'] && <AlreadyLoggedInMessage />}
					{((validation['Username exists'] || validation['Email exists'])) && !validation['Already logged in'] && <AccountExistsMessage />}
					<SignUpButton validation={validation} emptyForm={emptyForm} />
					{!(validation['Already logged in'] && validation['Username exists'] || validation['Email exists']) && <LoginMessage />}
				</form>
			</motion.div>
		</motion.div>
	</AnimatePresence>
	)
}

export default SignUpModal