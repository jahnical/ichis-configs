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
import styles from './UidPicker.module.css'

/**
 * UidPicker — A DHIS2-metadata-backed UID selector.
 *
 * Props:
 *   resourceKey  - Key from DHIS2_RESOURCES (e.g. 'programs', 'trackedEntityAttributes')
 *   value        - Currently selected UID (string) or array of UIDs (for multi)
 *   onChange     - Called with (uid) or ([uid, ...]) on selection
 *   multi        - If true, renders a multi-select
 *   label        - Label text (shown above)
 *   required     - Shows required indicator
 *   disabled     - Disables the control
 *   helpText     - Additional help text
 *   placeholder  - Placeholder text
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

    const options = useMemo(
        () =>
            items.map((item) => ({
                value: item.id,
                label: `${item.displayName || item.name}`,
                subLabel: item.id,
            })),
        [items]
    )

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <CircularLoader small />
                <span className={styles.loaderText}>Loading {resourceKey}...</span>
            </div>
        )
    }

    if (error) {
        return (
            <NoticeBox error title="Failed to load options">
                Could not fetch {resourceKey} from the server. Check your connection.
            </NoticeBox>
        )
    }

    if (multi) {
        const selectedValues = Array.isArray(value) ? value : value ? [value] : []
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
                placeholder={placeholder || `Select...`}
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
                <div className={styles.uidBadge}>
                    <Tag neutral dense>
                        {value}
                    </Tag>
                </div>
            )}
        </div>
    )
}

export default UidPicker
