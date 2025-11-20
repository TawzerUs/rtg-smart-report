import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const SmartSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    addNewLabel = "Add New",
    addNewRoute = null,
    addNewTab = null,
    required = false,
    className = "",
    disabled = false
}) => {
    const navigate = useNavigate();

    const handleChange = (e) => {
        if (e.target.value === '__ADD_NEW__') {
            if (addNewRoute) {
                // Navigate to admin with specific tab
                if (addNewTab) {
                    navigate(addNewRoute, { state: { activeTab: addNewTab } });
                } else {
                    navigate(addNewRoute);
                }
            }
        } else {
            // Pass the value directly, not the event
            if (onChange) {
                onChange(e.target.value);
            }
        }
    };

    return (
        <select
            value={value}
            onChange={handleChange}
            className={className || "w-full p-2.5 rounded-lg bg-[var(--bg-dark)] border border-[var(--border-glass)] text-[var(--text-main)] focus:border-[var(--primary)] focus:outline-none"}
            required={required}
            disabled={disabled}
        >
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt.value || opt.id} value={opt.value || opt.id}>
                    {opt.label || opt.name}
                </option>
            ))}
            {addNewRoute && (
                <option value="__ADD_NEW__" className="text-[var(--primary)] font-semibold">
                    ➕ {addNewLabel}
                </option>
            )}
        </select>
    );
};

export default SmartSelect;
