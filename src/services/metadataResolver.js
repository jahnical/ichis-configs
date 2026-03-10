import { useDataQuery } from '@dhis2/app-runtime'
import { useMemo } from 'react'
import { DHIS2_RESOURCES } from '../config/configSchema.js'

const cache = {}

/**
 * Fetch all items for a given DHIS2 resource (e.g. 'programs', 'trackedEntityAttributes').
 * Results are cached per resource to prevent redundant API calls.
 *
 * Returns: { loading, error, items: [{ id, displayName }] }
 */
export function useMetadata(resourceKey) {
    const resourceDef = DHIS2_RESOURCES[resourceKey]

    const query = useMemo(() => {
        if (!resourceDef) return null
        return {
            result: {
                resource: resourceDef.resource,
                params: {
                    fields: resourceDef.fields || 'id,displayName',
                    paging: false,
                },
            },
        }
    }, [resourceDef])

    const { loading, error, data } = useDataQuery(query, {
        lazy: !resourceDef,
    })

    const items = useMemo(() => {
        if (!data?.result) return []
        const collection = data.result[resourceDef?.resource]
        return collection || []
    }, [data, resourceDef])

    return { loading, error, items }
}

/**
 * Build a lookup map from a list of items: { [id]: displayName }
 * Useful for resolving UIDs to human-readable names throughout the UI.
 */
export function useMetadataMap(resourceKey) {
    const { loading, error, items } = useMetadata(resourceKey)

    const map = useMemo(() => {
        const m = {}
        items.forEach((item) => {
            m[item.id] = item.displayName || item.name || item.id
        })
        return m
    }, [items])

    return { loading, error, map }
}

/**
 * Resolve a single UID to a display name from a resource.
 * If metadata isn't loaded yet, returns the raw UID.
 */
export function useResolveUid(resourceKey, uid) {
    const { map } = useMetadataMap(resourceKey)
    if (!uid) return ''
    return map[uid] || uid
}
