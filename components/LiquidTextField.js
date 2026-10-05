import React from 'react';
import TextField from '@mui/material/TextField';

export default function LiquidTextField(props) {
    const liquidSx = {
        '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.4)',
            borderRadius: { xs: '12px', sm: '14px' },
            fontSize: { xs: '16px', sm: '20px' },
            minHeight: { xs: '48px', sm: '66px' },
            transition: 'all 0.3s ease',
            '& fieldset': {
                borderColor: 'rgba(212, 160, 23, 0.45)',
                borderWidth: '1.5px',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(212, 160, 23, 0.45)',
            },
            '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 0 20px rgba(212, 160, 23, 0.2)',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'rgba(212, 160, 23, 0.8)',
                borderWidth: '1.5px',
            },
        },
        '& .MuiInputBase-input': {
            color: '#ffffff',
            padding: { xs: '11px 13px', sm: '18px 20px' },
        },
        '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255, 255, 255, 0.4)',
            opacity: 1,
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
        },
        '& .clear-field-button': {
            color: 'rgba(255, 255, 255, 0.4)',
            marginRight: { xs: '-4px', sm: '2px' },
            '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
        },
    };

    // Merge sx prop if provided
    const combinedSx = props.sx ? { ...liquidSx, ...props.sx } : liquidSx;

    return <TextField {...props} sx={combinedSx} />;
}
