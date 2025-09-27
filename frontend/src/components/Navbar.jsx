import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { LogOut, MessageSquare, User, Sun, Moon, Laptop } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="w-4 h-4" />;
    if (theme === "light") return <Sun className="w-4 h-4" />;
    return <Laptop className="w-4 h-4" />;
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">YouMeWe</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Switcher */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-sm gap-2">
                {getThemeIcon()}
                <span className="hidden sm:inline">Theme</span>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-36"
              >
                <li>
                  <a
                    onClick={() => setTheme("light")}
                    className={theme === "light" ? "active" : ""}
                  >
                    <Sun size={16} /> Light
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setTheme("dark")}
                    className={theme === "dark" ? "active" : ""}
                  >
                    <Moon size={16} /> Dark
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setTheme("system")}
                    className={theme === "system" ? "active" : ""}
                  >
                    <Laptop size={16} /> System
                  </a>
                </li>
              </ul>
            </div>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="btn btn-sm gap-2" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
