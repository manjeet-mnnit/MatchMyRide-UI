import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/useUser.js";
import { LogOut } from "lucide-react";

export default function HomeHeader() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get user initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="home-header">
      <div className="home-header-box">
        <div className="home-header__left">
          <div className="home-header__logo">
            <img src="/logo.png" alt="logo" />
          </div>
          <span className="home-header__brand">Match My Ride</span>
        </div>

        <div className="home-header__right">
          <button
            className="home-header__logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
          <div className="home-header__avatar">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="home-header__avatar-img"
              />
            ) : (
              <span className="home-header__avatar-initials">
                {getInitials(user?.fullName)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
