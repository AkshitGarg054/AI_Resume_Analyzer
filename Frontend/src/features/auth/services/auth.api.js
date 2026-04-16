import axios from "axios"


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

/**
 * Extracts a clean, user-facing error message from an Axios error.
 * Falls back to a generic message so nothing ever silently fails.
 */
function extractErrorMessage(err, fallback = "Something went wrong. Please try again.") {
    return err?.response?.data?.message || err?.message || fallback
}

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Registration failed. Please try again."))
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })
        return response.data
    } catch (err) {
        throw new Error(extractErrorMessage(err, "Login failed. Please check your credentials."))
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data
    } catch (err) {
        // Logout failure is non-critical — resolve silently
        console.warn("Logout request failed:", err?.message)
        return null
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data
    } catch (err) {
        // 401 is expected when not logged in — don't throw
        if (err?.response?.status === 401) return null
        throw new Error(extractErrorMessage(err, "Failed to fetch user session."))
    }
}