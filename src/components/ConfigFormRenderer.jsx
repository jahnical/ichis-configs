import React from 'react'
import {
    InputField,
    Switch,
    SingleSelect,
    SingleSelectOption,
    Button,
    IconAdd16,
    IconDelete16,
    IconChevronUp16,
    IconChevronDown16,
    Tag,
} from '@dhis2/ui'
import { UidPicker } from './UidPicker.jsx'
import { ConditionEditor } from './ConditionEditor.jsx'
import styles from './ConfigFormRenderer.module.css'

// ─── Field Renderer ──────────────────────────────────────────────────────────
function FieldRenderer({ field, value, onChange, data, onDataChange, depth = 0 }) {
    const { key, label, type, required, description, readOnly, options } = field

    const handleChange = (newValue) => {
        onChange(newValue)
    }

    if (readOnly) {
        return (
            <div className={styles.readOnlyField}>
                <span className={styles.readOnlyLabel}>{label}</span>
                <Tag neutral>{value || '—'}</Tag>
                {description && (
                    <span className={styles.helpText}>{description}</span>
                )}
            </div>
        )
    }

    switch (type) {
        case 'string':
            return (
                <InputField
                    label={label}
                    value={value ?? ''}
                    onChange={({ value: v }) => handleChange(v)}
                    required={required}
                    helpText={description}
                    dense
                />
            )

        case 'number':
            return (
                <InputField
                    label={label}
                    value={value !== undefined && value !== null ? String(value) : ''}
                    onChange={({ value: v }) =>
                        handleChange(v === '' ? '' : Number(v))
                    }
                    type="number"
                    required={required}
                    helpText={description}
                    dense
                />
            )

        case 'boolean':
            return (
                <div className={styles.switchField}>
                    <Switch
                        label={label}
                        checked={!!value}
                        onChange={({ checked }) => handleChange(checked)}
                        dense
                    />
                    {description && (
                        <span className={styles.helpText}>{description}</span>
                    )}
                </div>
            )

        case 'select':
            return (
                <SingleSelect
                    label={label}
                    selected={value ?? ''}
                    onChange={({ selected }) => handleChange(selected)}
                    required={required}
                    helpText={description}
                    dense
                >
                    {(options || []).map((opt) => (
                        <SingleSelectOption
                            key={opt.value}
                            value={opt.value}
                            label={opt.label}
                        />
                    ))}
                </SingleSelect>
            )

        case 'dhis2Uid':
            return (
                <UidPicker
                    resourceKey={field.dhis2Resource}
                    value={value ?? ''}
                    onChange={handleChange}
                    label={label}
                    required={required}
                    helpText={description}
                />
            )

        case 'dhis2UidMulti':
            return (
                <UidPicker
                    resourceKey={field.dhis2Resource}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    label={label}
                    multi
                    required={required}
                    helpText={description}
                />
            )

        case 'conditions':
            return (
                <ConditionEditor
                    conditions={value?.condition || []}
                    onChange={(conditions) =>
                        handleChange({ condition: conditions })
                    }
                    label={label}
                />
            )

        case 'object':
            return (
                <ObjectRenderer
                    field={field}
                    value={value || {}}
                    onChange={handleChange}
                    depth={depth}
                />
            )

        case 'array':
            return (
                <ArrayRenderer
                    field={field}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    depth={depth}
                />
            )

        default:
            return (
                <InputField
                    label={`${label} (${type})`}
                    value={String(value ?? '')}
                    onChange={({ value: v }) => handleChange(v)}
                    dense
                />
            )
    }
}

