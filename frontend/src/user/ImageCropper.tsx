import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAccountContext } from "../contexts/AccountContext";
import { motion } from 'framer-motion';
import { FiCamera } from 'react-icons/fi';
import { PlayerType } from '../types';
import axios from 'axios';

interface HandleCropCompleteProps
{	
	croppedImage: string;
	selectedAccount: PlayerType | undefined;
	loggedInAccounts: PlayerType[];
	setLoggedInAccounts: React.Dispatch<React.SetStateAction<PlayerType[]>>;
	setTriggerFetchAccounts: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
	setShowCropper: React.Dispatch<React.SetStateAction<boolean>>;
	setTempImageUrl: React.Dispatch<React.SetStateAction<string>>;
}

async function handleCropComplete({croppedImage, selectedAccount, loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, setSelectedAccount, setShowCropper, setTempImageUrl}: HandleCropCompleteProps)
{
	const res = await fetch(croppedImage);
	const blob = await res.blob();
	const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

	const formData = new FormData();
	formData.append('image', file);
	if (selectedAccount)
		formData.append('username', selectedAccount?.username)
	try
	{
		const response = await axios.post(`http://${window.location.hostname}:5001/api/upload`, formData,
		{
			headers:
			{
				'Accept': 'application/json' // géén Content-Type hier!
			}
		})
		if (response.data.success)
		{
			const updatedloggedInAccounts = loggedInAccounts.map((account) =>
			account.username === selectedAccount?.username ?
			{ 
				...account, 
				avatar: response.data.imageUrl,
			} : account);
			setLoggedInAccounts(updatedloggedInAccounts);
			localStorage.setItem('loggedInAccounts', JSON.stringify(updatedloggedInAccounts));
			setTriggerFetchAccounts(true);
			setSelectedAccount(prev => ({...prev!, avatar: response.data.imageUrl}));
		}
	}
	catch (error: any)
	{
		console.log(error.response);
	}
	setShowCropper(false);
	setTempImageUrl('');
};
				

interface ImageCropperProps
{
  imageUrl: string;
  setTempImageUrl: React.Dispatch<React.SetStateAction<string>>;
  setShowCropper: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAccount: PlayerType | undefined;
  setSelectedAccount: React.Dispatch<React.SetStateAction<PlayerType | undefined>>;
}

export function ImageCropper({ imageUrl, setTempImageUrl, setShowCropper, selectedAccount, setSelectedAccount } : ImageCropperProps)
{
	const { loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts } = useAccountContext();

	const [crop, setCrop] = useState<Crop>(
	{
		unit: '%',
		width: 80,
		height: 80,
		x: 10,
		y: 10
	});
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>)
  {
    const { width, height } = e.currentTarget;
    imageRef.current = e.currentTarget;
    
    // Initial crop
    const cropRatio = 1;
    let newCrop = centerCrop(makeAspectCrop({ unit: '%', width: 80, }, cropRatio, width, height), width, height);
    setCrop(newCrop);
    return false;
  }

  function getCroppedImg()
  {
	if (!imageRef.current)
		return;

	const image = imageRef.current;
	const canvas = document.createElement('canvas');

	// Display dimensions
	const displayWidth = image.width;
	const displayHeight = image.height;

	// Actual image sizes
	const naturalWidth = image.naturalWidth;
	const naturalHeight = image.naturalHeight;

	// Scale sizes
	const scaleX = naturalWidth / displayWidth;
	const scaleY = naturalHeight / displayHeight;

	// Relative crop
	const cropX = (crop.x || 0) / 100 * displayWidth;
	const cropY = (crop.y || 0) / 100 * displayHeight;
	const cropWidth = (crop.width || 0) / 100 * displayWidth;
	const cropHeight = (crop.height || 0) / 100 * displayHeight;

	// Actual pixel coordinates
	const sourceX = cropX * scaleX;
	const sourceY = cropY * scaleY;
	const sourceWidth = cropWidth * scaleX;
	const sourceHeight = cropHeight * scaleY;

	// Canvassizing
	canvas.width = sourceWidth;
	canvas.height = sourceHeight;

	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;

	// Draw cropped pic
	ctx.drawImage( image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

	// Convert to dataURL
	const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95); // 0.95 kwaliteit
	handleCropComplete({croppedImage: croppedImageUrl, selectedAccount, loggedInAccounts, setLoggedInAccounts, setTriggerFetchAccounts, setSelectedAccount, setShowCropper, setTempImageUrl});
	};
  
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2a2a2a] p-6 rounded-xl max-w-md w-full">
        <div className="mb-4 flex justify-center">
			<ReactCrop className="max-h-[60vh]" crop={crop}
				onChange={(_, percentCrop) => setCrop(percentCrop)} circularCrop aspect={1}>
        		<img src={imageUrl} className="max-w-full" onLoad={onImageLoad}/>
			</ReactCrop>
        </div>
        <div className="flex justify-between gap-4 text-xs">
          <motion.button
            className="w-full bg-red-900 hover:bg-red-700 text-white py-2 px-2 rounded-3xl font-bold hover:cursor-pointer"
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => {setTempImageUrl(''); setShowCropper(false)}}>Cancel
          </motion.button>
          <motion.button
            className="w-full bg-[#ff914d] hover:bg-[#ab5a28] text-white py-2 px-4 rounded-3xl font-bold hover:cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={getCroppedImg}>
            Confirm</motion.button>
        </div>
      </div>
    </div>
  );
};

interface HandleProfileImageUploadProps
{
	setTempImageUrl: React.Dispatch<React.SetStateAction<string>>;
	setShowCropper: React.Dispatch<React.SetStateAction<boolean>>;
	e: React.ChangeEvent<HTMLInputElement>;
}

function handleProfileImageUpload({setTempImageUrl, setShowCropper, e}: HandleProfileImageUploadProps)
{
	const file = e.target.files?.[0];
	if (file)
	{
		// Lees de afbeelding als DataURL
		const reader = new FileReader();
		reader.onload = (event) =>
		{
			if (event.target && typeof event.target.result === 'string')
			{
				// Sla de afbeelding tijdelijk op en toon de cropper
				setTempImageUrl(event.target.result);
				setShowCropper(true);
			}
		};
		reader.readAsDataURL(file);
	}
};

interface CameraLabelProps
{
	setTempImageUrl: React.Dispatch<React.SetStateAction<string>>;
	setShowCropper: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CameraLabel({setTempImageUrl, setShowCropper}: CameraLabelProps)
{
	return (
		<label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-[#2a2a2a] p-1 rounded-full cursor-pointer hover:bg-[#3a3a3a] transition-colors">
			<input className="hidden" id="profile-upload" type="file" accept="image/*" onChange={e => handleProfileImageUpload({setTempImageUrl, setShowCropper, e})} />
			<FiCamera size={16} className="text-[#ff914d]" />
		</label>
	)
}
