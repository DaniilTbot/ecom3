import { useEffect } from "react";
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-window">
        <button className="modal-close-button" onClick={onClose} type="button">
          ×
        </button>

        {title && <h2 className="modal-title">{title}</h2>}

        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
