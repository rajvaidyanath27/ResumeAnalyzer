import axios from "axios"

const API = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API,
    withCredentials: true
})

// Add token to request headers if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle errors properly
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message)
        return Promise.reject(error)
    }
)

export async function register({ username, email, password }) {

    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        // Store token if returned
        if (response.data.token) {
            localStorage.setItem("token", response.data.token)
        }

        return response.data

    } catch (err) {
        throw err
    }

}

export async function login({ email, password }) {

    try {

        const response = await api.post("/api/auth/login", {
            email, password
        })

        // Store token if returned
        if (response.data.token) {
            localStorage.setItem("token", response.data.token)
        }

        return response.data

    } catch (err) {
        throw err
    }

}

export async function logout() {
    try {

        const response = await api.get("/api/auth/logout")

        // Clear token on logout
        localStorage.removeItem("token")

        return response.data

    } catch (err) {
        throw err
    }
}

export async function getMe() {

    try {

        const response = await api.get("/api/auth/get-me")

        return response.data

    } catch (err) {
        throw err
    }

}