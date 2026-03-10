import React from 'react'
import { ConfigPage } from './ConfigPage.jsx'
import { workflowSchema } from '../config/configSchema.js'

export function WorkflowConfig() {
    return <ConfigPage schema={workflowSchema} />
}

export default WorkflowConfig
