import React from 'react'
import {
    InputField,
    Switch,
    SingleSelect,
    SingleSelectOption,
    Button,
    Card,
    Tag,
    Divider,
    IconAdd16,
    IconDelete16,
    IconChevronUp16,
    IconChevronDown16,
} from '@dhis2/ui'
import { UidPicker } from './UidPicker.jsx'
import { ConditionEditor } from './ConditionEditor.jsx'

// ─── Colour palette for group headings ───────────────────────────────────────
const GROUP_COLORS = {
    trigger: '#1565c0',
    target: '#2e7d32',
    mapping: '#6a1b9a',
    identity: '#37474f',
    display: '#0277bd',
    tracking: '#bf360c',
    period: '#4e342e',
    conditions: '#00695c',
    default: '#546e7a',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

const setNestedValue = (obj, path, value) => {
    if (!path.includes('.')) return { ...obj, [path]: value }
    const parts = path.split('.')
    const result = { ...obj }
    let current = result

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        current[part] = { ...(current[part] || {}) }
        current = current[part]
    }

    current[parts[parts.length - 1]] = value
    return result
}

// ─── Field Renderer ───────────────────────────────────────────────────────────
function FieldRenderer({ field, value, onChange, depth = 0 }) {
    const { label, type, required, description, readOnly, options } = field

    if (readOnly) {
        return (
            <div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#6c7787', marginBottom: '4px' }}>
                    {label}
                </div>
                <Tag neutral>{value || '—'}</Tag>
                {description && (
                    <div style={{ fontSize: '11px', color: '#9aa4b2', marginTop: '4px' }}>{description}</div>
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
                    onChange={({ value: v }) => onChange(v)}
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
                    onChange={({ value: v }) => onChange(v === '' ? '' : Number(v))}
                    type="number"
                    required={required}
                    helpText={description}
                    dense
                />
            )

        case 'boolean':
            return (
                <Switch
                    label={label}
                    helpText={description}
                    checked={!!value}
                    onChange={({ checked }) => onChange(checked)}
                    dense
                />
            )

        case 'select':
            return (
                <SingleSelect
                    label={label}
                    selected={value ?? ''}
                    onChange={({ selected }) => onChange(selected)}
                    required={required}
                    helpText={description}
                    dense
                >
                    {(options || []).map((opt) => (
                        <SingleSelectOption key={opt.value} value={opt.value} label={opt.label} />
                    ))}
                </SingleSelect>
            )

        case 'dhis2Uid':
            return (
                <UidPicker
                    resourceKey={field.dhis2Resource}
                    value={value ?? ''}
                    onChange={onChange}
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
                    onChange={onChange}
                    label={label}
                    multi
                    required={required}
                    helpText={description}
                />
            )

        case 'condition':
            return (
                <ConditionEditor
                    conditions={value || []}
                    onChange={(conditions) => onChange(conditions)}
                    label={label}
                    description={description}
                />
            )

        case 'object':
            return <ObjectRenderer field={field} value={value || {}} onChange={onChange} depth={depth} />

        case 'array':
            return (
                <ArrayRenderer
                    field={field}
                    value={Array.isArray(value) ? value : []}
                    onChange={onChange}
                    depth={depth}
                />
            )

        default:
            return (
                <InputField
                    label={`${label} (${type})`}
                    value={String(value ?? '')}
                    onChange={({ value: v }) => onChange(v)}
                    dense
                />
            )
    }
}

// ─── Grouped Field Renderer ───────────────────────────────────────────────────
// Groups fields by their `group` property, rendering each group under a heading
function GroupedFields({ fields, value, onChange, depth }) {
    // Build ordered list of groups preserving first-seen order
    const groups = []
    const groupMap = {}

    for (const field of fields) {
        const g = field.group || '__ungrouped__'
        if (!groupMap[g]) {
            groupMap[g] = []
            groups.push({ id: g, label: field.groupLabel || null, fields: groupMap[g] })
        }
        groupMap[g].push(field)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groups.map(({ id, label: groupLabel, fields: gFields }) => {
                const isUngrouped = id === '__ungrouped__'
                const color = GROUP_COLORS[id] || GROUP_COLORS.default

                return (
                    <div key={id}>
                        {!isUngrouped && groupLabel && (
                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    letterSpacing: '0.6px',
                                    textTransform: 'uppercase',
                                    color,
                                    borderLeft: `3px solid ${color}`,
                                    paddingLeft: '8px',
                                    marginBottom: '10px',
                                }}
                            >
                                {groupLabel}
                            </div>
                        )}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px',
                                alignItems: 'start',
                            }}
                        >
                            {gFields.map((field) => (
                                <div
                                    key={field.key}
                                    style={{
                                        gridColumn: ['array', 'object', 'condition'].includes(field.type) ? '1 / -1' : 'auto',
                                    }}
                                >
                                    <FieldRenderer
                                        field={field}
                                        value={getNestedValue(value || {}, field.key)}
                                        onChange={(v) => onChange(setNestedValue(value || {}, field.key, v))}
                                        depth={depth}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Object Renderer ──────────────────────────────────────────────────────────
function ObjectRenderer({ field, value, onChange, depth }) {
    const hasGroups = (field.fields || []).some((f) => f.group)

    return (
        <div
            style={{
                borderLeft: depth > 0 ? '3px solid #e0e7ed' : 'none',
                paddingLeft: depth > 0 ? '14px' : '0',
                marginTop: depth > 0 ? '8px' : '0',
                marginBottom: '16px',
            }}
        >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4a5768', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                {field.label}
            </div>
            {field.description && (
                <p style={{ fontSize: '12px', color: '#6c7787', margin: '0 0 10px' }}>{field.description}</p>
            )}
            {hasGroups ? (
                <div style={{ marginTop: '12px' }}>
                    <GroupedFields
                        fields={field.fields || []}
                        value={value}
                        onChange={onChange}
                        depth={depth + 1}
                    />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                    {(field.fields || []).map((subField) => (
                        <div
                            key={subField.key}
                            style={{
                                gridColumn: ['array', 'object'].includes(subField.type) ? '1 / -1' : 'auto',
                            }}
                        >
                            <FieldRenderer
                                field={subField}
                                value={value?.[subField.key]}
                                onChange={(v) => onChange({ ...(value || {}), [subField.key]: v })}
                                depth={depth + 1}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Array Renderer ───────────────────────────────────────────────────────────
function ArrayRenderer({ field, value = [], onChange, depth }) {
    const add = () => onChange([...value, { ...(field.defaultItem || {}) }])
    const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
    const update = (i, item) => onChange(value.map((v, idx) => (idx === i ? item : v)))
    const move = (i, dir) => {
        const arr = [...value]
        const j = i + dir
        if (j < 0 || j >= arr.length) return
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        onChange(arr)
    }

    const singularLabel = field.itemLabel || field.label?.replace(/s$/, '') || 'Item'

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#212934' }}>{field.label}</span>
                <Tag neutral dense>{value.length} {value.length === 1 ? singularLabel : field.label?.toLowerCase() || 'items'}</Tag>
            </div>
            {field.description && (
                <p style={{ fontSize: '13px', color: '#6c7787', margin: '0 0 12px' }}>{field.description}</p>
            )}

            {value.length === 0 && (
                <p style={{ fontSize: '13px', color: '#6c7787', fontStyle: 'italic', padding: '16px', textAlign: 'center', background: '#f9fafb', borderRadius: '4px', border: '1px dashed #c5cdd8', margin: '0 0 12px' }}>
                    No {field.label?.toLowerCase() || 'items'} configured yet.
                </p>
            )}

            {value.map((item, i) => (
                <ArrayItemCard
                    key={i}
                    index={i}
                    total={value.length}
                    item={item}
                    field={field}
                    onUpdate={(newItem) => update(i, newItem)}
                    onRemove={() => remove(i)}
                    onMove={(dir) => move(i, dir)}
                    depth={depth}
                />
            ))}

            <Button secondary small icon={<IconAdd16 />} onClick={add}>
                Add {singularLabel}
            </Button>
        </div>
    )
}

// ─── Array Item Card ──────────────────────────────────────────────────────────
function ArrayItemCard({ index, total, item, field, onUpdate, onRemove, onMove, depth }) {
    const [collapsed, setCollapsed] = React.useState(true)
    const fields = field.fields || []
    const hasGroups = fields.some((f) => f.group)

    // Use summaryField from schema to build a human-readable title
    const summaryField = field.summaryField
    const summaryValue = (() => {
        if (summaryField && item[summaryField]) return item[summaryField]
        // Fallback: first non-UID string value (skip 11-char UID strings)
        for (const f of fields) {
            const v = item[f.key]
            if (v && typeof v === 'string' && v.length !== 11) return v
        }
        return null
    })()

    return (
        <div style={{ marginBottom: '8px' }}>
            <Card>
                <div style={{ padding: '4px' }}>
                    {/* Card header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderBottom: collapsed ? 'none' : '1px solid #e0e7ed',
                            background: collapsed ? 'transparent' : '#f8fafc',
                            borderRadius: '4px 4px 0 0',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag neutral dense>#{index + 1}</Tag>
                            {summaryValue ? (
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#212934' }}>
                                    {summaryValue}
                                </span>
                            ) : (
                                <span style={{ fontSize: '13px', color: '#9aa4b2', fontStyle: 'italic' }}>
                                    (not configured)
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <Button small secondary icon={collapsed ? <IconChevronDown16 /> : <IconChevronUp16 />} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'} />
                            <Button small secondary icon={<IconChevronUp16 />} onClick={() => onMove(-1)} disabled={index === 0} title="Move up" />
                            <Button small secondary icon={<IconChevronDown16 />} onClick={() => onMove(1)} disabled={index === total - 1} title="Move down" />
                            <Button small destructive icon={<IconDelete16 />} onClick={onRemove} title="Remove" />
                        </div>
                    </div>

                    {/* Card body */}
                    {!collapsed && (
                        <div style={{ padding: '16px 12px' }}>
                            {hasGroups ? (
                                <GroupedFields
                                    fields={fields}
                                    value={item}
                                    onChange={onUpdate}
                                    depth={depth + 1}
                                />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                                    {fields.map((f) => (
                                        <div
                                            key={f.key}
                                            style={{
                                                gridColumn: ['array', 'object', 'condition'].includes(f.type) ? '1 / -1' : 'auto',
                                            }}
                                        >
                                            <FieldRenderer
                                                field={f}
                                                value={getNestedValue(item || {}, f.key)}
                                                onChange={(v) => onUpdate(setNestedValue(item || {}, f.key, v))}
                                                depth={depth + 1}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

// ─── Main ConfigFormRenderer ──────────────────────────────────────────────────
export function ConfigFormRenderer({ schema, value, onChange }) {
    const { type, fields, label, description, dhis2Resource } = schema

    const sectionHeader = (
        <div style={{ marginBottom: '16px' }}>
            {description && (
                <p style={{ fontSize: '13px', color: '#6c7787', margin: 0 }}>{description}</p>
            )}
        </div>
    )

    if (type === 'dhis2UidMulti') {
        return (
            <div>
                {sectionHeader}
                <UidPicker
                    resourceKey={dhis2Resource}
                    value={Array.isArray(value) ? value : []}
                    onChange={onChange}
                    label={label}
                    multi
                />
            </div>
        )
    }

    if (type === 'array') {
        return (
            <div>
                {sectionHeader}
                <ArrayRenderer
                    field={schema}
                    value={Array.isArray(value) ? value : []}
                    onChange={onChange}
                    depth={0}
                />
            </div>
        )
    }

    if (type === 'object') {
        const hasGroups = (fields || []).some((f) => f.group)
        return (
            <div>
                {sectionHeader}
                {hasGroups ? (
                    <GroupedFields
                        fields={fields || []}
                        value={value || {}}
                        onChange={onChange}
                        depth={0}
                    />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
                        {(fields || []).map((field) => (
                            <div
                                key={field.key}
                                style={{
                                    gridColumn: ['array', 'object'].includes(field.type) ? '1 / -1' : 'auto',
                                }}
                            >
                                <FieldRenderer
                                    field={field}
                                    value={value?.[field.key]}
                                    onChange={(v) => onChange({ ...(value || {}), [field.key]: v })}
                                    depth={0}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return null
}

export default ConfigFormRenderer
