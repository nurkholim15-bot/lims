import React from 'react';

const Modal = ({ isOpen, onClose, title, children, wide = false, width }) => {
    if (!isOpen) return null;

    const modalWidth = width || (wide ? '95%' : '100%');
    const modalMaxWidth = width || (wide ? '1400px' : '600px');

    return (
        <div 
            className="modal-overlay" 
            style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '2rem'
            }} 
        >
            <div 
                className={`modal-content ${wide ? 'wide' : ''}`} 
                style={{ 
                    maxWidth: modalMaxWidth, 
                    width: modalWidth,
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    overflowX: 'auto',
                    position: 'relative'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: "'Outfit'", margin: 0 }}>{title}</h2>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
