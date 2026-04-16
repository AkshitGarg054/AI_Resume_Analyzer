import React, { useState, useRef, useCallback } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const MAX_FILE_SIZE_MB = 5
const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ACCEPTED_EXT   = ['.pdf', '.docx']

// ── File validation ────────────────────────────────────────────────────────────
const validateFile = (file) => {
    if (!file) return null
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!ACCEPTED_EXT.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
        return 'Only PDF or DOCX files are accepted.'
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `File must be under ${MAX_FILE_SIZE_MB}MB.`
    }
    return null
}

const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Dropzone Component ─────────────────────────────────────────────────────────
const Dropzone = ({ resumeFile, onFileSelect, fileError }) => {
    const inputRef = useRef()
    const [dragging, setDragging] = useState(false)

    const handleFile = useCallback((file) => {
        if (file) onFileSelect(file)
    }, [onFileSelect])

    // Drag events
    const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
    const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }
    const onDrop      = (e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFile(file)
    }

    // Click triggers hidden input
    const onZoneClick = () => inputRef.current?.click()

    const onInputChange = (e) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
        // Reset so the same file can be re-selected
        e.target.value = ''
    }

    const onRemove = (e) => {
        e.stopPropagation()
        onFileSelect(null)
    }

    const hasFile = !!resumeFile

    return (
        <div
            className={`dropzone ${dragging ? 'dropzone--dragging' : ''} ${hasFile ? 'dropzone--has-file' : ''} ${fileError ? 'dropzone--error' : ''}`}
            onClick={!hasFile ? onZoneClick : undefined}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            role='button'
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && !hasFile && onZoneClick()}
            aria-label='Upload resume file'
        >
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type='file'
                id='resume'
                name='resume'
                accept='.pdf,.docx'
                hidden
                onChange={onInputChange}
            />

            {hasFile ? (
                // ── File Selected State ──
                <div className='dropzone__file'>
                    <span className='dropzone__file-icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    </span>
                    <div className='dropzone__file-info'>
                        <p className='dropzone__file-name'>{resumeFile.name}</p>
                        <p className='dropzone__file-size'>{formatBytes(resumeFile.size)}</p>
                    </div>
                    <button
                        className='dropzone__file-remove'
                        onClick={onRemove}
                        aria-label='Remove file'
                        title='Remove file'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            ) : (
                // ── Empty / Dragging State ──
                <>
                    <span className='dropzone__icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 16 12 12 8 16" />
                            <line x1="12" y1="12" x2="12" y2="21" />
                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                        </svg>
                    </span>
                    <p className='dropzone__title'>
                        {dragging ? 'Drop your resume here' : 'Click to upload or drag & drop'}
                    </p>
                    <p className='dropzone__subtitle'>PDF or DOCX · Max {MAX_FILE_SIZE_MB}MB</p>
                </>
            )}
        </div>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────────
const Home = () => {

    const { loading, generateReport } = useInterview()
    const [jobDescription,  setJobDescription]  = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [resumeFile,      setResumeFile]       = useState(null)
    const [charCount,       setCharCount]        = useState(0)
    const [fileError,       setFileError]        = useState(null)
    const [formError,       setFormError]        = useState(null)

    const navigate = useNavigate()

    const handleFileSelect = (file) => {
        setFileError(null)
        setFormError(null)

        if (file === null) {
            setResumeFile(null)
            return
        }

        const err = validateFile(file)
        if (err) {
            setFileError(err)
            setResumeFile(null)
            return
        }

        setResumeFile(file)
    }

    const handleJobDescChange = (e) => {
        setJobDescription(e.target.value)
        setCharCount(e.target.value.length)
    }

    const handleGenerateReport = async () => {
        setFormError(null)

        if (!jobDescription.trim()) {
            setFormError('Job description is required.')
            return
        }
        if (!resumeFile && !selfDescription.trim()) {
            setFormError('Please upload a resume or add a self-description.')
            return
        }

        const { data, error } = await generateReport({ jobDescription, selfDescription, resumeFile })

        if (error) {
            setFormError(error)
            return
        }

        navigate(`/analytics/${data._id}`)
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <div className='loading-screen__inner'>
                    <div className='loading-spinner' />
                    <h1>Generating your interview plan...</h1>
                    <p>Our AI is analyzing the job requirements. This takes ~30 seconds.</p>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Form Error Banner */}
            {formError && (
                <div className='form-error-banner'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {formError}
                </div>
            )}

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={handleJobDescChange}
                            value={jobDescription}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className={`char-counter ${charCount >= 4800 ? 'char-counter--warn' : ''}`}>
                            {charCount} / 5000 chars
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <Dropzone
                                resumeFile={resumeFile}
                                onFileSelect={handleFileSelect}
                                fileError={fileError}
                            />
                            {fileError && (
                                <p className='field-error'>{fileError}</p>
                            )}
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home