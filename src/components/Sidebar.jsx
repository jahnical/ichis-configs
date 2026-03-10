import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Menu,
    MenuItem,
    MenuDivider,
    MenuSectionHeader,
    IconApps16,
    IconSettings16,
    IconList16,
    IconLink16,
} from '@dhis2/ui'

const NAV_ITEMS = [
    {
        path: '/',
        label: 'Dashboard',
        icon: <IconApps16 />,
        exact: true,
    },
    {
        path: '/workflow',
        label: 'Workflow',
        icon: <IconSettings16 />,
    },
    {
        path: '/tasking',
        label: 'Tasking',
        icon: <IconList16 />,
    },
    {
        path: '/task-program-config',
        label: 'Task Program Config',
        icon: <IconSettings16 />,
    },
    {
        path: '/relationships',
        label: 'Relationships',
        icon: <IconLink16 />,
    },
]

export function Sidebar() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <div
            style={{
                width: '220px',
                minWidth: '220px',
                borderRight: '1px solid #e8edf2',
                background: '#fff',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* App branding */}
            <div
                style={{
                    padding: '16px 16px 12px',
                    borderBottom: '1px solid #e8edf2',
                }}
            >
                <div
                    style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#212934',
                    }}
                >
                    iCHIS Config
                </div>
                <div style={{ fontSize: '12px', color: '#6c7787', marginTop: '2px' }}>
                    community_redesign
                </div>
            </div>

            {/* Navigation */}
            <Menu dense>
                <MenuSectionHeader label="Configuration" hideDivider />
                {NAV_ITEMS.map((item) => {
                    const isActive = item.exact
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path)

                    return (
                        <MenuItem
                            key={item.path}
                            label={item.label}
                            icon={item.icon}
                            active={isActive}
                            onClick={() => navigate(item.path)}
                        />
                    )
                })}
            </Menu>
        </div>
    )
}

export default Sidebar
