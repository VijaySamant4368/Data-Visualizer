import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc";

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
             window.location.href = "/"
        }
    }, []);

    const [form, setForm] = useState({ email: "", password: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await fetch(BACKEND_URL+"/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })

        if (res.ok) {
            const { access_token } = await res.json()
            localStorage.setItem("token", access_token)
             window.location.href = "/"
        } else {
            const error = await res.json()
            toast(error.detail || "Login failed", "error")
        }
        setLoading(false)
    }

    return (
         <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          required
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className={`auth-button ${loading ? "disabled" : ""}`}>{loading ? "Logging in..." : "Log In"}</button>
      </form>
    </div>
    )
}
