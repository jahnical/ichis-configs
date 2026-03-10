/**
 * Meta-Config Schema for iCHIS Configuration App
 *
 * Field types:
 *   - 'string'        → plain text input
 *   - 'number'        → numeric input
 *   - 'boolean'       → toggle switch
 *   - 'select'        → fixed option dropdown
 *   - 'dhis2Uid'      → UID picker backed by a DHIS2 metadata resource
 *   - 'dhis2UidMulti' → multi-UID picker
 *   - 'array'         → array of objects
 *   - 'object'        → nested object
 *   - 'conditions'    → specialized condition array editor
 *
 * Extra schema props:
 *   - summaryField    → key to use as the array-item header (human-readable label)
 *   - itemLabel       → singular label for the "Add X" button
 *   - group           → groups adjacent fields under a coloured heading
 *   - groupLabel      → heading text for the group
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
    label: 'Workflow',
    description:
        'Controls program enrollment, TEI auto-creation, and auto-increment attributes.',
    sections: [
        {
            id: 'autoIncrementAttributes',
            label: 'Auto-Increment Attributes',
            description:
                'When a new tracked entity instance (TEI) is created, the system automatically assigns the next sequential number to these attributes — useful for patient IDs, case numbers, etc.',
            type: 'array',
            path: 'autoIncrementAttributes',
            itemLabel: 'Rule',
            summaryField: 'programName',
            defaultItem: { attributeUid: '', programUid: '', programName: '' },
            fields: [
                {
                    key: 'attributeUid',
                    label: 'Attribute to Auto-Increment',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                    description:
                        'This tracked entity attribute will receive the next sequential number each time a new TEI is enrolled.',
                },
                {
                    key: 'programUid',
                    label: 'In Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description:
                        'Auto-increment only applies when a TEI is enrolled in this specific program.',
                },
            ],
        },
        {
            id: 'entityAutoCreation',
            label: 'Entity Auto-Creation',
            description:
                'When someone is enrolled in the Trigger Program, the system automatically creates a linked entity in the Target Program. Use Attribute Mappings to copy data from the source TEI to the new entity.',
            type: 'array',
            path: 'entityAutoCreation',
            itemLabel: 'Rule',
            summaryField: 'triggerProgramName',
            defaultItem: {
                triggerProgram: '',
                triggerProgramName: '',
                targetProgram: '',
                targetProgramName: '',
                targetTeiType: '',
                relationshipType: '',
                attributesMappings: [],
            },
            fields: [
                {
                    key: 'triggerProgram',
                    label: 'Trigger Program',
                    group: 'trigger',
                    groupLabel: 'Trigger — when enrollment happens here...',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description:
                        'Enrolling a TEI in this program fires the auto-creation.',
                },
                {
                    key: 'targetProgram',
                    label: 'Target Program',
                    group: 'target',
                    groupLabel: '...automatically create a linked entity here',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description:
                        'A new TEI will be created and enrolled in this program.',
                },
                {
                    key: 'targetTeiType',
                    label: 'Target TEI Type',
                    group: 'target',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                    description:
                        'The tracked entity type of the newly-created entity in the target program.',
                },
                {
                    key: 'relationshipType',
                    label: 'Relationship Type',
                    group: 'target',
                    type: 'dhis2Uid',
                    dhis2Resource: 'relationshipTypes',
                    required: true,
                    description:
                        'The DHIS2 relationship type that links the original TEI to the auto-created one.',
                },
                {
                    key: 'attributesMappings',
                    label: 'Attribute Mappings',
                    type: 'array',
                    itemLabel: 'Mapping',
                    summaryField: null, // use group-based rendering instead
                    description:
                        'Each mapping copies a value from the trigger TEI into an attribute on the new target TEI. Leave "Source Attribute" empty to write a fixed constant value.',
                    defaultItem: {
                        sourceAttribute: '',
                        targetAttribute: '',
                        defaultValue: '',
                        isDuplicationKey: false,
                    },
                    fields: [
                        {
                            key: 'sourceAttribute',
                            label: 'Source Attribute (copy from)',
                            group: 'mapping',
                            groupLabel: 'Attribute Mapping',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: false,
                            description:
                                'Read the value of this attribute from the trigger TEI. Leave empty to always write the Default Value.',
                        },
                        {
                            key: 'targetAttribute',
                            label: 'Target Attribute (write into)',
                            group: 'mapping',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                            description:
                                'Write the value into this attribute on the newly-created TEI.',
                        },
                        {
                            key: 'defaultValue',
                            label: 'Default / Constant Value',
                            type: 'string',
                            description:
                                'If the source attribute is absent or empty, use this value instead. If no source attribute is set, this becomes a constant.',
                        },
                        {
                            key: 'isDuplicationKey',
                            label: 'Use as Duplication Key',
                            type: 'boolean',
                            description:
                                'If enabled, the system checks this mapping before creating — if a TEI with this target value already exists, it skips creation to avoid duplicates.',
                        },
                    ],
                },
            ],
        },
        {
            id: 'programEnrollmentControl',
            label: 'Enrollment Eligibility Rules',
            description:
                'Gates enrollment into specific programs. The system checks the specified attribute against the configured condition — if the condition is not met, the TEI cannot be enrolled.',
            type: 'array',
            path: 'programEnrollmentControl',
            itemLabel: 'Rule',
            summaryField: 'programName',
            defaultItem: {
                programUid: '',
                programName: '',
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
                    description:
                        'This eligibility rule applies when trying to enroll in this program.',
                },
                {
                    key: 'attributeUid',
                    label: 'Eligibility Attribute',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                    description:
                        'The attribute whose value is checked to determine if the TEI is eligible for enrollment.',
                },
                {
                    key: 'condition',
                    label: 'Condition',
                    type: 'select',
                    required: true,
                    description: 'How to compare the attribute value.',
                    options: [
                        { value: 'equals', label: 'Equals' },
                        {
                            value: 'between',
                            label: 'Between (comma-separated min,max)',
                        },
                        { value: 'less_than', label: 'Less Than' },
                        { value: 'greater_than', label: 'Greater Than' },
                    ],
                },
                {
                    key: 'attributeValue',
                    label: 'Expected Value',
                    type: 'string',
                    required: true,
                    description:
                        'For "Equals": the exact value required. For "Between": use "min,max" like "0.1667,5". For "Less/Greater Than": the threshold number.',
                },
            ],
        },
        {
            id: 'teiCreatablePrograms',
            label: 'Programs Where Users Can Create TEIs',
            description:
                'Only programs listed here will show the "Create new patient/TEI" option in the mobile app. Remove a program to prevent new registrations in it.',
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
    label: 'Tasking',
    description:
        'Defines automated tasks that are triggered by events and conditions in tracker programs.',
    sections: [
        {
            id: 'programTasks',
            label: 'Program Task Definitions',
            description:
                'Each entry links a source program to a set of automated tasks. Tasks are created/completed based on conditions you define.',
            type: 'array',
            path: 'programTasks',
            itemLabel: 'Program',
            summaryField: 'programName',
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
                    label: 'Source Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description:
                        'Tasks in this entry are driven by events in this tracker program.',
                },
                {
                    key: 'programName',
                    label: 'Program Name',
                    type: 'string',
                    readOnly: true,
                    description: 'Auto-populated from the selected program.',
                },
                {
                    key: 'teiView',
                    label: 'Patient Display Attributes',
                    type: 'object',
                    description:
                        'Which attributes are shown when displaying patients (TEIs) in task lists for this program.',
                    fields: [
                        {
                            key: 'teiPrimaryAttribute',
                            label: 'Primary (e.g. Full Name)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                            description:
                                'Shown as the main identifier — typically the patient name.',
                        },
                        {
                            key: 'teiSecondaryAttribute',
                            label: 'Secondary (e.g. ID Number)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Shown below the primary attribute.',
                        },
                        {
                            key: 'teiTertiaryAttribute',
                            label: 'Tertiary (e.g. Date of Birth)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description:
                                'Optional third attribute shown smaller beneath the secondary.',
                        },
                    ],
                },
                {
                    key: 'taskConfigs',
                    label: 'Task Definitions',
                    type: 'array',
                    itemLabel: 'Task',
                    summaryField: 'name',
                    description:
                        'Each task definition specifies what a task is called, when it is created (trigger conditions), and when it closes (completion conditions).',
                    defaultItem: {
                        taskTypeId: '',
                        name: '',
                        description: '',
                        priority: 'medium',
                        singleIncomplete: false,
                        anchorDate: '',
                        period: {
                            anchor: { ref: '', uid: '' },
                            dueInDays: 1,
                        },
                        trigger: { condition: [] },
                        completion: { condition: [] },
                    },
                    fields: [
                        {
                            key: 'taskTypeId',
                            label: 'Task Type',
                            group: 'identity',
                            groupLabel: 'Task Identity',
                            type: 'string',
                            required: true,
                            description: 'The option code corresponding to this task type (e.g. "ROUTINE_VISIT").',
                        },
                        {
                            key: 'name',
                            label: 'Task Name',
                            group: 'identity',
                            type: 'string',
                            required: true,
                            description: 'Short descriptive name shown to the user.',
                        },
                        {
                            key: 'description',
                            label: 'Description',
                            group: 'identity',
                            type: 'string',
                            description:
                                'Optional longer description explaining what this task requires.',
                        },
                        {
                            key: 'priority',
                            label: 'Default Priority',
                            group: 'identity',
                            type: 'select',
                            required: true,
                            description: 'Default priority level assigned to created tasks.',
                            options: [
                                { value: 'high', label: '🔴 High' },
                                { value: 'medium', label: '🟡 Medium' },
                                { value: 'low', label: '🟢 Low' },
                            ],
                        },
                        {
                            key: 'singleIncomplete',
                            label: 'Enforce Single Incomplete Task',
                            group: 'identity',
                            type: 'boolean',
                            description: 'If checked, prevents another instance of this task from being generated if one is already open.',
                        },
                        {
                            key: 'anchorDate',
                            label: 'Anchor Date',
                            group: 'identity',
                            type: 'string',
                            required: true,
                            description: 'Property or expression determining the anchor date (e.g. "enrollmentDate").',
                        },
                        {
                            key: 'period',
                            label: 'Due Date / Period',
                            type: 'object',
                            description:
                                'Determines when the task is due. The due date = anchor date + due-in-days.',
                            fields: [
                                {
                                    key: 'dueInDays',
                                    label: 'Due In (Days)',
                                    group: 'period',
                                    groupLabel: 'Due Date Calculation',
                                    type: 'number',
                                    required: true,
                                    description:
                                        'Number of days after the anchor date when the task becomes due.',
                                },
                                {
                                    key: 'anchor',
                                    label: 'Anchor Date',
                                    type: 'object',
                                    description:
                                        'The reference point for the due date calculation. Leave "Anchor Attribute" empty to use the enrollment date.',
                                    fields: [
                                        {
                                            key: 'uid',
                                            label: 'Anchor Attribute',
                                            type: 'dhis2Uid',
                                            dhis2Resource: 'trackedEntityAttributes',
                                            description:
                                                'Use this attribute\'s date as the starting point. Leave empty to use enrollment date.',
                                        },
                                        {
                                            key: 'ref',
                                            label: 'Anchor Ref',
                                            type: 'string',
                                            description:
                                                'Internal reference identifier. Leave empty for the default.',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            key: 'trigger.condition',
                            label: 'Trigger Conditions',
                            group: 'conditions',
                            groupLabel: 'Conditions',
                            type: 'condition',
                            description: 'When all conditions are met, this task will be created.',
                        },
                        {
                            key: 'completion.condition',
                            label: 'Completion Conditions',
                            group: 'conditions',
                            type: 'condition',
                            description:
                                'When all conditions are met, an open task will be closed/completed.',
                        },
                    ],
                },
            ],
        },
        {
            id: 'taskProgramConfig',
            label: 'Tasking Program Structure',
            description:
                'Maps the internal structure of the DHIS2 tasking program. Each entry tells iCHIS which data elements and attributes within the tasking program correspond to task fields like status, priority, and due date.',
            type: 'array',
            path: 'taskProgramConfig',
            itemLabel: 'Program Config',
            summaryField: 'programName',
            defaultItem: {
                programUid: '',
                programName: '',
                description: '',
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
                    group: 'identity',
                    groupLabel: 'Program Identity',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description: 'The DHIS2 program used to store tasks.',
                },
                {
                    key: 'programName',
                    label: 'Program Name',
                    group: 'identity',
                    type: 'string',
                    readOnly: true,
                    description: 'Auto-populated.',
                },
                {
                    key: 'description',
                    label: 'Description',
                    group: 'identity',
                    type: 'string',
                    description: 'Optional description for this global tasking program mapping.',
                },
                {
                    key: 'teiTypeUid',
                    label: 'TEI Type',
                    group: 'identity',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                    description: 'Tracked entity type used to represent a task.',
                },
                {
                    key: 'taskNameUid',
                    label: 'Task Name',
                    group: 'task_fields',
                    groupLabel: 'Task Data Elements',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description: 'Data element that stores the task\'s name/title.',
                },
                {
                    key: 'statusUid',
                    label: 'Status',
                    group: 'task_fields',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description: 'Data element that stores the task\'s current status (e.g. Open, Closed).',
                },
                {
                    key: 'priorityUid',
                    label: 'Priority',
                    group: 'task_fields',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description: 'Data element that stores the task\'s priority (e.g. High, Medium, Low).',
                },
                {
                    key: 'dueDateUid',
                    label: 'Due Date',
                    group: 'task_fields',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description: 'Data element that stores when the task is due.',
                },
                {
                    key: 'taskProgressUid',
                    label: 'Progress',
                    group: 'task_fields',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description: 'Data element that tracks completion progress.',
                },
                {
                    key: 'taskPrimaryAttrUid',
                    label: 'Primary Display Attribute',
                    group: 'display',
                    groupLabel: 'Task Display Attributes',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    description: 'Main attribute shown when listing tasks (e.g. task name).',
                },
                {
                    key: 'taskSecondaryAttrUid',
                    label: 'Secondary Display Attribute',
                    group: 'display',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    description: 'Secondary attribute shown in task list rows.',
                },
                {
                    key: 'taskTertiaryAttrUid',
                    label: 'Tertiary Display Attribute',
                    group: 'display',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    description: 'Optional third attribute shown in task list rows.',
                },
                {
                    key: 'taskSourceProgramUid',
                    label: 'Source Program',
                    group: 'tracking',
                    groupLabel: 'Source Tracking Data Elements',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description:
                        'Stores the UID of the source program that generated this task — used to navigate back to the patient\'s record.',
                },
                {
                    key: 'taskSourceEnrollmentUid',
                    label: 'Source Enrollment',
                    group: 'tracking',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description:
                        'Stores the UID of the specific enrollment in the source program that triggered this task.',
                },
                {
                    key: 'taskSourceEventUid',
                    label: 'Source Event',
                    group: 'tracking',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description:
                        'Stores the UID of the event that triggered this task, if applicable.',
                },
                {
                    key: 'taskSourceTeiUid',
                    label: 'Source Patient (TEI)',
                    group: 'tracking',
                    type: 'dhis2Uid',
                    dhis2Resource: 'dataElements',
                    description:
                        'Stores the UID of the tracked entity (patient) that this task belongs to.',
                },
            ],
        },
    ],
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK PROGRAM CONFIGURATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
export const taskProgramConfigurationSchema = {
    key: 'taskProgramConfigs',
    label: 'Task Program Configuration',
    description:
        'Global configuration for the tasking system: option sets, tracked entity types, and program-level mappings.',
    sections: [
        {
            id: 'optionSets',
            label: 'Task Option Sets',
            description:
                'These option sets power the dropdowns used throughout the tasking system. Select the correct option set for each purpose.',
            type: 'object',
            path: 'optionSets',
            fields: [
                {
                    key: 'priority',
                    label: 'Priority Option Set',
                    type: 'object',
                    description: 'Options available for task priority (e.g. High, Medium, Low).',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            description: 'The DHIS2 option set that defines priority levels.',
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
                    description: 'Options available for task status (e.g. Open, In Progress, Closed).',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            description: 'The DHIS2 option set that defines task status values.',
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
                    label: 'Task Type Option Set',
                    type: 'object',
                    description: 'Options available for categorising the type/category of a task.',
                    fields: [
                        {
                            key: 'id',
                            label: 'Option Set',
                            type: 'dhis2Uid',
                            dhis2Resource: 'optionSets',
                            description: 'The DHIS2 option set defining task types.',
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
            description:
                'Register the tracked entity types used in the tasking system. These are referenced by other parts of the configuration.',
            type: 'array',
            path: 'trackedEntityTypes',
            itemLabel: 'Type',
            summaryField: 'name',
            defaultItem: { id: '', name: '', code: '' },
            fields: [
                {
                    key: 'id',
                    label: 'Tracked Entity Type',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    required: true,
                    description: 'Select the tracked entity type from DHIS2.',
                },
                {
                    key: 'name',
                    label: 'Name',
                    type: 'string',
                    readOnly: true,
                    description: 'Auto-populated from DHIS2.',
                },
                {
                    key: 'code',
                    label: 'Internal Code',
                    type: 'string',
                    description:
                        'Optional short code used internally for this type (e.g. "TASK", "PATIENT").',
                },
            ],
        },
        {
            id: 'trackedEntityAttributes',
            label: 'Default TEI Display Attributes',
            description:
                'Defines which attributes are shown by default when displaying patients in task-related views. Individual programs can override these in the Tasking section.',
            type: 'array',
            path: 'trackedEntityAttributes',
            itemLabel: 'Attribute Set',
            summaryField: null,
            defaultItem: {
                teiPrimaryAttribute: '',
                teiSecondaryAttribute: '',
                teiTertiaryAttribute: '',
            },
            fields: [
                {
                    key: 'teiPrimaryAttribute',
                    label: 'Primary Attribute (e.g. Full Name)',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    required: true,
                    description:
                        'The most prominent attribute — shown as the patient\'s main identifier.',
                },
                {
                    key: 'teiSecondaryAttribute',
                    label: 'Secondary Attribute (e.g. ID Number)',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    description: 'Shown below the primary attribute in list views.',
                },
                {
                    key: 'teiTertiaryAttribute',
                    label: 'Tertiary Attribute (e.g. Date of Birth)',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityAttributes',
                    description:
                        'Optional third attribute shown in smaller text beneath the secondary.',
                },
            ],
        },
        {
            id: 'taskProgramConfigs',
            label: 'Task Program Mappings',
            description:
                'Per-program settings for the tasking program. Configure which DHIS2 program represents tasks and map its option sets and TEI types.',
            type: 'array',
            path: 'taskProgramConfigs',
            itemLabel: 'Mapping',
            summaryField: 'programName',
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
                    label: 'Tasking Program',
                    type: 'dhis2Uid',
                    dhis2Resource: 'programs',
                    required: true,
                    description:
                        'The DHIS2 program used to store and manage tasks in this context.',
                },
                {
                    key: 'programName',
                    label: 'Program Name',
                    type: 'string',
                    readOnly: true,
                    description: 'Auto-populated from the selected program.',
                },
                {
                    key: 'teiTypeUid',
                    label: 'TEI Type for Tasks',
                    type: 'dhis2Uid',
                    dhis2Resource: 'trackedEntityTypes',
                    description:
                        'The tracked entity type used to represent individual tasks in this program.',
                },
                {
                    key: 'statusOptionSetUid',
                    label: 'Status Option Set',
                    type: 'dhis2Uid',
                    dhis2Resource: 'optionSets',
                    description:
                        'The option set providing valid status values (e.g. Open, Closed) for tasks in this program.',
                },
            ],
        },
        {
            id: 'relationships',
            label: 'Program Relationships',
            description:
                'Defines how the tasking program links to source programs — which relationship type to use and what data to display from the related TEI.',
            type: 'array',
            path: 'relationships',
            itemLabel: 'Relationship',
            summaryField: 'description',
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
                    label: 'Relationship Name',
                    type: 'string',
                    required: true,
                    description: 'A clear human-readable label for this relationship, e.g. "Patient → Household Visit Task".',
                },
                {
                    key: 'sourceProgram',
                    label: 'Source Program',
                    type: 'object',
                    description: 'The program where the original patient/TEI lives.',
                    fields: [
                        {
                            key: 'sourceProgramUid',
                            label: 'Source Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            required: true,
                            description: 'Program that is the origin of this relationship.',
                        },
                        {
                            key: 'sourceTeiTypeUid',
                            label: 'Source TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            description: 'Tracked entity type of the source TEI.',
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
                    label: 'Source TEI Display Attributes',
                    type: 'object',
                    description:
                        'Which attributes of the source TEI to show when displaying this relationship in task views.',
                    fields: [
                        {
                            key: 'sourceTeiPrimaryAttribute',
                            label: 'Primary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Main identifier of the source patient, e.g. full name.',
                        },
                        {
                            key: 'SourceTeiSecondaryAttribute',
                            label: 'Secondary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Second identifier, e.g. ID number.',
                        },
                        {
                            key: 'sourceTeiTertiaryAttribute',
                            label: 'Tertiary Attribute',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Optional third attribute, e.g. date of birth.',
                        },
                    ],
                },
                {
                    key: 'access',
                    label: 'Linked Target',
                    type: 'object',
                    description:
                        'Where this relationship points to in DHIS2 — the target program, TEI type, and relationship definition.',
                    fields: [
                        {
                            key: 'targetRelationshipUid',
                            label: 'Relationship Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'relationshipTypes',
                            required: true,
                            description: 'The DHIS2 relationship type definition linking the two TEIs.',
                        },
                        {
                            key: 'targetProgramUid',
                            label: 'Target Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            description: 'The program the linked (target) TEI is enrolled in.',
                        },
                        {
                            key: 'targetTeiTypeUid',
                            label: 'Target TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            description: 'Tracked entity type of the target (linked) entity.',
                        },
                        {
                            key: 'targetProgramStageUid',
                            label: 'Target Program Stage',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programStages',
                            description: 'If narrowing to a specific stage in the target program, select it here.',
                        },
                        {
                            key: 'targetDataElement',
                            label: 'Target Data Element(s)',
                            type: 'string',
                            description:
                                'UID or comma-separated UIDs of data elements used to link the relationship at the event level.',
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
    key: 'relationships',
    label: 'Relationships',
    description:
        'Defines how programs are related to each other and how that relationship is displayed in the mobile app.',
    sections: [
        {
            id: 'relationships',
            label: 'Program Relationships',
            description:
                'Each entry defines a relationship between two programs: which DHIS2 relationship type links them, what attributes to show from the related patient, and how many related entities are allowed.',
            type: 'array',
            path: 'relationships',
            itemLabel: 'Relationship',
            summaryField: 'description',
            defaultItem: {
                description: '',
                maxCount: null,
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
                    label: 'Relationship Name',
                    type: 'string',
                    required: true,
                    description:
                        'A human-readable label shown in the app, e.g. "Household Members" or "Referred To Facility".',
                },
                {
                    key: 'maxCount',
                    label: 'Maximum Related Entities',
                    type: 'number',
                    description:
                        'Cap on how many entities can be linked via this relationship. Leave empty for unlimited.',
                },
                {
                    key: 'relatedProgram',
                    label: 'Related Program',
                    type: 'object',
                    description: 'The program that the current patient will be linked to.',
                    fields: [
                        {
                            key: 'programUid',
                            label: 'Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            required: true,
                            description: 'The DHIS2 program that contains the related entities (e.g. the household program).',
                        },
                        {
                            key: 'teiTypeUid',
                            label: 'TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            description: "Tracked entity type of the related program's TEIs.",
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
                    label: 'Relationship Linking',
                    type: 'object',
                    description: 'The DHIS2 relationship type and target program configuration.',
                    fields: [
                        {
                            key: 'targetRelationshipUid',
                            label: 'Relationship Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'relationshipTypes',
                            required: true,
                            description: 'The DHIS2 relationship type that officially connects the two TEIs.',
                        },
                        {
                            key: 'targetProgramUid',
                            label: 'Target Program',
                            type: 'dhis2Uid',
                            dhis2Resource: 'programs',
                            description: 'Program where the linked (target) entity should be enrolled.',
                        },
                        {
                            key: 'targetTeiTypeUid',
                            label: 'Target TEI Type',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityTypes',
                            description: 'Tracked entity type of the target entity.',
                        },
                    ],
                },
                {
                    key: 'attributeMappings',
                    label: 'Attribute Mappings',
                    type: 'array',
                    itemLabel: 'Mapping',
                    summaryField: null,
                    description:
                        'When creating a new related entity, copy attribute values from the current patient to the new one. Leave "Source Attribute" empty to write a fixed constant.',
                    defaultItem: {
                        sourceAttribute: '',
                        targetAttribute: '',
                        defaultValue: '',
                    },
                    fields: [
                        {
                            key: 'sourceAttribute',
                            label: 'Copy From (Source Attribute)',
                            group: 'mapping',
                            groupLabel: 'Attribute Mapping',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description:
                                "Read this attribute's value from the current patient.",
                        },
                        {
                            key: 'targetAttribute',
                            label: 'Write Into (Target Attribute)',
                            group: 'mapping',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            required: true,
                            description:
                                'Store the copied value in this attribute on the related entity.',
                        },
                        {
                            key: 'defaultValue',
                            label: 'Default / Constant Value',
                            type: 'string',
                            description:
                                'Used when the source is absent, or as a constant if no source is set.',
                        },
                    ],
                },
                {
                    key: 'view',
                    label: 'Display Attributes',
                    type: 'object',
                    description:
                        'Which attributes of the related entity to show in the relationship panel in the app.',
                    fields: [
                        {
                            key: 'teiPrimaryAttribute',
                            label: 'Primary (e.g. Full Name)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Main identifier shown in the relationship card.',
                        },
                        {
                            key: 'teiSecondaryAttribute',
                            label: 'Secondary (e.g. ID)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Second attribute shown beneath the primary.',
                        },
                        {
                            key: 'teiTertiaryAttribute',
                            label: 'Tertiary (e.g. Age)',
                            type: 'dhis2Uid',
                            dhis2Resource: 'trackedEntityAttributes',
                            description: 'Optional third attribute shown in smaller text.',
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
    taskProgramConfigs: taskProgramConfigurationSchema,
    relationships: relationshipSchema,
}
