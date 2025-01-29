import React from 'react';
import "../ModalComponent.css"

export const ModalComponent = ({ isOpen, onClose, children}) => {
    return (
        <>{isOpen && (
        <div className="modal">
            <div className="modal_content">
                {children}
            </div>
        </div>
            )}
        </>
    );
};
