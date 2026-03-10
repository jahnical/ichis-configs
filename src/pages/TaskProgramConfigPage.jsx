import React from 'react'
import { ConfigPage } from './ConfigPage.jsx'
import { taskProgramConfigurationSchema } from '../config/configSchema.js'

export function TaskProgramConfigPage() {
    return <ConfigPage schema={taskProgramConfigurationSchema} />
}

export default TaskProgramConfigPage
