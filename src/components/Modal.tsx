import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  closeOnOutsideClick = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = ""; // Restore scrolling when modal closes
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      <div
        className="bg-white/70 backdrop-blur-md rounded-lg shadow-xl w-full max-w-2xl p-6 border border-white/30 transition-transform duration-200 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 p-1 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] pr-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;