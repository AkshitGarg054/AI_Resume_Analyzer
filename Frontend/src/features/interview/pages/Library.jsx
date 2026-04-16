import React, { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import '../style/library.scss'

const EmptyLibrary = () => (
    <div className='library-empty'>
        <div className='library-empty__icon'>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        </div>
        <h2 className='library-empty__title'>No interview plans yet</h2>
        <p className='library-empty__subtitle'>Head over to the Dashboard to generate your first AI-powered interview strategy.</p>
    </div>
)

const ScoreBadge = ({ score }) => {
    const cls = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'
    const label = score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Match' : 'Needs Work'
    return (
        <span className={`library-card__score library-card__score--${cls}`}>
            {score}% · {label}
        </span>
    )
}

const Library = () => {
    const { reports, loading, getReports } = useInterview()
    const navigate = useNavigate()

    useEffect(() => {
        getReports()
    }, [])

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your library...</h1>
            </main>
        )
    }

    return (
        <div className='library-page'>

            {/* Page Header */}
            <header className='library-header'>
                <div>
                    <h1 className='library-header__title'>Interview Library</h1>
                    <p className='library-header__subtitle'>All your AI-generated interview plans in one place.</p>
                </div>
                <span className='library-header__count'>{reports.length} {reports.length === 1 ? 'plan' : 'plans'}</span>
            </header>

            {/* Content */}
            {reports.length === 0 ? (
                <EmptyLibrary />
            ) : (
                <div className='library-grid'>
                    {reports.map(report => (
                        <article
                            key={report._id}
                            className='library-card'
                            onClick={() => navigate(`/analytics/${report._id}`)}
                            role='button'
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/analytics/${report._id}`)}
                        >
                            <div className='library-card__top'>
                                <div className='library-card__icon'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <span className='library-card__arrow'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            </div>

                            <h3 className='library-card__title'>{report.title || 'Untitled Position'}</h3>

                            <div className='library-card__meta'>
                                <span className='library-card__date'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <ScoreBadge score={report.matchScore} />
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Library
