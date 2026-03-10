import React, { useState, useCallback } from 'react'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    NoticeBox,
    AlertBar,
    AlertStack,
    Tab,
    TabBar,
    Tag,
    Divider,
} from '@dhis2/ui'
import { ConfigFormRenderer } from '../components/ConfigFormRenderer.jsx'
import { ImportExport } from '../components/ImportExport.jsx'
import {
    useDatastoreKey,
    useUpdateDatastoreKey,
} from '../services/datastoreService.js'

/**
 * ConfigPage — Generic page for editing a single datastore key.
 * Uses TabBar to switch between the key's sections.
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
    const [activeTab, setActiveTab] = useState(0)
    const [notifications, setNotifications] = useState([])

    const effectiveData = localData !== null ? localData : data

    const handleSectionChange = useCallback(
        (sectionPath, newValue) => {
            setLocalData({ ...(effectiveData || {}), [sectionPath]: newValue })
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
            addNotification('success', `${label} saved successfully.`)
            refetch()
        } catch (err) {
            addNotification(
                'error',
                `Failed to save: ${err?.message || 'Unknown error'}`
            )
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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 24px',
                    gap: '16px',
                    color: '#6c7787',
                }}
            >
                <CircularLoader />
                <p>Loading {label}...</p>
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

    const isNewKey =
        error?.httpStatusCode === 404 || (!loading && !data)
    const activeSection = sections[activeTab]
    const sectionValue =
        effectiveData?.[activeSection?.path ?? activeSection?.id]

    return (
        <div style={{ maxWidth: '960px' }}>
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#212934',
                            margin: '0 0 4px',
                        }}
                    >
                        {label}
                    </h1>
                    {description && (
                        <p
                            style={{
                                fontSize: '13px',
                                color: '#6c7787',
                                margin: '0 0 8px',
                            }}
                        >
                            {description}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Tag neutral dense>
                            community_redesign / {key}
                        </Tag>
                        {isNewKey && (
                            <Tag negative dense>
                                Key not yet set — will be created on save
                            </Tag>
                        )}
                        {isDirty && (
                            <Tag positive dense>
                                Unsaved changes
                            </Tag>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ImportExport
                        data={effectiveData}
                        configKey={key}
                        onImport={handleImport}
                    />
                    <ButtonStrip>
                        {isDirty && (
                            <Button secondary onClick={handleDiscard}>
                                Discard
                            </Button>
                        )}
                        <Button
                            primary
                            onClick={handleSave}
                            loading={isSaving}
                            disabled={!isDirty && !isNewKey}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </ButtonStrip>
                </div>
            </div>

            {saveError && (
                <NoticeBox error title="Save failed" style={{ marginBottom: '12px' }}>
                    {saveError.message}
                </NoticeBox>
            )}

            {/* Tabs — one per section */}
            {sections.length > 1 && (
                <TabBar>
                    {sections.map((section, i) => (
                        <Tab
                            key={section.id}
                            selected={activeTab === i}
                            onClick={() => setActiveTab(i)}
                        >
                            {section.label}
                        </Tab>
                    ))}
                </TabBar>
            )}

            <Divider />

            {/* Active section form */}
            <div style={{ paddingTop: '16px' }}>
                {activeSection && (
                    <ConfigFormRenderer
                        schema={activeSection}
                        value={sectionValue}
                        onChange={(newValue) =>
                            handleSectionChange(
                                activeSection.path ?? activeSection.id,
                                newValue
                            )
                        }
                    />
                )}
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
