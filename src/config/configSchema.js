/**
 * Meta-Config Schema for iCHIS Configuration App
 *
 * This schema defines the structure, field types, validation, and DHIS2
 * metadata resource mappings for each datastore key under community_redesign.
 *
 * Field types:
 *   - 'string'         → plain text input
 *   - 'number'         → numeric input
 *   - 'boolean'        → toggle switch
 *   - 'select'         → fixed option dropdown
 *   - 'dhis2Uid'       → UID picker backed by a DHIS2 metadata resource
 *   - 'dhis2UidMulti'  → multi-UID picker
 *   - 'array'          → array of objects (fields = sub-field schema)
 *   - 'object'         → nested object
 *   - 'conditions'     → specialized condition array editor
 */

export const DHIS2_RESOURCES = {
    programs: {
        resource: 'programs',
        fields: 'id,displayName',
        label: 'Programs',
    },
    trackedEntityAttributes: {
        resource: 'trackedEntityAttributes',
        fields: 'id,displayName',
        label: 'Tracked Entity Attributes',
    },
    trackedEntityTypes: {
        resource: 'trackedEntityTypes',
        fields: 'id,displayName',
        label: 'Tracked Entity Types',
    },
    relationshipTypes: {
        resource: 'relationshipTypes',
        fields: 'id,displayName',
        label: 'Relationship Types',
    },
    dataElements: {
        resource: 'dataElements',
        fields: 'id,displayName',
        label: 'Data Elements',
    },
    programStages: {
        resource: 'programStages',
        fields: 'id,displayName',
        label: 'Program Stages',
    },
    optionSets: {
        resource: 'optionSets',
        fields: 'id,displayName,code',
        label: 'Option Sets',
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export const workflowSchema = {
    key: 'workflow',
    label: 'Workflow Configuration',
    description:
        'Controls program enrollment, TEI auto-creation, and auto-increment attributes.',
    sections: [
        {
            id: 'autoIncrementAttributes',
            label: 'Auto Increment Attributes',
            description:
                'Attributes that get auto-incremented when a new TEI is created.',
            type: 'array',
            path: 'autoIncrementAttributes',
            defaultItem: { attributeUid: '', programUid: '' },
            fields: [
                {
                    key: 'attributeUid',
                    label: 'Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                    description: 'The attribute to auto-increment',
                },
                {
                    key: 'programUid',
                    label: 'Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description: 'The program this applies to',
                },
            ],
        },
        {
            id: 'entityAutoCreation',
            label: 'Entity Auto Creation',
            description:
                'Automatically creates a TEI in a target program when one is created in the trigger program.',
            type: 'array',
            path: 'entityAutoCreation',
            defaultItem: {
                triggerProgram: '',
                targetProgram: '',
                targetTeiType: '',
                relationshipType: '',
                attributesMappings: [],
            },
            fields: [
                {
                    key: 'triggerProgram',
                    label: 'Trigger Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description: 'When a TEI is enrolled in this program...',
                },
                {
                    key: 'targetProgram',
                    label: 'Target Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description: '...automatically enroll them in this program',
                },
                {
                    key: 'targetTeiType',
                    label: 'Target TEI Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                    description: 'TEI type for the auto-created entity',
                },
                {
                    key: 'relationshipType',
                    label: 'Relationship Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'relationshipTypes',
                    required: true,
                    description:
                        'Relationship to create between source and target TEIs',
                },
                {
                    key: 'attributesMappings',
                    label: 'Attribute Mappings',
                    type: 'array',
                    description: 'Map source attributes to target attributes',
                    defaultItem: {
                        sourceAttribute: '',
                        targetAttribute: '',
                        defaultValue: '',
                        isDuplicationKey: false,
                    },
                    fields: [
                        {
                            key: 'sourceAttribute',
                            label: 'Source Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: false,
                            description: 'Leave empty for a constant value',
                        },
                        {
                            key: 'targetAttribute',
                            label: 'Target Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                        },
                        {
                            key: 'defaultValue',
                            label: 'Default Value',
                            type: 'string',
                            description:
                                'Used when source attribute is empty or absent',
                        },
                        {
                            key: 'isDuplicationKey',
                            label: 'Is Duplication Key',
                            type: 'boolean',
                            description:
                                'Use this mapping to detect duplicate auto-creations',
                        },
                    ],
                },
            ],
        },
        {
            id: 'programEnrollmentControl',
            label: 'Program Enrollment Control',
            description:
                'Conditions that control whether a TEI can be enrolled in a given program.',
            type: 'array',
            path: 'programEnrollmentControl',
            defaultItem: {
                programUid: '',
                attributeUid: '',
                condition: 'equals',
                attributeValue: '',
            },
            fields: [
                {
                    key: 'programUid',
                    label: 'Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                },
                {
                    key: 'attributeUid',
                    label: 'Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                    description: 'Attribute to check for enrollment eligibility',
                },
                {
                    key: 'condition',
                    label: 'Condition',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'equals', label: 'Equals' },
                        { value: 'between', label: 'Between (comma-separated min,max)' },
                        { value: 'less_than', label: 'Less Than' },
                        { value: 'greater_than', label: 'Greater Than' },
                    ],
                },
                {
                    key: 'attributeValue',
                    label: 'Attribute Value',
                    type: 'string',
                    required: true,
                    description:
                        'For "between" use "min,max" (e.g. "0.1667,5"). For "equals" use exact value.',
                },
            ],
        },
        {
            id: 'teiCreatablePrograms',
            label: 'TEI Creatable Programs',
            description: 'Programs in which the user can create new TEIs.',
            type: 'dhis2UidMulti',
            path: 'teiCreatablePrograms',
            dhis2Resource: 'programs',
        },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// TASKING SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export const taskingSchema = {
    key: 'tasking',
    label: 'Tasking Configuration',
    description:
        'Defines automated tasks triggered by events in tracker programs.',
    sections: [
        {
            id: 'programTasks',
            label: 'Program Tasks',
            description: 'Task configurations per program.',
            type: 'array',
            path: 'programTasks',
            defaultItem: {
                programUid: '',
                programName: '',
                taskConfigs: [],
                teiView: {
                    teiPrimaryAttribute: '',
                    teiSecondaryAttribute: '',
                    teiTertiaryAttribute: '',
                },
            },
            fields: [
                {
                    key: 'programUid',
                    label: 'Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    syncsLabel: 'programName',
                },
                {
                    key: 'programName',
                    label: 'Program Name (display)',
                    type: 'string',
                    readOnly: true,
                    description: 'Auto-populated from selected program',
                },
                {
                    key: 'teiView',
                    label: 'TEI View Attributes',
                    type: 'object',
                    fields: [
                        {
                            key: 'teiPrimaryAttribute',
                            label: 'Primary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                        },
                        {
                            key: 'teiSecondaryAttribute',
                            label: 'Secondary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'teiTertiaryAttribute',
                            label: 'Tertiary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                    ],
                },
                {
                    key: 'taskConfigs',
                    label: 'Task Configs',
                    type: 'array',
                    description: 'Individual task definitions for this program',
                    defaultItem: {
                        name: '',
                        description: '',
                        priority: 'medium',
                        period: { anchor: { ref: '', uid: '' }, dueInDays: 1 },
                        trigger: { condition: [] },
                        completion: { condition: [] },
                    },
                    fields: [
                        {
                            key: 'name',
                            label: 'Task Name',
                            type: 'string',
                            required: true,
                        },
                        {
                            key: 'description',
                            label: 'Description',
                            type: 'string',
                        },
                        {
                            key: 'priority',
                            label: 'Priority',
                            type: 'select',
                            required: true,
                            options: [
                                { value: 'high', label: 'High' },
                                { value: 'medium', label: 'Medium' },
                                { value: 'low', label: 'Low' },
                            ],
                        },
                        {
                            key: 'period',
                            label: 'Period',
                            type: 'object',
                            fields: [
                                {
                                    key: 'dueInDays',
                                    label: 'Due In Days',
                                    type: 'number',
                                    required: true,
                                },
                                {
                                    key: 'anchor',
                                    label: 'Anchor',
                                    type: 'object',
                                    fields: [
                                        {
                                            key: 'uid',
                                            label: 'Anchor Attribute',
                                            type: 'dhis2Uid',
                                            dhis2Resource: 'trackedEntityAttributes',
                                            description: 'Leave empty for enrollment date',
                                        },
                                        {
                                            key: 'ref',
                                            label: 'Anchor Ref',
                                            type: 'string',
                                            description: 'Leave empty for default',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            key: 'trigger',
                            label: 'Trigger Conditions',
                            type: 'conditions',
                            description:
                                'Task is created when ALL these conditions are met',
                        },
                        {
                            key: 'completion',
                            label: 'Completion Conditions',
                            type: 'conditions',
                            description:
                                'Task is marked complete when ANY of these conditions is met',
                        },
                    ],
                },
            ],
        },
        {
            id: 'taskProgramConfig',
            label: 'Task Program Config',
            description: 'Configuration for the tasking program itself.',
            type: 'array',
            path: 'taskProgramConfig',
            defaultItem: {
                programUid: '',
                programName: '',
                teiTypeUid: '',
                statusUid: '',
                priorityUid: '',
                taskNameUid: '',
                taskPrimaryAttrUid: '',
                taskSecondaryAttrUid: '',
                taskTertiaryAttrUid: '',
                taskProgressUid: '',
                taskSourceProgramUid: '',
                taskSourceEnrollmentUid: '',
                taskSourceEventUid: '',
                taskSourceTeiUid: '',
                dueDateUid: '',
            },
            fields: [
                {
                    key: 'programUid',
                    label: 'Tasking Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    syncsLabel: 'programName',
                },
                {
                    key: 'programName',
                    label: 'Program Name (display)',
                    type: 'string',
                    readOnly: true,
                },
                {
                    key: 'teiTypeUid',
                    label: 'TEI Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                },
                {
                    key: 'statusUid',
                    label: 'Status Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'priorityUid',
                    label: 'Priority Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskNameUid',
                    label: 'Task Name Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'dueDateUid',
                    label: 'Due Date Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskPrimaryAttrUid',
                    label: 'Task Primary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                },
                {
                    key: 'taskSecondaryAttrUid',
                    label: 'Task Secondary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                },
                {
                    key: 'taskTertiaryAttrUid',
                    label: 'Task Tertiary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                },
                {
                    key: 'taskProgressUid',
                    label: 'Task Progress Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskSourceProgramUid',
                    label: 'Source Program Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskSourceEnrollmentUid',
                    label: 'Source Enrollment Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskSourceEventUid',
                    label: 'Source Event Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
                {
                    key: 'taskSourceTeiUid',
                    label: 'Source TEI Data Element',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                },
            ],
        },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK PROGRAM CONFIGURATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export const taskProgramConfigurationSchema = {
    key: 'taskProgramConfiguration',
    label: 'Task Program Configuration',
    description:
        'Option sets, relationship types, tracked entity types and attributes for the tasking system.',
    sections: [
        {
            id: 'optionSets',
            label: 'Option Sets',
            description: 'Option sets used for task priority, status, and type.',
            type: 'object',
            path: 'optionSets',
            fields: [
                {
                    key: 'priority',
                    label: 'Priority Option Set',
                    type: 'object',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            syncsLabel: 'name',
                        },
                        {
                            key: 'name',
                            label: 'Name',
                            type: 'string',
                            readOnly: true,
                        },
                        {
                            key: 'code',
                            label: 'Code',
                            type: 'string',
                            readOnly: true,
                        },
                    ],
                },
                {
                    key: 'status',
                    label: 'Status Option Set',
                    type: 'object',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            syncsLabel: 'name',
                        },
                        {
                            key: 'name',
                            label: 'Name',
                            type: 'string',
                            readOnly: true,
                        },
                        {
                            key: 'code',
                            label: 'Code',
                            type: 'string',
                            readOnly: true,
                        },
                    ],
                },
                {
                    key: 'type',
                    label: 'Type Option Set',
                    type: 'object',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            syncsLabel: 'name',
                        },
                        {
                            key: 'name',
                            label: 'Name',
                            type: 'string',
                            readOnly: true,
                        },
                        {
                            key: 'code',
                            label: 'Code',
                            type: 'string',
                            readOnly: true,
                        },
                    ],
                },
            ],
        },
        {
            id: 'trackedEntityTypes',
            label: 'Tracked Entity Types',
            description: 'Tracked entity types used in the tasking system.',
            type: 'array',
            path: 'trackedEntityTypes',
            defaultItem: { id: '', name: '', code: '' },
            fields: [
                {
                    key: 'id',
                    label: 'Tracked Entity Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                    syncsLabel: 'name',
                },
                {
                    key: 'name',
                    label: 'Name',
                    type: 'string',
                    readOnly: true,
                },
                {
                    key: 'code',
                    label: 'Code',
                    type: 'string',
                },
            ],
        },
        {
            id: 'trackedEntityAttributes',
            label: 'Tracked Entity Attributes',
            description: 'Attributes for displaying TEIs in task lists.',
            type: 'array',
            path: 'trackedEntityAttributes',
            defaultItem: {
                teiPrimaryAttribute: '',
                teiSecondaryAttribute: '',
                teiTertiaryAttribute: '',
            },
            fields: [
                {
                    key: 'teiPrimaryAttribute',
                    label: 'Primary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                },
                {
                    key: 'teiSecondaryAttribute',
                    label: 'Secondary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                },
                {
                    key: 'teiTertiaryAttribute',
                    label: 'Tertiary Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                },
            ],
        },
        {
            id: 'taskProgramConfigs',
            label: 'Task Program Configs',
            description: 'Program-level config for the tasking system.',
            type: 'array',
            path: 'taskProgramConfigs',
            defaultItem: {
                programUid: '',
                programName: '',
                teiTypeUid: '',
                statusOptionSetUid: '',
                statusUid: null,
            },
            fields: [
                {
                    key: 'programUid',
                    label: 'Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    syncsLabel: 'programName',
                },
                {
                    key: 'programName',
                    label: 'Program Name',
                    type: 'string',
                    readOnly: true,
                },
                {
                    key: 'teiTypeUid',
                    label: 'TEI Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                },
                {
                    key: 'statusOptionSetUid',
                    label: 'Status Option Set',
                    type: 'dhis2Uid',
                    dhis2Resource: 'optionSets',
                },
            ],
        },
        {
            id: 'relationships',
            label: 'Relationships',
            description: 'Relationships linking tasks to programs and events.',
            type: 'array',
            path: 'relationships',
            defaultItem: {
                description: '',
                sourceProgram: {
                    sourceProgramUid: '',
                    sourceTeiTypeName: '',
                    sourceTeiTypeUid: '',
                },
                view: {
                    sourceTeiPrimaryAttribute: '',
                    SourceTeiSecondaryAttribute: '',
                    sourceTeiTertiaryAttribute: '',
                },
                access: {
                    targetProgramUid: '',
                    targetRelationshipUid: '',
                    targetTeiTypeUid: '',
                    targetProgramStageUid: '',
                    targetDataElement: '',
                },
            },
            fields: [
                {
                    key: 'description',
                    label: 'Description',
                    type: 'string',
                    required: true,
                },
                {
                    key: 'sourceProgram',
                    label: 'Source Program',
                    type: 'object',
                    fields: [
                        {
                            key: 'sourceProgramUid',
                            label: 'Source Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            required: true,
                        },
                        {
                            key: 'sourceTeiTypeUid',
                            label: 'Source TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            syncsLabel: 'sourceTeiTypeName',
                        },
                        {
                            key: 'sourceTeiTypeName',
                            label: 'TEI Type Name',
                            type: 'string',
                            readOnly: true,
                        },
                    ],
                },
                {
                    key: 'view',
                    label: 'View Attributes',
                    type: 'object',
                    fields: [
                        {
                            key: 'sourceTeiPrimaryAttribute',
                            label: 'Primary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'SourceTeiSecondaryAttribute',
                            label: 'Secondary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'sourceTeiTertiaryAttribute',
                            label: 'Tertiary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                    ],
                },
                {
                    key: 'access',
                    label: 'Access / Target',
                    type: 'object',
                    fields: [
                        {
                            key: 'targetRelationshipUid',
                            label: 'Relationship Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'relationshipTypes',
                            required: true,
                        },
                        {
                            key: 'targetProgramUid',
                            label: 'Target Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                        },
                        {
                            key: 'targetTeiTypeUid',
                            label: 'Target TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                        },
                        {
                            key: 'targetProgramStageUid',
                            label: 'Target Program Stage',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programStages',
                        },
                        {
                            key: 'targetDataElement',
                            label: 'Target Data Element(s)',
                            type: 'string',
                            description: 'UID or comma-separated UIDs of target data elements',
                        },
                    ],
                },
            ],
        },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONSHIP SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export const relationshipSchema = {
    key: 'relationship',
    label: 'Relationship Configuration',
    description:
        'Defines relationships between programs and how they are displayed.',
    sections: [
        {
            id: 'relationships',
            label: 'Relationships',
            description: 'All configured program relationships.',
            type: 'array',
            path: 'relationships',
            defaultItem: {
                description: '',
                relatedProgram: {
                    programUid: '',
                    teiTypeName: '',
                    teiTypeUid: '',
                },
                access: {
                    targetProgramUid: '',
                    targetRelationshipUid: '',
                    targetTeiTypeUid: '',
                },
                attributeMappings: [],
                view: {
                    teiPrimaryAttribute: '',
                    teiSecondaryAttribute: '',
                    teiTertiaryAttribute: '',
                },
            },
            fields: [
                {
                    key: 'description',
                    label: 'Description',
                    type: 'string',
                    required: true,
                    description: 'Human-readable name for this relationship',
                },
                {
                    key: 'maxCount',
                    label: 'Max Count',
                    type: 'number',
                    description: 'Maximum number of related entities (leave empty for unlimited)',
                },
                {
                    key: 'relatedProgram',
                    label: 'Related Program',
                    type: 'object',
                    fields: [
                        {
                            key: 'programUid',
                            label: 'Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            required: true,
                        },
                        {
                            key: 'teiTypeUid',
                            label: 'TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            syncsLabel: 'teiTypeName',
                        },
                        {
                            key: 'teiTypeName',
                            label: 'TEI Type Name',
                            type: 'string',
                            readOnly: true,
                        },
                    ],
                },
                {
                    key: 'access',
                    label: 'Access / Target',
                    type: 'object',
                    fields: [
                        {
                            key: 'targetRelationshipUid',
                            label: 'Relationship Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'relationshipTypes',
                            required: true,
                        },
                        {
                            key: 'targetProgramUid',
                            label: 'Target Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                        },
                        {
                            key: 'targetTeiTypeUid',
                            label: 'Target TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                        },
                    ],
                },
                {
                    key: 'attributeMappings',
                    label: 'Attribute Mappings',
                    type: 'array',
                    description: 'Attributes to copy from source to related entity',
                    defaultItem: {
                        sourceAttribute: '',
                        targetAttribute: '',
                        defaultValue: '',
                    },
                    fields: [
                        {
                            key: 'sourceAttribute',
                            label: 'Source Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'targetAttribute',
                            label: 'Target Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                        },
                        {
                            key: 'defaultValue',
                            label: 'Default Value',
                            type: 'string',
                        },
                    ],
                },
                {
                    key: 'view',
                    label: 'View Attributes',
                    type: 'object',
                    fields: [
                        {
                            key: 'teiPrimaryAttribute',
                            label: 'Primary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'teiSecondaryAttribute',
                            label: 'Secondary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                        {
                            key: 'teiTertiaryAttribute',
                            label: 'Tertiary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                        },
                    ],
                },
            ],
        },
    ],
}

export const ALL_SCHEMAS = [
    workflowSchema,
    taskingSchema,
    taskProgramConfigurationSchema,
    relationshipSchema,
]

export const SCHEMA_BY_KEY = {
    workflow: workflowSchema,
    tasking: taskingSchema,
    taskProgramConfiguration: taskProgramConfigurationSchema,
    relationship: relationshipSchema,
}
