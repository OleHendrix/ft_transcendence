import { SignUpFormType, PlayerType, SignUpValidatonType } from "../../types";
import axios from "axios";

interface CheckValidationProps
{
	formData: SignUpFormType;
	loggedInAccounts: PlayerType[];
	setValidation: React.Dispatch<React.SetStateAction<SignUpValidatonType>>;
	setEmptyForm: React.Dispatch<React.SetStateAction<boolean>>;
	prevUsername?: string;
	prevEmail?: string;
}

export async function checkValidation({formData, loggedInAccounts, setValidation, setEmptyForm, prevUsername, prevEmail}: CheckValidationProps)
{
	try
	{
		const payload: any =
		{
			username: formData.username,
			email: formData.email
		};
		if (prevUsername)
			payload.prevUsername = prevUsername;
		if (prevEmail)
			payload.prevEmail = prevEmail;
		const response = await axios.post(`http://${window.location.hostname}:5001/api/check-validation`, payload);
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
		console.error("Error in validation")
	}

	setValidation(prev => (
	{
		...prev,
		'Already logged in': loggedInAccounts.some(account =>
		(
			(account.username === formData.username && formData.username !== prevUsername) ||
			(account.email === formData.email && formData.email !== prevEmail)
		)
		),
		'Password does not match': (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) ? true : false,
		'Password matches!': (formData.password && formData.confirmPassword && formData.password === formData.confirmPassword) ? true : false
	}));
	setEmptyForm(Object.values(formData).some(field => field === ""));
}

