import React, { useMemo } from 'react'
import {
    SingleSelect,
    SingleSelectOption,
    MultiSelect,
    MultiSelectOption,
    CircularLoader,
    NoticeBox,
    Tag,
} from '@dhis2/ui'
import { useMetadata } from '../services/metadataResolver.js'

/**
 * UidPicker — DHIS2-metadata-backed UID selector.
 */
export function UidPicker({
    resourceKey,
    value,
    onChange,
    multi = false,
    label,
    required,
    disabled,
    helpText,
    placeholder,
}) {
    const { loading, error, items } = useMetadata(resourceKey)

    const options = useMemo(() => {
        if (!items) return []
        const opts = items.map((item) => ({
            value: item.id,
            label: item.displayName || item.name || item.id,
        }))

        // Ensure current values exist in the options list to prevent DHIS2 UI crashes
        const existingValues = new Set(opts.map((o) => o.value))

        if (multi) {
            const selectedValues = Array.isArray(value) ? value : value ? [value] : []
            selectedValues.forEach(val => {
                if (!existingValues.has(val)) {
                    opts.push({ value: val, label: `[Unknown UID: ${val}]` })
                }
            })
        } else {
            if (value && !existingValues.has(value)) {
                opts.push({ value: value, label: `[Unknown UID: ${value}]` })
            }
        }

        return opts
    }, [items, value, multi])

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 0',
                    fontSize: '13px',
                    color: '#6c7787',
                }}
            >
                <CircularLoader small />
                Loading {resourceKey}...
            </div>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Failed to load options">
                Could not fetch {resourceKey} from the server.
            </NoticeBox>
        )
    }

    if (multi) {
        const selectedValues = Array.isArray(value)
            ? value
            : value
                ? [value]
                : []
        return (
            <MultiSelect
                label={label}
                selected={selectedValues}
                onChange={({ selected }) => onChange(selected)}
                disabled={disabled}
                placeholder={placeholder || `Select ${resourceKey}...`}
                required={required}
                helpText={helpText}
                filterable
                noMatchText="No matches found"
            >
                {options.map((opt) => (
                    <MultiSelectOption
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                    />
                ))}
            </MultiSelect>
        )
    }

    return (
        <div>
            <SingleSelect
                label={label}
                selected={value || ''}
                onChange={({ selected }) => onChange(selected)}
                disabled={disabled}
                placeholder={placeholder || 'Select...'}
                required={required}
                helpText={helpText}
                filterable
                noMatchText="No matches found"
                clearable
                clearText="Clear"
            >
                {options.map((opt) => (
                    <SingleSelectOption
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                    />
                ))}
            </SingleSelect>
            {value && (
                <div style={{ marginTop: '4px' }}>
                    <Tag neutral dense>
                        {value}
                    </Tag>
                </div>
            )}
        </div>
    )
}

export default UidPicker
