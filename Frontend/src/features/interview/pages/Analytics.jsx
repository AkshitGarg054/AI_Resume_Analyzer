import React from 'react'
import { useNavigate } from 'react-router'
import '../style/analytics.scss'

/**
 * Shown when the user visits /analytics with no report ID.
 * Option C: placeholder state — guide user to Dashboard.
 */
const Analytics = () => {
    const navigate = useNavigate()

    return (
        <div className='analytics-empty-page'>
            <div className='analytics-empty'>
                <div className='analytics-empty__icon'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                </div>
                <h1 className='analytics-empty__title'>No Report Selected</h1>
                <p className='analytics-empty__subtitle'>
                    Generate a new interview plan from the Dashboard, or browse your saved plans in the Library.
                </p>
                <div className='analytics-empty__actions'>
                    <button
                        className='analytics-empty__btn analytics-empty__btn--primary'
                        onClick={() => navigate('/dashboard')}
                        id='btn-go-dashboard'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Go to Dashboard
                    </button>
                    <button
                        className='analytics-empty__btn analytics-empty__btn--secondary'
                        onClick={() => navigate('/library')}
                        id='btn-go-library'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        Browse Library
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Analytics
