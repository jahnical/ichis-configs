import React, { useState, useCallback } from 'react'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
    AlertBar,
    AlertStack,
    Divider,
    Tag,
} from '@dhis2/ui'
import { ConfigFormRenderer } from '../components/ConfigFormRenderer.jsx'
import { ImportExport } from '../components/ImportExport.jsx'
import { useDatastoreKey, useUpdateDatastoreKey } from '../services/datastoreService.js'
import styles from './ConfigPage.module.css'

/**
 * ConfigPage — Generic page for editing a single datastore key.
 *
 * Props:
 *   schema  - from configSchema.js (with .key, .label, .description, .sections)
 */
export function ConfigPage({ schema }) {
    const { key, label, description, sections } = schema

    const { loading, error, data, refetch } = useDatastoreKey(key)
    const { save, isSaving, saveError } = useUpdateDatastoreKey(key)

    const [localData, setLocalData] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [notifications, setNotifications] = useState([])

    // Initialize local state from fetched data
    const effectiveData = localData !== null ? localData : data

    const handleSectionChange = useCallback(
        (sectionPath, newValue) => {
            const currentData = effectiveData || {}
            setLocalData({ ...currentData, [sectionPath]: newValue })
            setIsDirty(true)
        },
        [effectiveData]
    )

    const addNotification = (type, message) => {
        const id = Date.now()
        setNotifications((prev) => [...prev, { id, type, message }])
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, 5000)
    }

    const handleSave = async () => {
        try {
            await save(effectiveData, !!data)
            setIsDirty(false)
            setLocalData(null)
            addNotification('success', `${label} configuration saved successfully.`)
            refetch()
        } catch (err) {
            addNotification('error', `Failed to save: ${err?.message || 'Unknown error'}`)
        }
    }

    const handleDiscard = () => {
        setLocalData(null)
        setIsDirty(false)
    }

    const handleImport = (importedData) => {
        setLocalData(importedData)
        setIsDirty(true)
        addNotification('info', 'JSON imported. Review and save to apply.')
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <CircularLoader />
                <p>Loading {label} configuration...</p>
            </div>
        )
    }

    if (error && error.httpStatusCode !== 404) {
        return (
            <NoticeBox error title="Error loading configuration">
                {error.message || 'Could not load this configuration key.'}
            </NoticeBox>
        )
    }

    const isNewKey = error?.httpStatusCode === 404 || (!loading && !data)

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>{label}</h1>
                    {description && (
                        <p className={styles.pageDescription}>{description}</p>
                    )}
                    <div className={styles.headerMeta}>
                        <Tag neutral dense>
                            dataStore: community_redesign / {key}
                        </Tag>
                        {isNewKey && (
                            <Tag negative dense>
                                Key does not exist yet — will be created on save
                            </Tag>
                        )}
                        {isDirty && (
                            <Tag positive dense>
                                Unsaved changes
                            </Tag>
                        )}
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <ImportExport
                        data={effectiveData}
                        configKey={key}
                        onImport={handleImport}
                    />
                    <ButtonStrip>
                        {isDirty && (
                            <Button secondary onClick={handleDiscard}>
                                Discard Changes
                            </Button>
                        )}
                        <Button
                            primary
                            onClick={handleSave}
                            loading={isSaving}
                            disabled={!isDirty && !isNewKey}
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </ButtonStrip>
                </div>
            </div>

            <Divider />

            {/* Save error */}
            {saveError && (
                <NoticeBox error title="Save failed" className={styles.errorBox}>
                    {saveError.message}
                </NoticeBox>
            )}

            {/* Sections */}
            <div className={styles.sections}>
                {sections.map((section, i) => {
                    const sectionValue = effectiveData?.[section.path ?? section.id]
                    return (
                        <div key={section.id} className={styles.section}>
                            <ConfigFormRenderer
                                schema={section}
                                value={sectionValue}
                                onChange={(newValue) =>
                                    handleSectionChange(
                                        section.path ?? section.id,
                                        newValue
                                    )
                                }
                            />
                            {i < sections.length - 1 && <Divider />}
                        </div>
                    )
                })}
            </div>

            {/* Notification stack */}
            <AlertStack>
                {notifications.map((n) => (
                    <AlertBar
                        key={n.id}
                        success={n.type === 'success'}
                        warning={n.type === 'info'}
                        critical={n.type === 'error'}
                        onHidden={() =>
                            setNotifications((prev) =>
                                prev.filter((x) => x.id !== n.id)
                            )
                        }
                    >
                        {n.message}
                    </AlertBar>
                ))}
            </AlertStack>
        </div>
    )
}

export default ConfigPage
