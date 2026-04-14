import axios from "axios"

const API = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API,
    timeout: 10000,
})

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")

        if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR (FIXED)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.response?.data ||
            error.message

        // ✅ FIX: avoid redirect loop
        if (
            error.response?.status === 401 &&
            window.location.pathname !== "/login"
        ) {
            localStorage.removeItem("token")
            window.location.href = "/login"
        }

        // ✅ FIX: don't return string
        return Promise.reject({
            message,
            status: error.response?.status,
        })
    }
)


// ================= AUTH FUNCTIONS =================

// REGISTER
export async function register(data) {
    const res = await api.post("/api/auth/register", data)

    if (res.data?.token) {
        localStorage.setItem("token", res.data.token)
    }

    return res.data
}


// LOGIN
export async function login(data) {
    const res = await api.post("/api/auth/login", data)

    if (res.data?.token) {
        localStorage.setItem("token", res.data.token)
    }

    return res.data
}


// LOGOUT
export async function logout() {
    localStorage.removeItem("token")
    window.location.href = "/login"
}


// ✅ FIXED (IMPORTANT)
export async function getMe() {
    const res = await api.get("/api/auth/get-me")
    return res.data
}