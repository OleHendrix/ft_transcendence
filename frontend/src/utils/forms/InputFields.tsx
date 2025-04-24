import { SignUpFormType, SignUpValidatonType } from "../../types";

interface FieldProps
{
	validation: SignUpValidatonType;
	setFormData: React.Dispatch<React.SetStateAction<SignUpFormType>>;
	formData: SignUpFormType;
}

export function UsernameField({validation, formData, setFormData}: FieldProps)
{
	return (
		<div>
			<label className="block text-sm font-medium mb-1">Username</label>
				<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
				${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
				: 'border-gray-600 focus:border-white'} focus:outline-none`}
				name="username" type="text" placeholder="Choose a username" maxLength={10}
				onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
		</div>
		)
}

export function EmailField({validation, formData, setFormData}: FieldProps)
{
	return (
		<div>
			<label className="block text-sm font-medium mb-1">Email</label>
			<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
				${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
				: 'border-gray-600 focus:border-white'} focus:outline-none`}
				name="email" type="email" placeholder="Enter your email" maxLength={30}
				onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
		</div>
	)
}

export function PasswordField({validation, formData, setFormData}: FieldProps)
{
	return (
		<div>
			<label className="block text-sm font-medium mb-1">Password</label>
			<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
				${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
				: validation['Password does not match'] ? 'border-red-800'
				: validation['Password matches!'] ? 'border-green-500'
				: 'border-gray-600 focus:border-white'}  focus:outline-none`}
				name="password" type="password" placeholder="Create a password" maxLength={10}
				onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
		</div>
	)
}

export function ConfirmPasswordField({validation, formData, setFormData}: FieldProps)
{
	return (
		<div>
			<label className="block text-sm font-medium mb-1">Confirm Password</label>
			<input className={`w-full p-2 bg-[#3a3a3a] font-medium rounded-3xl border
				${(validation['Already logged in'] || validation['Username exists'] || validation['Email exists']) ? 'border-[#ff914d] focus:border-[#ff914d]'
				: validation['Password does not match'] ? 'border-red-800'
				: validation['Password matches!'] ? 'border-green-500'
				: 'border-gray-600 focus:border-white'} focus:outline-none`}
				name="confirmPassword" type="password" placeholder="Confirm your password" maxLength={10}
				onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})}/>
		</div>
	)
}