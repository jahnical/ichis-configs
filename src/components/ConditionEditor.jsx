import React from 'react'
import {
    Button,
    Card,
    InputField,
    SingleSelect,
    SingleSelectOption,
    Tag,
    IconAdd16,
    IconDelete16,
} from '@dhis2/ui'

const REF_OPTIONS = [
    { value: 'literal', label: 'Literal Value' },
    { value: 'eventData', label: 'Event Data' },
    { value: 'allEventsData', label: 'All Events Data' },
    { value: 'attribute', label: 'TEI Attribute' },
    { value: 'programIndicator', label: 'Program Indicator' },
    { value: 'constant', label: 'Constant' },
    { value: 'context', label: 'Context / Environment' },
]

const OP_OPTIONS = [
    { value: 'EQUALS', label: 'Equals' },
    { value: 'NOT_EQUALS', label: 'Not Equals' },
    { value: 'NULL', label: 'Is Null (empty)' },
    { value: 'NOT_NULL', label: 'Is Not Null (has value)' },
    { value: 'GREATER_THAN', label: 'Greater Than' },
    { value: 'LESS_THAN', label: 'Less Than' },
]

export function ConditionEditor({ conditions = [], onChange, label }) {
    const defaultCondition = () => ({
        lhs: { ref: 'eventData', uid: '' },
        op: 'EQUALS',
        rhs: { value: '' },
    })

    const update = (index, path, val) => {
        const updated = conditions.map((c, i) => {
            if (i !== index) return c
            if (path === 'lhs.ref') return { ...c, lhs: { ...c.lhs, ref: val } }
            if (path === 'lhs.uid') return { ...c, lhs: { ...c.lhs, uid: val } }
            if (path === 'lhs.type') return { ...c, lhs: { ...c.lhs, type: val } }
            if (path === 'lhs.fn') return { ...c, lhs: { ...c.lhs, fn: val } }
            if (path === 'rhs.mode') {
                if (val === 'value') {
                    return { ...c, rhs: { value: c.rhs?.value || '' } }
                } else {
                    return { ...c, rhs: { ref: 'eventData', uid: '' } }
                }
            }
            if (path === 'rhs.ref') return { ...c, rhs: { ...c.rhs, ref: val } }
            if (path === 'rhs.uid') return { ...c, rhs: { ...c.rhs, uid: val } }
            if (path === 'rhs.value') return { ...c, rhs: { ...c.rhs, value: val } }
            if (path === 'rhs.type') return { ...c, rhs: { ...c.rhs, type: val } }
            if (path === 'rhs.fn') return { ...c, rhs: { ...c.rhs, fn: val } }
            return { ...c, [path]: val }
        })
        onChange(updated)
    }

    const add = () => onChange([...conditions, defaultCondition()])
    const remove = (i) => onChange(conditions.filter((_, idx) => idx !== i))

    return (
        <div>
            {/* Header row */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px',
                }}
            >
                {label && (
                    <span
                        style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#212934',
                        }}
                    >
                        {label}
                    </span>
                )}
                <Tag neutral dense>
                    {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
                </Tag>
            </div>

            {conditions.length === 0 && (
                <p
                    style={{
                        fontSize: '13px',
                        color: '#6c7787',
                        fontStyle: 'italic',
                        margin: '0 0 10px',
                    }}
                >
                    No conditions — applies unconditionally.
                </p>
            )}

            {conditions.map((cond, i) => (
                <div
                    key={i}
                    style={{
                        marginBottom: '12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderLeft: '4px solid #4a5568',
                        borderRadius: '4px',
                        padding: '12px',
                    }}
                >
                    {/* Condition Header */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                        }}
                    >
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Condition {i + 1}
                        </span>
                        <Button
                            small
                            destructive
                            secondary
                            icon={<IconDelete16 />}
                            onClick={() => remove(i)}
                            title="Remove condition"
                        >
                            Remove
                        </Button>
                    </div>

                    {/* Condition Inputs */}
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', flexWrap: 'wrap' }}>

                        {/* LHS (Left Hand Side) */}
                        <div style={{ flex: '1 1 30%', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f1f5f9', padding: '16px', borderRadius: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                Left Hand Side (Source)
                            </div>
                            <SingleSelect
                                label="Source Type"
                                selected={cond.lhs?.ref || ''}
                                onChange={({ selected }) =>
                                    update(i, 'lhs.ref', selected)
                                }
                            >
                                {REF_OPTIONS.map((o) => (
                                    <SingleSelectOption
                                        key={o.value}
                                        value={o.value}
                                        label={o.label}
                                    />
                                ))}
                            </SingleSelect>

                            {['literal', 'context', 'constant'].includes(cond.lhs?.ref) ? (
                                <InputField
                                    label={cond.lhs?.ref === 'literal' ? 'Value' : 'Code / Variable'}
                                    value={cond.lhs?.value || ''}
                                    onChange={({ value }) =>
                                        update(i, 'lhs.value', value)
                                    }
                                    placeholder="Enter value"
                                />
                            ) : (
                                <InputField
                                    label="Base UID"
                                    value={cond.lhs?.uid || ''}
                                    onChange={({ value }) =>
                                        update(i, 'lhs.uid', value)
                                    }
                                    placeholder="e.g. ggEeifB2HgC"
                                />
                            )}

                            <InputField
                                label="Type (Optional)"
                                value={cond.lhs?.type || ''}
                                onChange={({ value }) =>
                                    update(i, 'lhs.type', value)
                                }
                                placeholder="e.g. integer, string"
                            />

                            <InputField
                                label="Function (Optional)"
                                value={cond.lhs?.fn || ''}
                                onChange={({ value }) =>
                                    update(i, 'lhs.fn', value)
                                }
                                placeholder="e.g. d2:hasValue(x)"
                            />
                        </div>

                        {/* Operator (Middle) */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
                            <div style={{ width: '200px' }}>
                                <SingleSelect
                                    label="Operator"
                                    selected={cond.op || ''}
                                    onChange={({ selected }) =>
                                        update(i, 'op', selected)
                                    }
                                >
                                    {OP_OPTIONS.map((o) => (
                                        <SingleSelectOption
                                            key={o.value}
                                            value={o.value}
                                            label={o.label}
                                        />
                                    ))}
                                </SingleSelect>
                            </div>
                        </div>

                        {/* RHS (Right Hand Side) */}
                        {cond.op !== 'NULL' && cond.op !== 'NOT_NULL' ? (
                            <div style={{ flex: '1 1 30%', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f1f5f9', padding: '16px', borderRadius: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Right Hand Side (Target)
                                </div>
                                <SingleSelect
                                    label="Target Source"
                                    selected={cond.rhs?.ref || ''}
                                    onChange={({ selected }) =>
                                        update(i, 'rhs.ref', selected)
                                    }
                                >
                                    {REF_OPTIONS.map((o) => (
                                        <SingleSelectOption
                                            key={o.value}
                                            value={o.value}
                                            label={o.label}
                                        />
                                    ))}
                                </SingleSelect>

                                {['literal', 'context', 'constant'].includes(cond.rhs?.ref) ? (
                                    <InputField
                                        label={cond.rhs?.ref === 'literal' ? 'Value' : 'Code / Variable'}
                                        value={cond.rhs?.value || ''}
                                        onChange={({ value }) =>
                                            update(i, 'rhs.value', value)
                                        }
                                        placeholder="Enter value"
                                    />
                                ) : (
                                    <InputField
                                        label="Target Base UID"
                                        value={cond.rhs?.uid || ''}
                                        onChange={({ value }) =>
                                            update(i, 'rhs.uid', value)
                                        }
                                        placeholder="e.g. LAfiAKu70JZ"
                                    />
                                )}

                                <InputField
                                    label="Target Type (Optional)"
                                    value={cond.rhs?.type || ''}
                                    onChange={({ value }) =>
                                        update(i, 'rhs.type', value)
                                    }
                                    placeholder="e.g. integer, string"
                                />

                                <InputField
                                    label="Target Function (Optional)"
                                    value={cond.rhs?.fn || ''}
                                    onChange={({ value }) =>
                                        update(i, 'rhs.fn', value)
                                    }
                                    placeholder="e.g. d2:hasValue(x)"
                                />
                            </div>
                        ) : (
                            <div style={{ flex: '1 1 30%', minWidth: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                                <span style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                                    (No right-hand side required for {cond.op === 'NULL' ? 'Is Null' : 'Is Not Null'})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <Button secondary small icon={<IconAdd16 />} onClick={add}>
                Add Condition
            </Button>
        </div>
    )
}

export default ConditionEditor
