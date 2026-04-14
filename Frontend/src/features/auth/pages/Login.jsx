import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    // ✅ FIX 1: redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            navigate("/")
        }
    }, [navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            await handleLogin({ email, password })

            // ✅ FIX 2: redirect ONLY here
            navigate("/")

        } catch (err) {
            // ✅ FIX 3: correct error handling
            setError(err?.message || "Login failed")
        }
    }

    if (loading) {
        return (<main><h1>Loading.......</h1></main>)
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {error && (
                    <p style={{ color: '#ff3333', marginBottom: '1rem' }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}   // ✅ FIX 4
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name='email'
                            placeholder='Enter email address'
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}   // ✅ FIX 4
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name='password'
                            placeholder='Enter password'
                        />
                    </div>

                    <button
                        className='button primary-button'
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p>
                    Don't have an account? <Link to={"/register"}>Register</Link>
                </p>
            </div>
        </main>
    )
}

export default Login