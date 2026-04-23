import { useState, useCallback } from 'react';

export default function CurrencyInput({ value, onChange, error, placeholder = '0', className = '', large = false }) {
    const format = (num) => {
        if (!num && num !== 0) return '';
        return Number(num).toLocaleString('en-PK', { maximumFractionDigits: 2 });
    };

    const [display, setDisplay] = useState(value ? format(value) : '');

    const handleChange = useCallback((e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, '');
        const parts = raw.split('.');
        const clean = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : raw;
        setDisplay(clean ? Number(clean).toLocaleString('en-PK', { maximumFractionDigits: 2 }) : '');
        onChange(clean ? parseFloat(clean) : '');
    }, [onChange]);

    const handleBlur = () => {
        if (value) setDisplay(format(value));
    };

    const handleFocus = () => {
        setDisplay(value ? String(value) : '');
    };

    return (
        <div className={`relative flex items-center ${large ? 'border-2' : 'border-[1.5px]'} border-gray-200 rounded-${large ? '2xl' : 'lg'} focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 bg-white overflow-hidden transition-all`}>
            <span className={`${large ? 'text-2xl font-bold' : 'text-sm'} text-[#94A3B8] px-3 border-r border-gray-200 shrink-0 py-${large ? '4' : '2.5'}`}>
                Rs.
            </span>
            <input
                type="text"
                inputMode="decimal"
                value={display}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                placeholder={placeholder}
                className={`flex-1 outline-none bg-transparent ${large ? 'text-3xl font-bold py-4 px-3' : 'text-sm py-2.5 px-3'} text-[#0F172A] w-full ${className}`}
            />
        </div>
    );
}
