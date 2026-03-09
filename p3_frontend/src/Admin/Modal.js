import React, { useState, useEffect } from 'react';
import { getInputType } from './Utils';
import './Modal.css'

function CreateEditModal({ isOpen, onClose, onSave, editData, tableConfig, mode }) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors]     = useState({});

    // ─── Initialise form ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && editData) {
            setFormData(editData);
        } else {
            const initialData = {};
            tableConfig.columns.forEach((col) => {
                initialData[col.key] = '';
            });
            setFormData(initialData);
        }
        setErrors({});
    }, [isOpen, editData, mode, tableConfig]);

    // ─── Conditional visibility ─────────────────────────────────────────────
    const isVisible = (col) => {
        if (!col.showWhen) return true;
        return formData[col.showWhen.key] === col.showWhen.value;
    };

    // ─── Handlers ───────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // ─── Validation ─────────────────────────────────────────────────────────
    const validateForm = () => {
        const newErrors = {};

        tableConfig.columns.forEach((col) => {
            // Skip read-only, PK, and currently hidden conditional fields
            if (col.readOnly || col.isPrimaryKey) return;
            if (!isVisible(col)) return;

            const val = formData[col.key];
            const isEmpty = val === '' || val === null || val === undefined;

            if (col.required && isEmpty) {
                newErrors[col.key] = `${col.label} is required`;
                return;
            }

            if (isEmpty) return; // optional & empty – nothing more to check

            if (col.minLength && val.length < col.minLength)
                newErrors[col.key] = `${col.label} must be at least ${col.minLength} characters`;

            if (col.maxLength && val.length > col.maxLength)
                newErrors[col.key] = `${col.label} must be no more than ${col.maxLength} characters`;

            if (col.inputType === 'number') {
                const num = parseFloat(val);
                if (isNaN(num))
                    newErrors[col.key] = `${col.label} must be a number`;
                else {
                    if (col.min !== undefined && num < col.min)
                        newErrors[col.key] = `${col.label} must be at least ${col.min}`;
                    if (col.max !== undefined && num > col.max)
                        newErrors[col.key] = `${col.label} must be no more than ${col.max}`;
                }
            }

            if (col.pattern && val) {
                const regex = new RegExp(col.pattern);
                if (!regex.test(val))
                    newErrors[col.key] = col.patternMessage || `Invalid ${col.label} format`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ─── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submission = { ...formData };

        tableConfig.columns.forEach((col) => {
            // Clear hidden conditional fields so they don't get submitted with stale values
            if (!isVisible(col)) {
                submission[col.key] = null;
            }

            // Coerce number fields
            if (
                col.inputType === 'number' &&
                submission[col.key] !== '' &&
                submission[col.key] !== null &&
                submission[col.key] !== undefined
            ) {
                submission[col.key] =
                    col.step === 1
                        ? parseInt(submission[col.key], 10)
                        : parseFloat(submission[col.key]);
            }

            // Coerce boolean select fields
            if (
                col.isBoolean &&
                submission[col.key] !== '' &&
                submission[col.key] !== null &&
                submission[col.key] !== undefined
            ) {
                submission[col.key] =
                    submission[col.key] === 'true' || submission[col.key] === true;
            }
        });

        onSave(submission);
    };

    // ─── Input renderer ──────────────────────────────────────────────────────
    const renderInput = (col) => {
        const isDisabled = mode === 'edit' || 'create' && (col.isPrimaryKey || col.readOnly);

        // isDate: show a formatted, read-only date string
        if (col.isDate && isDisabled) {
            const raw = formData[col.key];
            const display = raw ? new Date(raw).toLocaleString() : '—';
            return (
                <input
                    id={col.key}
                    type="text"
                    className="form-input"
                    value={display}
                    disabled
                    readOnly
                />
            );
        }

        const commonProps = {
            id:       col.key,
            name:     col.key,
            value:    formData[col.key] ?? '',
            onChange: handleChange,
            disabled: isDisabled,
            readOnly: isDisabled,
        };

        // Select with inline options array
        if (col.inputType === 'select' && Array.isArray(col.options)) {
            return (
                <select
                    {...commonProps}
                    className={`form-input ${errors[col.key] ? 'error' : ''}`}
                >
                    <option value="">-- Select {col.label} --</option>
                    {col.options.map((opt) => (
                        <option key={String(opt.value)} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        // Multiline textarea
        if (col.multiline) {
            return (
                <textarea
                    {...commonProps}
                    className={`form-textarea ${errors[col.key] ? 'error' : ''}`}
                    rows="3"
                />
            );
        }

        // Default input
        return (
            <input
                {...commonProps}
                type={getInputType(col)}
                className={`form-input ${errors[col.key] ? 'error' : ''}`}
                placeholder={col.pattern ? col.patternMessage : ''}
                step={col.step}
                min={col.min}
                max={col.max}
            />
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === 'edit'
                            ? `Edit ${tableConfig.label}`
                            : `Add New ${tableConfig.label}`}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            {tableConfig.columns
                                .filter((col) => isVisible(col))   // hide conditional fields
                                .map((col) => (
                                    <div key={col.key} className="form-group">
                                        <label htmlFor={col.key} className="form-label">
                                            {col.label}
                                            {col.required && <span className="required">*</span>}
                                        </label>
                                        {renderInput(col)}
                                        {errors[col.key] && (
                                            <span className="error-message">{errors[col.key]}</span>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            {mode === 'edit' ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default CreateEditModal;