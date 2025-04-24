import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface ModalWrapperProps
{
	children: React.ReactNode;
	className?: string
}

function ModalWrapper({ children, className }: ModalWrapperProps)
{
	return(
		<AnimatePresence>
			<motion.div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}

export default ModalWrapper