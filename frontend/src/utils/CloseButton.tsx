import { IoMdClose } from "react-icons/io";

function CloseButton({ onClick }: { onClick: () => void })
{
	return (
		<button className="absolute top-4 right-4 text-gray-400 hover:text-white hover:cursor-pointer"
			onClick={onClick}>
			<IoMdClose size={24} />
		</button>
	);
}

export default CloseButton