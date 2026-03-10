import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import { useState, useCallback } from 'react'

const NAMESPACE = 'community_redesign'

// ─── Read a datastore key ───────────────────────────────────────────────────
export function useDatastoreKey(key) {
    const query = {
        data: {
            resource: `dataStore/${NAMESPACE}/${key}`,
        },
    }
    const { loading, error, data, refetch } = useDataQuery(query)
    return { loading, error, data: data?.data, refetch }
}

// ─── Check which keys exist in the namespace ────────────────────────────────
export function useDatastoreNamespace() {
    const query = {
        keys: {
            resource: `dataStore/${NAMESPACE}`,
        },
    }
    const { loading, error, data, refetch } = useDataQuery(query)
    return { loading, error, keys: data?.keys || [], refetch }
}

// ─── Create or update a datastore key ───────────────────────────────────────
export function useUpdateDatastoreKey(key) {
    const [create, createState] = useDataMutation({
        resource: `dataStore/${NAMESPACE}/${key}`,
        type: 'create',
        data: ({ value }) => value,
    })

    const [update, updateState] = useDataMutation({
        resource: `dataStore/${NAMESPACE}/${key}`,
        type: 'update',
        data: ({ value }) => value,
    })

    const save = useCallback(
        async (value, exists) => {
            if (exists) {
                return update({ value })
            } else {
                return create({ value })
            }
        },
        [create, update]
    )

    const isSaving = createState.loading || updateState.loading
    const saveError = createState.error || updateState.error

    return { save, isSaving, saveError }
}

// ─── Delete a datastore key ─────────────────────────────────────────────────
export function useDeleteDatastoreKey(key) {
    const [mutate, { loading, error }] = useDataMutation({
        resource: `dataStore/${NAMESPACE}/${key}`,
        type: 'delete',
    })
    return { remove: mutate, isDeleting: loading, deleteError: error }
}
