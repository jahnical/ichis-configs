import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    IconApps16,
    IconSettings16,
    IconList16,
    IconLink16,
    IconArrowRight16,
} from '@dhis2/ui'
import styles from './Sidebar.module.css'

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
        description: 'Enrollment control & auto-creation',
    },
    {
        path: '/tasking',
        label: 'Tasking',
        icon: <IconList16 />,
        description: 'Program tasks & conditions',
    },
    {
        path: '/task-program-config',
        label: 'Task Program Config',
        icon: <IconSettings16 />,
        description: 'Option sets, relationships & types',
    },
    {
        path: '/relationships',
        label: 'Relationships',
        icon: <IconLink16 />,
        description: 'Program relationship definitions',
    },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <nav className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.brandIcon}>iC</div>
                <div className={styles.brandText}>
                    <span className={styles.brandName}>iCHIS</span>
                    <span className={styles.brandSub}>Config Manager</span>
                </div>
            </div>

            <div className={styles.section}>
                <span className={styles.sectionLabel}>Configuration</span>
                {NAV_ITEMS.map((item) => {
                    const isActive =
                        item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path)

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                            {isActive && (
                                <span className={styles.navArrow}>
                                    <IconArrowRight16 />
                                </span>
                            )}
                        </NavLink>
                    )
                })}
            </div>

            <div className={styles.footer}>
                <div className={styles.footerInfo}>
                    <span className={styles.namespace}>community_redesign</span>
                    <span className={styles.namespaceLabel}>Datastore Namespace</span>
                </div>
            </div>
        </nav>
    )
}

export default Sidebar
