import React from 'react';
import "../ModalComponent.css"

export const ModalComponent = ({ isOpen, onClose, children}) => {
    return (
        <>{isOpen && (
        <div className="modal">
            {children}
        </div>
            )}
        </>
    );
};
