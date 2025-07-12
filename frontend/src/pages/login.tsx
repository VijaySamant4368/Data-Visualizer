import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc";

export default function LoginPage() {

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/"); // or /dashboard
        }
    }, []);

    const [form, setForm] = useState({ email: "", password: "" })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch(BACKEND_URL+"/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })

        if (res.ok) {
            const { access_token } = await res.json()
            localStorage.setItem("token", access_token)
            router.push("/")
        } else {
            const error = await res.json()
            toast(error.detail || "Login failed", "error")
        }
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

        <button type="submit" className="auth-button">Log In</button>
      </form>
    </div>
    )
}
