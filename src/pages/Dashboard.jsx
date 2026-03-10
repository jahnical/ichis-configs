import React from 'react'
import { Link } from 'react-router-dom'
import {
    CircularLoader,
    Tag,
    IconSettings16,
    IconList16,
    IconLink16,
    IconCheckmark16,
    IconWarning16,
    IconInfo16,
} from '@dhis2/ui'
import { useDatastoreNamespace } from '../services/datastoreService.js'
import { ALL_SCHEMAS } from '../config/configSchema.js'
import styles from './Dashboard.module.css'

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

const COLOR_MAP = {
    workflow: '#1a73e8',
    tasking: '#0f9d58',
    taskProgramConfiguration: '#f4511e',
    relationship: '#9c27b0',
}

export function Dashboard() {
    const { loading, error, keys } = useDatastoreNamespace()

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>iCHIS Configuration Manager</h1>
                <p className={styles.subtitle}>
                    Manage iCHIS DHIS2 datastore configurations for the{' '}
                    <code className={styles.code}>community_redesign</code> namespace.
                    Click any section below to view and edit its configuration.
                </p>
            </div>

            {loading && (
                <div className={styles.loading}>
                    <CircularLoader />
                    <span>Checking datastore...</span>
                </div>
            )}

            <div className={styles.grid}>
                {ALL_SCHEMAS.map((schema) => {
                    const exists = !loading && keys.includes(schema.key)
                    const route = ROUTE_MAP[schema.key]
                    const color = COLOR_MAP[schema.key]

                    return (
                        <Link
                            key={schema.key}
                            to={route}
                            className={styles.cardLink}
                        >
                            <div
                                className={styles.card}
                                style={{ '--card-color': color }}
                            >
                                <div
                                    className={styles.cardAccent}
                                    style={{ background: color }}
                                />
                                <div className={styles.cardHeader}>
                                    <div
                                        className={styles.cardIcon}
                                        style={{ color }}
                                    >
                                        {ICON_MAP[schema.key]}
                                    </div>
                                    <div className={styles.cardStatus}>
                                        {loading ? (
                                            <Tag neutral dense>Checking...</Tag>
                                        ) : exists ? (
                                            <Tag positive dense>
                                                <IconCheckmark16 /> Configured
                                            </Tag>
                                        ) : (
                                            <Tag negative dense>
                                                <IconWarning16 /> Not Set
                                            </Tag>
                                        )}
                                    </div>
                                </div>

                                <h2 className={styles.cardTitle}>{schema.label}</h2>
                                <p className={styles.cardDescription}>
                                    {schema.description}
                                </p>

                                <div className={styles.cardMeta}>
                                    <span className={styles.cardKey}>
                                        Key: <code>{schema.key}</code>
                                    </span>
                                    <span className={styles.cardSections}>
                                        {schema.sections.length} section
                                        {schema.sections.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className={styles.sectionList}>
                                    {schema.sections.map((s) => (
                                        <span key={s.id} className={styles.sectionChip}>
                                            {s.label}
                                        </span>
                                    ))}
                                </div>

                                <div className={styles.cardFooter}>
                                    <span className={styles.configure}>
                                        Configure →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className={styles.infoBox}>
                <IconInfo16 />
                <div>
                    <strong>About iCHIS Config Manager</strong>
                    <p>
                        This app provides a graphical interface for managing iCHIS
                        DHIS2 datastore configurations. Changes are validated and saved
                        directly to the DHIS2 datastore. Use the Import/Export feature
                        on each page for bulk updates or backup.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
