import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, PercentCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion } from 'framer-motion';

interface ImageCropperProps
{
  imageUrl: string;
  handleCropComplete: (croppedImage: string) => void;
  handleCropCancel: () => void;
}

function ImageCropper({ imageUrl, handleCropComplete, handleCropCancel } : ImageCropperProps)
{
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
	handleCropComplete(croppedImageUrl);
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
            onClick={handleCropCancel}>Cancel
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

export default ImageCropper;