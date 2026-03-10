import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Card,
    Tag,
    CircularLoader,
    NoticeBox,
    IconSettings16,
    IconList16,
    IconLink16,
    IconCheckmark16,
    IconWarning16,
} from '@dhis2/ui'
import { useDatastoreNamespace } from '../services/datastoreService.js'
import { ALL_SCHEMAS } from '../config/configSchema.js'

const ROUTE_MAP = {
    workflow: '/workflow',
    tasking: '/tasking',
    taskProgramConfiguration: '/task-program-config',
    relationship: '/relationships',
}

const ICON_MAP = {
    workflow: <IconSettings16 />,
    tasking: <IconList16 />,
    taskProgramConfiguration: <IconSettings16 />,
    relationship: <IconLink16 />,
}

const COLORS = {
    workflow: '#1a73e8',
    tasking: '#00796b',
    taskProgramConfiguration: '#e65100',
    relationship: '#6a1b9a',
}

export function Dashboard() {
    const { loading, keys } = useDatastoreNamespace()
    const navigate = useNavigate()

    return (
        <div style={{ maxWidth: '960px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1
                    style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#212934',
                        margin: '0 0 6px',
                    }}
                >
                    iCHIS Configuration Manager
                </h1>
                <p style={{ fontSize: '14px', color: '#6c7787', margin: 0 }}>
                    Manage iCHIS configurations stored in the{' '}
                    <code
                        style={{
                            fontFamily: 'monospace',
                            background: '#f3f5f7',
                            padding: '1px 5px',
                            borderRadius: '3px',
                        }}
                    >
                        community_redesign
                    </code>{' '}
                    datastore namespace. Click a section to configure it.
                </p>
            </div>

            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <CircularLoader small />
                    <span style={{ fontSize: '14px', color: '#6c7787' }}>
                        Checking datastore...
                    </span>
                </div>
            )}

            {/* Cards grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                {ALL_SCHEMAS.map((schema) => {
                    const exists = !loading && keys.includes(schema.key)
                    const route = ROUTE_MAP[schema.key]
                    const color = COLORS[schema.key]

                    return (
                        <div
                            key={schema.key}
                            onClick={() => navigate(route)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card>
                                <div style={{ padding: '16px' }}>
                                    {/* Top accent bar */}
                                    <div
                                        style={{
                                            height: '3px',
                                            background: color,
                                            borderRadius: '2px',
                                            marginBottom: '14px',
                                        }}
                                    />

                                    {/* Icon + status */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        <div style={{ color }}>{ICON_MAP[schema.key]}</div>
                                        <div>
                                            {loading ? (
                                                <Tag neutral dense>
                                                    Checking...
                                                </Tag>
                                            ) : exists ? (
                                                <Tag positive dense>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <IconCheckmark16 /> Configured
                                                    </span>
                                                </Tag>
                                            ) : (
                                                <Tag negative dense>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        <IconWarning16 /> Not set
                                                    </span>
                                                </Tag>
                                            )}
                                        </div>
                                    </div>

                                    {/* Title + description */}
                                    <h2
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            color: '#212934',
                                            margin: '0 0 6px',
                                        }}
                                    >
                                        {schema.label}
                                    </h2>
                                    <p
                                        style={{
                                            fontSize: '13px',
                                            color: '#6c7787',
                                            margin: '0 0 12px',
                                            lineHeight: '1.5',
                                        }}
                                    >
                                        {schema.description}
                                    </p>

                                    {/* Section tags */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '4px',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        {schema.sections.map((s) => (
                                            <Tag key={s.id} neutral dense>
                                                {s.label}
                                            </Tag>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div
                                        style={{
                                            borderTop: '1px solid #e8edf2',
                                            paddingTop: '10px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <code
                                            style={{
                                                fontSize: '11px',
                                                color: '#6c7787',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            {schema.key}
                                        </code>
                                        <span
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: color,
                                            }}
                                        >
                                            Configure →
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )
                })}
            </div>

            {/* Info box */}
            <NoticeBox title="About iCHIS Config Manager">
                Provides a graphical interface for managing iCHIS DHIS2 datastore
                configurations. Changes are saved directly to the{' '}
                <code>community_redesign</code> datastore namespace. Use
                Import/Export on each page for backups or bulk updates.
            </NoticeBox>
        </div>
    )
}

export default Dashboard
