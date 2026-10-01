import React from 'react';
import './PrimaryButton.css';

export default function PrimaryButton({ children, className = '', style = {}, ...props }) {
    return (
        <button 
            className={`global-primary-btn ${className}`} 
            style={style}
            {...props}
        >
            {children}
        </button>
    );
}
