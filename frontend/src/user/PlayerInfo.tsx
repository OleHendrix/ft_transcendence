import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useAccountContext } from "../contexts/AccountContext";
import { motion } from 'framer-motion';
import { ImageCropper, CameraLabel } from "./ImageUpload";
import ModalWrapper from "../utils/ModalWrapper";
import { DisplayInfo, ProfileActionButton, LogoutDeleteButton, ImageDisplay } from "./utilsComponents";
import { StyledButton } from "./utilsComponents";
import { PlayerType } from "../types";
import { Display2FA } from "./2FA";
import { cancelEdit, useGetAccount } from "./utilsFunctions";
import CloseButton from "../utils/CloseButton";
import { deleteAccount, logout, updateAccount } from "./utilsFunctions";
import { defaultSignUpValidation, emptySignUpForm } from "../objects";
import { ConfirmPasswordField, EmailField, PasswordField } from "../signup/utils/InputFields";
import { UsernameField } from "../signup/utils/InputFields";
import { checkValidation } from "../signup/utils/checkValidation";
import { AlreadyLoggedInMessage } from "../signup/utils/ValidationMessages";
import { AccountExistsMessage } from "../signup/utils/ValidationMessages";

interface ShowInfoProps
{
	editProfile: 		boolean,
	setEditProfile: 	React.Dispatch<React.SetStateAction<boolean>>,
	selectedAccount: 	PlayerType | undefined,
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>,
}

function ShowInfo( {editProfile, setEditProfile, selectedAccount, setSelectedAccount}: ShowInfoProps )
{
	const { loggedInAccounts, setTriggerFetchAccounts, setLoggedInAccounts }  	= useAccountContext();
	const [formData, setFormData] 												= useState(emptySignUpForm);
	const [emptyForm, setEmptyForm] 											= useState(true);
	const [confirmDelete, setConfirmDelete] 									= useState(false);
	const [confirmDisable2Fa, setConfirmDisable2Fa] 							= useState(false);
	const [settingUp2FA, setSettingUp2FA] 										= useState(false);
	const [validation, setValidation] 											= useState(defaultSignUpValidation);
	const navigate 																= useNavigate();

	useEffect(() =>
	{
		if (selectedAccount)
			setFormData({ username: selectedAccount.username, email: selectedAccount.email, password: '', confirmPassword: ''});
	}, [selectedAccount]);

	useEffect(() =>
	{
		checkValidation({formData, loggedInAccounts, setValidation, setEmptyForm, prevUsername: selectedAccount?.username, prevEmail: selectedAccount?.email});
	}, [formData]);

	return (
		<div className="flex flex-col w-full text-left space-y-4 items-center">
			{!confirmDelete && !editProfile &&
			<>
				<DisplayInfo keyword="Username" value={selectedAccount?.username}/>
				<DisplayInfo keyword="Email" value={selectedAccount?.email}/>
				<DisplayInfo keyword="Password" value={('').padStart(10, '*')}/>
			</>
			}
			{!confirmDelete && editProfile &&
			<>
				<UsernameField validation={validation} formData={formData} setFormData={setFormData}/>
				<EmailField validation={validation} formData={formData} setFormData={setFormData}/>
				<PasswordField validation={validation} formData={formData} setFormData={setFormData}/>
				<ConfirmPasswordField validation={validation} formData={formData} setFormData={setFormData}/>	
			</>}
			{!confirmDelete && <Display2FA loggedInAccounts={loggedInAccounts} selectedAccount={selectedAccount} setLoggedInAccounts={setLoggedInAccounts} setSelectedAccount={setSelectedAccount} setTriggerFetchAccounts={setTriggerFetchAccounts} editProfile={editProfile} setEditProfile={setEditProfile} confirmDisable2Fa={confirmDisable2Fa} setConfirmDisable2Fa={setConfirmDisable2Fa} settingUp2FA={settingUp2FA} setSettingUp2FA={setSettingUp2FA}/>}
			{validation['Already logged in'] && <AlreadyLoggedInMessage />}
			{((validation['Username exists'] || validation['Email exists']) && !validation['Already logged in']) && <AccountExistsMessage />}
			{ editProfile &&
			(
			<div className="w-full flex text-xs justify-between whitespace-nowrap gap-2">
				{!confirmDelete && <LogoutDeleteButton keyword="delete" onClick={() => setConfirmDelete(true)}/>}
				{confirmDelete ?
				<>
					<StyledButton
						onClick={() => {deleteAccount({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}); navigate('/')}} variant="primary" text="Delete account"/>
					<StyledButton 
						onClick={() => {setConfirmDelete(false)}} variant="secondary" text="Cancel"/>
				</>
				: 
				<>
					<StyledButton disabled={(emptyForm|| validation['Already logged in'] || validation['Username exists'] || validation['Email exists'] || validation['Password does not match'])} 
						onClick={() => {updateAccount({formData, loggedInAccounts, setLoggedInAccounts, selectedAccount, setEditProfile, setTriggerFetchAccounts, navigate})}} variant="primary" text="Save changes"/>
					<StyledButton
						onClick={() => {cancelEdit({setEditProfile, setSettingUp2FA, setConfirmDisable2Fa, setFormData, selectedAccount})}} variant="secondary" text="Cancel"/>
				</>}
			</div>
			)}
		</div>
	);
}

function PlayerInfo()
{
	const { loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts } 	= useAccountContext();
	const [editProfile, setEditProfile] 										= useState(false);
	const [tempImageUrl, setTempImageUrl] 										= useState<string>('');
	const [showCropper, setShowCropper] 										= useState(false);
	const [selectedAccount, setSelectedAccount] 								= useState<PlayerType>();
	const navigate 																= useNavigate();
	const { username } 															= useParams();

	useGetAccount({username, setSelectedAccount});

	return (
		<ModalWrapper>
			<motion.div className="flex flex-col items-center bg-[#2a2a2a] text-white p-8 gap-8 rounded-lg w-md h-auto max-h-[90vh] overflow-y-auto relative shadow-2xl" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
				<CloseButton onClick={() => {navigate('/'); setTriggerFetchAccounts(false)}}/>
				{!editProfile && <LogoutDeleteButton keyword="logout" onClick={() => {logout({loggedInAccounts, setLoggedInAccounts, selectedAccount, setTriggerFetchAccounts}); navigate('/')}}/>}
				<div className="flex w-full flex-col items-center gap-2">
					<h2 className="text-2xl font-bold text-center">{selectedAccount?.username}</h2>
						<div className="relative">
							<ImageDisplay avatar={selectedAccount?.avatar}/>
							{editProfile && <CameraLabel setTempImageUrl={setTempImageUrl} setShowCropper={setShowCropper}/>}
						</div>
					{showCropper && tempImageUrl &&
					(
						<ImageCropper imageUrl={tempImageUrl}setTempImageUrl={setTempImageUrl}
							setShowCropper={setShowCropper} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}/>
					)}
					{!editProfile &&
					(
						<div className="flex w-full justify-between">
							<ProfileActionButton keyword="edit" onClick={() => setEditProfile(true)}/>
							<ProfileActionButton keyword="stats" onClick={() => navigate('./stats')}/>
						</div>
					)}
				</div>
				<ShowInfo editProfile={editProfile} setEditProfile={setEditProfile} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}/>
				<Outlet />
			</motion.div>
		</ModalWrapper>
	);
}

export default PlayerInfo