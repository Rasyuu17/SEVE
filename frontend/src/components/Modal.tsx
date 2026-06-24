import type { PropsWithChildren } from 'react';
import Modal from 'react-modal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const ModalComponent: React.FC<PropsWithChildren<ModalProps>> = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      className="
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        bg-white rounded-xl p-6
        shadow-2xl outline-none pt-14
      "
      overlayClassName="
        fixed inset-0 bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        z-50 transition-all duration-300
      "
    >
      {title && <h2 className='fixed top-4 left-4'>{title}</h2>}
      <button
        onClick={onClose}
        name="modal.close"
        className="
          fixed top-4 right-4
          text-primary-light hover:text-primary
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-dark
          rounded-full p-1
        "
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {children}
    </Modal>
  );
};

export default ModalComponent;