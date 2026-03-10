import React from 'react'
import { ConfigPage } from './ConfigPage.jsx'
import { taskingSchema } from '../config/configSchema.js'

export function TaskingConfig() {
    return <ConfigPage schema={taskingSchema} />
}

export default TaskingConfig
