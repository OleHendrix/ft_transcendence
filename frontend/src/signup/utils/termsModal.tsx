import ModalWrapper from "../../utils/ModalWrapper";
import CloseButton from "../../utils/CloseButton";

function TermsModal({ onClose }: { onClose: () => void })
{
	return (
		<ModalWrapper>
			<div className="bg-[#2a2a2a] text-white p-6 rounded-lg w-md relative">
				<CloseButton onClick={onClose} />
				<h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
				<p className="text-sm overflow-y-auto max-h-[60vh]">
					We like your data and will sell it to shady people on the darkweb
				</p>
			</div>
		</ModalWrapper>
	);
}

export default TermsModal;
