import React, { useState, useRef } from 'react'
import {
    Button,
    IconDownload16,
    IconUpload16,
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    ButtonStrip,
    NoticeBox,
} from '@dhis2/ui'
import styles from './ImportExport.module.css'

/**
 * ImportExport — Buttons to import/export a config value as JSON.
 *
 * Props:
 *   data       - current data to export
 *   configKey  - e.g. 'workflow' (used in filename)
 *   onImport   - called with parsed JSON when user imports
 */
export function ImportExport({ data, configKey, onImport }) {
    const [showImport, setShowImport] = useState(false)
    const [importText, setImportText] = useState('')
    const [importError, setImportError] = useState(null)
    const fileRef = useRef()

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ichis_${configKey}_${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            setImportText(ev.target.result)
            setImportError(null)
        }
        reader.readAsText(file)
    }

    const handleImportConfirm = () => {
        try {
            const parsed = JSON.parse(importText)
            onImport(parsed)
            setShowImport(false)
            setImportText('')
            setImportError(null)
        } catch (e) {
            setImportError(`Invalid JSON: ${e.message}`)
        }
    }

    return (
        <>
            <div className={styles.buttonGroup}>
                <Button
                    small
                    secondary
                    icon={<IconDownload16 />}
                    onClick={handleExport}
                    disabled={!data}
                >
                    Export JSON
                </Button>
                <Button
                    small
                    secondary
                    icon={<IconUpload16 />}
                    onClick={() => setShowImport(true)}
                >
                    Import JSON
                </Button>
            </div>

            {showImport && (
                <Modal onClose={() => setShowImport(false)} large>
                    <ModalTitle>Import JSON Configuration</ModalTitle>
                    <ModalContent>
                        <p className={styles.importInfo}>
                            Upload a JSON file or paste the configuration below.
                            This will replace the current configuration.
                        </p>

                        <div className={styles.fileUpload}>
                            <Button
                                secondary
                                small
                                onClick={() => fileRef.current?.click()}
                            >
                                Browse File...
                            </Button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileSelect}
                                className={styles.hiddenInput}
                            />
                        </div>

                        <textarea
                            className={styles.jsonTextarea}
                            value={importText}
                            onChange={(e) => {
                                setImportText(e.target.value)
                                setImportError(null)
                            }}
                            placeholder="Or paste JSON here..."
                            rows={16}
                            spellCheck={false}
                        />

                        {importError && (
                            <NoticeBox error title="Parse Error">
                                {importError}
                            </NoticeBox>
                        )}

                        {importText && !importError && (
                            <NoticeBox title="Preview">
                                <pre className={styles.preview}>
                                    {(() => {
                                        try {
                                            return JSON.stringify(
                                                JSON.parse(importText),
                                                null,
                                                2
                                            ).slice(0, 500) + (importText.length > 500 ? '\n...' : '')
                                        } catch {
                                            return importText.slice(0, 200)
                                        }
                                    })()}
                                </pre>
                            </NoticeBox>
                        )}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button secondary onClick={() => setShowImport(false)}>
                                Cancel
                            </Button>
                            <Button
                                primary
                                onClick={handleImportConfirm}
                                disabled={!importText}
                            >
                                Import & Replace
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </>
    )
}

export default ImportExport