// ─── Object Renderer ─────────────────────────────────────────────────────────
function ObjectRenderer({ field, value, onChange, depth }) {
    const handleFieldChange = (fieldKey, newValue) => {
        onChange({ ...value, [fieldKey]: newValue })
    }

    return (
        <div
            className={styles.objectContainer}
            style={{ marginLeft: depth > 0 ? 16 : 0 }}
        >
            <div className={styles.objectLabel}>{field.label}</div>
            {field.description && (
                <p className={styles.objectDescription}>{field.description}</p>
            )}
            <div className={styles.objectFields}>
                {(field.fields || []).map((subField) => (
                    <div key={subField.key} className={styles.fieldWrapper}>
                        <FieldRenderer
                            field={subField}
                            value={value?.[subField.key]}
                            onChange={(v) => handleFieldChange(subField.key, v)}
                            depth={depth + 1}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Array Renderer ──────────────────────────────────────────────────────────
function ArrayRenderer({ field, value = [], onChange, depth }) {
    const addItem = () => {
        onChange([...value, { ...(field.defaultItem || {}) }])
    }

    const removeItem = (index) => {
        onChange(value.filter((_, i) => i !== index))
    }

    const updateItem = (index, newItem) => {
        onChange(value.map((item, i) => (i === index ? newItem : item)))
    }

    const moveItem = (index, direction) => {
        const newArr = [...value]
        const swap = index + direction
        if (swap < 0 || swap >= newArr.length) return
            ;[newArr[index], newArr[swap]] = [newArr[swap], newArr[index]]
        onChange(newArr)
    }

    return (
        <div className={styles.arrayContainer}>
            <div className={styles.arrayHeader}>
                <span className={styles.arrayLabel}>{field.label}</span>
                <Tag neutral dense>
                    {value.length} item{value.length !== 1 ? 's' : ''}
                </Tag>
            </div>
            {field.description && (
                <p className={styles.arrayDescription}>{field.description}</p>
            )}

            {value.length === 0 && (
                <p className={styles.empty}>No items yet. Click "Add" to create one.</p>
            )}

            {value.map((item, index) => (
                <ArrayItemCard
                    key={index}
                    index={index}
                    total={value.length}
                    item={item}
                    fields={field.fields || []}
                    onUpdate={(newItem) => updateItem(index, newItem)}
                    onRemove={() => removeItem(index)}
                    onMove={(dir) => moveItem(index, dir)}
                    depth={depth}
                />
            ))}

            <Button
                secondary
                small
                icon={<IconAdd16 />}
                onClick={addItem}
                className={styles.addBtn}
            >
                Add {field.label?.replace(/s$/, '') || 'Item'}
            </Button>
        </div>
    )
}

// ─── Array Item Card ─────────────────────────────────────────────────────────
function ArrayItemCard({
    index,
    total,
    item,
    fields,
    onUpdate,
    onRemove,
    onMove,
    depth,
}) {
    const [collapsed, setCollapsed] = React.useState(false)

    const handleFieldChange = (fieldKey, newValue) => {
        onUpdate({ ...item, [fieldKey]: newValue })
    }

    // Build a summary label from the first string/uid field
    const summaryValue = (() => {
        for (const f of fields) {
            const v = item[f.key]
            if (v && typeof v === 'string') return v
        }
        return null
    })()

    return (
        <div className={styles.arrayItem}>
            <div className={styles.arrayItemHeader}>
                <div className={styles.arrayItemTitle}>
                    <Tag neutral dense>#{index + 1}</Tag>
                    {summaryValue && (
                        <span className={styles.arraySummary}>{summaryValue}</span>
                    )}
                </div>
                <div className={styles.arrayItemActions}>
                    <Button
                        small
                        secondary
                        icon={collapsed ? <IconChevronDown16 /> : <IconChevronUp16 />}
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    />
                    <Button
                        small
                        secondary
                        icon={<IconChevronUp16 />}
                        onClick={() => onMove(-1)}
                        disabled={index === 0}
                        title="Move up"
                    />
                    <Button
                        small
                        secondary
                        icon={<IconChevronDown16 />}
                        onClick={() => onMove(1)}
                        disabled={index === total - 1}
                        title="Move down"
                    />
                    <Button
                        small
                        destructive
                        icon={<IconDelete16 />}
                        onClick={onRemove}
                        title="Remove"
                    />
                </div>
            </div>

            {!collapsed && (
                <div className={styles.arrayItemBody}>
                    {fields.map((field) => (
                        <div key={field.key} className={styles.fieldWrapper}>
                            <FieldRenderer
                                field={field}
                                value={item[field.key]}
                                onChange={(v) => handleFieldChange(field.key, v)}
                                depth={depth + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main ConfigFormRenderer ──────────────────────────────────────────────────
/**
 * ConfigFormRenderer — Schema-driven form for a single config section.
 *
 * Props:
 *   schema    - section schema object from configSchema.js
 *   value     - current data value for this section
 *   onChange  - called with updated value
 */
export function ConfigFormRenderer({ schema, value, onChange }) {
    const { type, path, fields, label, description, dhis2Resource } = schema

    const handleChange = (newValue) => {
        onChange(newValue)
    }

    // Top-level flat array of UIDs (e.g. teiCreatablePrograms)
    if (type === 'dhis2UidMulti') {
        return (
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{label}</h3>
                    {description && (
                        <p className={styles.sectionDescription}>{description}</p>
                    )}
                </div>
                <UidPicker
                    resourceKey={dhis2Resource}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    label={label}
                    multi
                />
            </div>
        )
    }

    if (type === 'array') {
        return (
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{label}</h3>
                    {description && (
                        <p className={styles.sectionDescription}>{description}</p>
                    )}
                </div>
                <ArrayRenderer
                    field={schema}
                    value={Array.isArray(value) ? value : []}
                    onChange={handleChange}
                    depth={0}
                />
            </div>
        )
    }

    if (type === 'object') {
        return (
            <div className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{label}</h3>
                    {description && (
                        <p className={styles.sectionDescription}>{description}</p>
                    )}
                </div>
                <div className={styles.objectFields}>
                    {(fields || []).map((field) => (
                        <div key={field.key} className={styles.fieldWrapper}>
                            <FieldRenderer
                                field={field}
                                value={value?.[field.key]}
                                onChange={(v) =>
                                    handleChange({ ...(value || {}), [field.key]: v })
                                }
                                depth={0}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return null
}

export default ConfigFormRenderer
