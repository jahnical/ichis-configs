import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { WorkflowConfig } from './pages/WorkflowConfig.jsx'
import { TaskingConfig } from './pages/TaskingConfig.jsx'
import { TaskProgramConfigPage } from './pages/TaskProgramConfigPage.jsx'
import { RelationshipConfig } from './pages/RelationshipConfig.jsx'

function App() {
    return (
        <HashRouter>
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                <Sidebar />
                <main
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px',
                        background: '#f3f5f7',
                    }}
                >
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
        </HashRouter>
    )
}

export default App
