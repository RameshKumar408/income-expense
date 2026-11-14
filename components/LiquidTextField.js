import React from 'react';
import TextField from '@mui/material/TextField';
import colors from '@/colors';

export default function LiquidTextField(props) {
    const liquidSx = {
        '& .MuiOutlinedInput-root': {
            color: colors.text.primary,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
            boxShadow: `inset 0 1px 2px ${colors.border.glass}, 0 8px 24px rgba(0, 0, 0, 0.4)`,
            borderRadius: { xs: '12px', sm: '14px' },
            fontSize: { xs: '16px', sm: '20px' },
            minHeight: { xs: '48px', sm: '66px' },
            transition: 'all 0.3s ease',
            '& fieldset, & .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border.input,
                borderWidth: '1.5px',
            },
            '&:hover fieldset, &:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.border.input,
            },
            '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: `inset 0 1px 2px ${colors.border.dividerBright}, 0 0 20px ${colors.glass.glow}`,
            },
            '&.Mui-focused fieldset, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.brand.primary,
                borderWidth: '1.5px',
            },
        },
        '& .MuiInputBase-input': {
            color: colors.text.primary,
            padding: { xs: '11px 13px', sm: '18px 20px' },
        },
        '& .MuiInputBase-input::placeholder': {
            color: colors.text.placeholder,
            opacity: 1,
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
        },
        '& input[type=date]': {
            minHeight: 0,
        },
        '& input[type=date]::-webkit-date-and-time-value': {
            textAlign: 'left',
            lineHeight: 'normal',
            minHeight: '0',
            height: 'auto',
            margin: 0,
            padding: 0,
        },
        '& .clear-field-button': {
            color: colors.text.secondary,
            marginRight: { xs: '-4px', sm: '2px' },
            '&:hover': {
                color: colors.text.primary,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
        },
    };

    // Safely merge sx prop if provided without wiping nested classes
    const combinedSx = props.sx
        ? [liquidSx, ...(Array.isArray(props.sx) ? props.sx : [props.sx])]
        : liquidSx;

    return <TextField suppressHydrationWarning {...props} sx={combinedSx} />;
}
