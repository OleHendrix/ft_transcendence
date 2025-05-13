import { SignUpFormType } from "../../types";
import axios from "axios";
import { API_URL } from '../../utils/network';

export async function SubmitSignUp(formData: SignUpFormType)
{
		// setIsLoading(true);
		const { username, email, password } = formData;

		console.log("Submitting form...");
		try
		{
			const response = await axios.post(`${API_URL}/api/add-account`, { username, email, password });

			if (response.data.success)
				return (true);
			else
			{
				console.log("Failed to add account:", response.data.message);
				return (false);
			}
		}
		catch (error: any)
		{
			console.error("Signup error:", error.response?.data || error.message);
			return (false);
		}
		// setIsLoading(false);
}