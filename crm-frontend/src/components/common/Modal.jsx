import './Modal.css';

const Modal = ({ children, isOpen, onClose, title }) => {
  // If isOpen prop is provided, use it; otherwise always render (for backward compatibility)
  if (isOpen !== undefined && !isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

