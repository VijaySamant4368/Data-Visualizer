import Link from "next/link";
import { useRouter } from "next/router";
import LogoutButton from "./Logout";
import Toast from "./Toast";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { pathname } = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

  return (
   <>
    <header className="site-header">
        <nav className="navbar">
          <div className="logo">Data-Visualizer</div>
          <div className="nav-links">
            {isLoggedIn ? (
                <>
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <NavLink href="/plot" active={pathname.startsWith("/plot") && pathname !== "/"}>Upload</NavLink>
                <LogoutButton />
              </>
            ) : (
                <>
                <NavLink href="/login" active={pathname === "/login"}>Login</NavLink>
                <NavLink href="/signup" active={pathname === "/signup"}>Sign Up</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="main-content">{children}</main>
      <Toast />
    </> 

  );
}


function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link href={href}
        className={`nav-link ${active ? "active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        {children}
    </Link>
  );
}