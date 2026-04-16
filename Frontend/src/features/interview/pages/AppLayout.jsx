import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import '../style/AppLayout.scss'

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
)

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)

const LibraryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
)

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const AppLayout = () => {
    const { handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    const getTabClass = ({ isActive }) =>
        `app-navbar__tab ${isActive ? 'app-navbar__tab--active' : ''}`

    // Analytics should be active for /analytics and /analytics/:id
    const getAnalyticsClass = ({ isActive, location }) => {
        const active = isActive || (location?.pathname?.startsWith('/analytics'))
        return `app-navbar__tab ${active ? 'app-navbar__tab--active' : ''}`
    }

    return (
        <div className='app-shell'>
            <nav className='app-navbar'>

                {/* Brand */}
                <NavLink to='/dashboard' className='app-navbar__brand'>
                    <span className='app-navbar__brand-name'>
                        Interview<span>AI</span>
                    </span>
                </NavLink>

                {/* Tab Pills */}
                <div className='app-navbar__tabs'>
                    <NavLink to='/dashboard' className={getTabClass} id='tab-dashboard'>
                        <DashboardIcon />
                        Dashboard
                    </NavLink>
                    <NavLink to='/analytics' className={getAnalyticsClass} id='tab-analytics' end={false}>
                        <AnalyticsIcon />
                        Analytics
                    </NavLink>
                    <NavLink to='/library' className={getTabClass} id='tab-library'>
                        <LibraryIcon />
                        Library
                    </NavLink>
                </div>

                {/* Actions */}
                <div className='app-navbar__actions'>
                    <button
                        className='app-navbar__logout'
                        onClick={onLogout}
                        id='btn-logout'
                    >
                        <LogoutIcon />
                        Logout
                    </button>
                </div>

            </nav>

            <div className='app-content'>
                <Outlet />
            </div>
        </div>
    )
}

export default AppLayout
