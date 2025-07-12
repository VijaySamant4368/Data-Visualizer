import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { toast } from "@/utils/toast"
import { BACKEND_URL } from "@/utils/etc";

export default function SignupPage() {

    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/"); // or /dashboard
        }
    }, [router]);


    const [form, setForm] = useState({ email: "", username: "", password: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch(BACKEND_URL+"/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })

        if (res.ok) {
            const response = await res.json()
            localStorage.setItem("token", response.access_token)
            
            toast("Signup successful!", "success")
            router.push("/")
        } else {
            const error = await res.json()
            toast(error.detail || "Signup failed", "error")
        }
    }

    return (
         <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create an Account</h1>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
        />

        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          required
          value={form.username}
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

        <button type="submit" className="auth-button">Sign Up</button>
      </form>
    </div>
    )
}
