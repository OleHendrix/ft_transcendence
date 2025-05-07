import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UsernameField, EmailField, PasswordField, ConfirmPasswordField } from './utils/InputFields';
import { AlreadyLoggedInMessage, AccountExistsMessage} from './utils/ValidationMessages';
import { SignUpButton, LoginMessage } from "./utils/utils";
import { defaultSignUpValidation, emptySignUpForm } from "../objects";
import { SubmitSignUp } from "./utils/SubmitSignUp";
import CloseButton from "../utils/CloseButton";
import ModalWrapper from "../utils/ModalWrapper";
import { useAccountContext } from "../contexts/AccountContext";
import { checkValidation } from "./utils/checkValidation";
import TermsModal from "./utils/termsModal";

function SignUpModal()
{
	const { loggedInAccounts, setTriggerFetchAccounts } 	= useAccountContext();
	const [formData, setFormData] 							= useState(emptySignUpForm);
	const [emptyForm, setEmptyForm] 						= useState(true);
	const [validation, setValidation] 						= useState(defaultSignUpValidation);
	const [showTerms, setShowTerms]							= useState(false);
	const navigate 											= useNavigate();
		
	useEffect(() =>
	{
		checkValidation({formData, loggedInAccounts, setValidation, setEmptyForm});
	}, [formData]);

	return(
		<ModalWrapper>
			<motion.div className="bg-[#2a2a2a] text-white p-8 rounded-lg w-md h-auto max-h-[80vh] overflow-y-auto relative shadow-xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				{/* {isLoading &&
				(
					<div className="absolute inset-0 bg-[#2a2a2a] bg-opacity-95 rounded-lg flex flex-col items-center justify-center z-10">
						<Loader />
					</div>
				)} */}
				<CloseButton onClick={() => navigate('/')} />
				<h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>
				<form className="space-y-4"
					onSubmit={ async (e) => 
					{
						e.preventDefault();
						if (await SubmitSignUp( formData ))
						{
							navigate('/login');
							setTriggerFetchAccounts(true);
						}
					}}>
					<UsernameField 	validation={validation} formData={formData} setFormData={setFormData} />
					<EmailField		validation={validation} formData={formData} setFormData={setFormData} />
					<PasswordField 	validation={validation} formData={formData} setFormData={setFormData} />
					<ConfirmPasswordField validation={validation} formData={formData} setFormData={setFormData} />
					{validation['Already logged in'] && <AlreadyLoggedInMessage />}
					{((validation['Username exists'] || validation['Email exists'])) && !validation['Already logged in'] && <AccountExistsMessage />}
					<p className="text-xs text-center text-gray-400">
						By signing up you agree to these{" "}
						<button
							type="button"
							onClick={() => setShowTerms(true)}
							className="underline text-blue-400 hover:text-blue-300"
						>
							terms
						</button>
					</p>
					<SignUpButton validation={validation} emptyForm={emptyForm} />
					{!(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) && <LoginMessage />}
				</form>
			</motion.div>
			{showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
		</ModalWrapper>
	)
}

export default SignUpModal