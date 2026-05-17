import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure? This action cannot be undone.' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiOutlineExclamationTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="btn-danger">Delete</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
