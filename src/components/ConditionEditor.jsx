import React from 'react'
import {
    Button,
    InputField,
    SingleSelect,
    SingleSelectOption,
    IconAdd16,
    IconDelete16,
    Tag,
} from '@dhis2/ui'
import styles from './ConditionEditor.module.css'

const REF_OPTIONS = [
    { value: 'eventData', label: 'Event Data' },
    { value: 'allEventsData', label: 'All Events Data' },
    { value: 'attribute', label: 'TEI Attribute' },
]

const OP_OPTIONS = [
    { value: 'EQUALS', label: 'Equals' },
    { value: 'NOT_EQUALS', label: 'Not Equals' },
    { value: 'NULL', label: 'Is Null (empty)' },
    { value: 'NOT_NULL', label: 'Is Not Null (has value)' },
    { value: 'GREATER_THAN', label: 'Greater Than' },
    { value: 'LESS_THAN', label: 'Less Than' },
]

/**
 * ConditionEditor — Visual editor for trigger/completion condition arrays.
 *
 * A condition object looks like:
 * {
 *   lhs: { ref: 'eventData', uid: 'someUID' },
 *   op: 'EQUALS',
 *   rhs: { value: 'true' }
 * }
 *
 * Props:
 *   conditions  - array of condition objects
 *   onChange    - called with updated array
 *   label       - section label
 */
export function ConditionEditor({ conditions = [], onChange, label }) {
    const defaultCondition = () => ({
        lhs: { ref: 'eventData', uid: '' },
        op: 'EQUALS',
        rhs: { value: '' },
    })

    const update = (index, field, value) => {
        const updated = conditions.map((c, i) => {
            if (i !== index) return c
            if (field.startsWith('lhs.')) {
                const key = field.replace('lhs.', '')
                return { ...c, lhs: { ...c.lhs, [key]: value } }
            }
            if (field.startsWith('rhs.')) {
                const key = field.replace('rhs.', '')
                return { ...c, rhs: { ...c.rhs, [key]: value } }
            }
            return { ...c, [field]: value }
        })
        onChange(updated)
    }

    const add = () => onChange([...conditions, defaultCondition()])

    const remove = (index) =>
        onChange(conditions.filter((_, i) => i !== index))

    return (
        <div className={styles.container}>
            {label && (
                <div className={styles.header}>
                    <span className={styles.label}>{label}</span>
                    <Tag neutral dense>
                        {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
                    </Tag>
                </div>
            )}

            {conditions.length === 0 && (
                <p className={styles.empty}>
                    No conditions — task applies unconditionally.
                </p>
            )}

            {conditions.map((cond, i) => (
                <div key={i} className={styles.conditionRow}>
                    <div className={styles.conditionIndex}>
                        <Tag neutral dense>#{i + 1}</Tag>
                    </div>

                    <div className={styles.conditionFields}>
                        {/* LHS ref */}
                        <div className={styles.fieldGroup}>
                            <SingleSelect
                                label="Data Source"
                                selected={cond.lhs?.ref || ''}
                                onChange={({ selected }) =>
                                    update(i, 'lhs.ref', selected)
                                }
                                dense
                            >
                                {REF_OPTIONS.map((o) => (
                                    <SingleSelectOption
                                        key={o.value}
                                        value={o.value}
                                        label={o.label}
                                    />
                                ))}
                            </SingleSelect>
                        </div>

                        {/* LHS uid */}
                        <div className={styles.fieldGroup}>
                            <InputField
                                label="Data Element / Attribute UID"
                                value={cond.lhs?.uid || ''}
                                onChange={({ value }) =>
                                    update(i, 'lhs.uid', value)
                                }
                                dense
                                placeholder="e.g. ggEeifB2HgC"
                            />
                        </div>

                        {/* Operator */}
                        <div className={styles.fieldGroup}>
                            <SingleSelect
                                label="Operator"
                                selected={cond.op || ''}
                                onChange={({ selected }) =>
                                    update(i, 'op', selected)
                                }
                                dense
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

                        {/* RHS value */}
                        {cond.op !== 'NULL' && cond.op !== 'NOT_NULL' && (
                            <div className={styles.fieldGroup}>
                                <InputField
                                    label="Value"
                                    value={cond.rhs?.value || ''}
                                    onChange={({ value }) =>
                                        update(i, 'rhs.value', value)
                                    }
                                    dense
                                    placeholder="Expected value"
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.removeBtn}>
                        <Button
                            small
                            destructive
                            icon={<IconDelete16 />}
                            onClick={() => remove(i)}
                            title="Remove condition"
                        />
                    </div>
                </div>
            ))}

            <Button
                small
                secondary
                icon={<IconAdd16 />}
                onClick={add}
                className={styles.addBtn}
            >
                Add Condition
            </Button>
        </div>
    )
}

export default ConditionEditor
