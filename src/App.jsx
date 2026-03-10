import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { HeaderBar } from '@dhis2/ui'
import { Sidebar } from './components/Sidebar.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { WorkflowConfig } from './pages/WorkflowConfig.jsx'
import { TaskingConfig } from './pages/TaskingConfig.jsx'
import { TaskProgramConfigPage } from './pages/TaskProgramConfigPage.jsx'
import { RelationshipConfig } from './pages/RelationshipConfig.jsx'
import styles from './App.module.css'

function App() {
    return (
        <HashRouter>
            <div className={styles.appShell}>
                {/* DHIS2 standard header bar */}
                <HeaderBar appName="iCHIS Config" />

                <div className={styles.layout}>
                    {/* Sidebar navigation */}
                    <Sidebar />

                    {/* Main content */}
                    <main className={styles.content}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/workflow" element={<WorkflowConfig />} />
                            <Route path="/tasking" element={<TaskingConfig />} />
                            <Route
                                path="/task-program-config"
                                element={<TaskProgramConfigPage />}
                            />
                            <Route
                                path="/relationships"
                                element={<RelationshipConfig />}
                            />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    )
}

export default App
