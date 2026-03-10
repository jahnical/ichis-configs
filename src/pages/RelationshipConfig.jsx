import React from 'react'
import { ConfigPage } from './ConfigPage.jsx'
import { relationshipSchema } from '../config/configSchema.js'

export function RelationshipConfig() {
    return <ConfigPage schema={relationshipSchema} />
}

export default RelationshipConfig
