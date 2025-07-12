import { useRouter } from "next/router"

export default function LogoutButton() {
    const router = useRouter()

        const handleLogout = () => {
            localStorage.removeItem("token");
            window.location.href = "/login"; // triggers full page reload (So that nav bar also rerenders)
        }

    return (
        <button onClick={handleLogout} className="logout-btn">
            Logout
        </button>
    )
}
