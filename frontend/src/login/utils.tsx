import { Dispatch, SetStateAction } from "react";
import React from "react";
import { PlayerType, LoginFormType, LoginValidationType } from "../types";
import { motion } from 'framer-motion';
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

//Helper Functions

export interface AuthProps
{
	formData: LoginFormType;
	token?: string;
	tempJwt?: string;
	setShow2FA: Dispatch<SetStateAction<boolean>>;
	setTempJwt: Dispatch<SetStateAction<string>>;
	setValidation: Dispatch<SetStateAction<LoginValidationType>>;
	setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>;
}

export async function check2FA({ token = '', tempJwt = '', setLoggedInAccounts, setValidation }: AuthProps)
{
	try
	{
		const response = await axios.post(`${API_URL}/api/auth/verify-totp`,
		{
			token
		},
		{
			headers:
			{
				Authorization: `Bearer ${tempJwt}`
			}
		});
		if (response.data.success)
		{
			updateLoggedInAccounts(response.data.account, response.data.token, setLoggedInAccounts);
			return true;
		}
	}
	catch (error: any)
	{
		if (error.response?.status === 401)
			setValidation(prev => ({ ...prev, ['2FA Code incorrect']: true }));
	}
	return false;
}

export async function checkLogin({ formData, setShow2FA, setTempJwt, setValidation, setLoggedInAccounts }: AuthProps)
{
	const { username, password } = formData;
	try
	{
		const response = await axios.post(`${API_URL}/api/login`, { username, password });
		const twofaRequired = response.data.twofaRequired;

		if (twofaRequired)
		{
			setTempJwt(response.data.token);
			setShow2FA(true);
			return false;
		}
		if (response.data.success)
		{
			updateLoggedInAccounts(response.data.account, response.data.token, setLoggedInAccounts);
			return true;
		}
	}
	catch (error: any)
	{
		setValidation(prev => ({ ...prev, [error.response.data.error]: true }));
	}
	return false;
}

export function updateLoggedInAccounts(account: PlayerType, jwt: string, setLoggedInAccounts: Dispatch<SetStateAction<PlayerType[]>>)
{
	const authenticatedAccount = { ...account, jwt };
	setLoggedInAccounts((prev) =>
	{
		if (prev.some((p) => p.username === account.username)) return prev;
		const updatedPlayers = [...prev, authenticatedAccount];
		localStorage.setItem('loggedInAccounts', JSON.stringify(updatedPlayers));
		return updatedPlayers;
	});
}

export interface ResetValidationProps
{
	formData: LoginFormType;
	loggedInAccounts: PlayerType[];
	setValidation: Dispatch<SetStateAction<LoginValidationType>>;
	setEmptyForm: Dispatch<SetStateAction<boolean>>;
}

export function resetValidation({ formData, loggedInAccounts, setValidation, setEmptyForm }: ResetValidationProps)
{
	setValidation(prev => (
	{
		...prev,
		'Already logged in': loggedInAccounts.some(player => player.username === formData.username),
		'Username not found': false,
		'Password incorrect': false,
		'2FA Code incorrect': false
	}));
	setEmptyForm(Object.values(formData).some(field => field === ""));
}

//UI Components

export interface InputFieldProps
{
	label: string;
	type: string;
	name: string;
	placeholder: string;
	value?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	validation: LoginValidationType;
}

export function InputField({ label, type, name, placeholder, onChange, validation }: InputFieldProps)
{
	const error = Object.values(validation).some(v => v);
	const borderClass = error
		? (validation['Already logged in'] ? 'border-[#ff914d] focus:border-[#ff914d]' : 'border-red-800')
		: 'border-gray-600 focus:border-white';

	return (
		<div>
			<label className="block text-sm font-medium mb-1">{label}</label>
			<input
				className={`w-full p-2 bg-[#3a3a3a] rounded-3xl border ${borderClass} focus:outline-none`}
				type={type}
				name={name}
				placeholder={placeholder}
				maxLength={name === 'token' ? 6 : 10}
				onChange={onChange}
			/>
		</div>
	);
}

/** Props for validation message */
export interface ValidationMessageProps
{
	text: string;
	visible: boolean;
	colorClass?: string;
}

export function ValidationMessage({ text, visible, colorClass = "text-red-500" }: ValidationMessageProps)
{
	if (!visible) return null;
	return (
		<div className={`text-center text-sm ${colorClass}`}>
			<p>{text}</p>
		</div>
	);
}

/** Props for the login button */
export interface LoginButtonProps
{
	disabled: boolean;
	label: string;
}

export function LoginButton({ disabled, label }: LoginButtonProps)
{
	return (
		<motion.button
			className={`w-full bg-[#ff914d] text-white py-2 px-4 rounded-3xl font-bold transition-colors shadow-2xl
			${!disabled ? 'hover:bg-[#ab5a28] hover:cursor-pointer' : 'opacity-30'}`}
			whileHover={!disabled ? { scale: 1.03 } : {}}
			whileTap={!disabled ? { scale: 0.97 } : {}}
			type="submit"
			disabled={disabled}
		>
			{label}
		</motion.button>
	);
}
