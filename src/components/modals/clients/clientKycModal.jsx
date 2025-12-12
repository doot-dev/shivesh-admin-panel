import { ICON_NAMES } from "../../icons";
import { Modal } from "../../ui"

const ClientKYCModal = ({isOpen, onClose, onSubmit}) =>{
   const handleSubmit = (e) =>{
    e.preventDefault();
    onSubmit();
    onClose
   }
   
    return(
        <Modal isOpen={isOpen} onClose={onClose} title="Upload KYC Documents" size="lg" maxWidth="700px" headerIcon={ICON_NAMES.EDIT_USER} >
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload KYC Document
                </h3>
                {/* <p className="text-sm text-gray-500 mb-6">
                
                </p> */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2>KYC Document</h2>
                </form>
            </div>
        </Modal>
    )
}

export default ClientKYCModal;