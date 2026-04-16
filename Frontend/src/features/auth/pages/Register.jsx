import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import '../auth.form.scss'

// ── Icons ─────────────────────────────────────────────────────────────────────
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
)

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.44-4.54 2.5 2.5 0 0 1 0-3 2.5 2.5 0 0 1 .68-4.96A2.5 2.5 0 0 1 9.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.44-4.54 2.5 2.5 0 0 0 0-3 2.5 2.5 0 0 0-.68-4.96A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────
const Register = () => {
    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [confirm,  setConfirm]  = useState('')
    const [error,    setError]    = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all fields.')
            return
        }
        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }

        try {
            const result = await handleRegister({ username, email, password })
            if (result.success) {
                navigate('/dashboard')
            } else {
                setError(result.message || 'Registration failed. Please try again.')
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className='auth-loading'>
                <div className='auth-loading__inner'>
                    <div className='auth-spinner' />
                    <p>Creating your account...</p>
                </div>
            </div>
        )
    }

    return (
        <main className='auth-page'>
            <div className='auth-wrapper'>

                {/* Brand */}
                <div className='auth-brand'>
                    <div className='auth-brand__logo'>
                        <BrainIcon />
                    </div>
                    <h1 className='auth-brand__name'>Interview<span>AI</span></h1>
                    <p className='auth-brand__tagline'>Master your next career move</p>
                </div>

                {/* Card */}
                <div className='auth-card'>
                    <div className='auth-card__heading'>
                        <h2>Create account</h2>
                        <p>Start your AI-powered interview preparation today.</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className='auth-error-banner'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className='auth-form' onSubmit={handleSubmit} noValidate>

                        {/* Username */}
                        <div className='auth-field'>
                            <div className='auth-field__label-row'>
                                <label className='auth-field__label' htmlFor='reg-username'>Username</label>
                            </div>
                            <div className='auth-field__input-wrap'>
                                <UserIcon />
                                <input
                                    className='auth-field__input'
                                    id='reg-username'
                                    type='text'
                                    name='username'
                                    placeholder='johndoe'
                                    autoComplete='username'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className='auth-field'>
                            <div className='auth-field__label-row'>
                                <label className='auth-field__label' htmlFor='reg-email'>Email Address</label>
                            </div>
                            <div className='auth-field__input-wrap'>
                                <EmailIcon />
                                <input
                                    className='auth-field__input'
                                    id='reg-email'
                                    type='email'
                                    name='email'
                                    placeholder='name@example.com'
                                    autoComplete='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className='auth-field'>
                            <div className='auth-field__label-row'>
                                <label className='auth-field__label' htmlFor='reg-password'>Password</label>
                            </div>
                            <div className='auth-field__input-wrap'>
                                <LockIcon />
                                <input
                                    className='auth-field__input'
                                    id='reg-password'
                                    type='password'
                                    name='password'
                                    placeholder='Min. 6 characters'
                                    autoComplete='new-password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className={`auth-field ${confirm && confirm !== password ? 'auth-field--error' : ''}`}>
                            <div className='auth-field__label-row'>
                                <label className='auth-field__label' htmlFor='reg-confirm'>Confirm Password</label>
                            </div>
                            <div className='auth-field__input-wrap'>
                                <LockIcon />
                                <input
                                    className='auth-field__input'
                                    id='reg-confirm'
                                    type='password'
                                    name='confirm'
                                    placeholder='Re-enter your password'
                                    autoComplete='new-password'
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </div>
                            {confirm && confirm !== password && (
                                <p className='auth-field__error'>Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type='submit'
                            className='auth-submit'
                            id='btn-register'
                            disabled={loading}
                        >
                            Create Account
                            <ArrowIcon />
                        </button>

                    </form>
                </div>

                {/* Footer */}
                <p className='auth-footer'>
                    Already have an account?&nbsp;
                    <Link to='/login'>Sign in</Link>
                </p>

            </div>
        </main>
    )
}

export default Register