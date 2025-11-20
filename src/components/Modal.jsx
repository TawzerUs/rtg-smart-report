import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import '../index.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl my-auto">
                <div className="relative rounded-xl glass-panel shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-[var(--primary)]/30 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border-glass)] shrink-0">
                        <h3 className="text-xl font-semibold text-[var(--text-main)]">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-[var(--text-muted)] bg-transparent hover:bg-[var(--bg-glass)] hover:text-[var(--text-main)] rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center"
                        >
                            <X className="w-5 h-5" />
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
