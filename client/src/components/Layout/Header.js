import React from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";
import SearchInput from "../Form/SearchInput";
import useCategory from "../../hooks/useCategory";
import { useCart } from "../../context/cart";
import { Badge } from "antd";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const categories = useCategory();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    toast.success("Logout Successfully");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg main-nav">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo01"
            aria-controls="navbarTogglerDemo01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <Link to="/" className="navbar-brand">
              📱 TechHub
            </Link>

            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item search-container">
                <SearchInput />
              </li>

              <li className="nav-item">
                <NavLink to="/" className="nav-link">
                  🏠 Home
                </NavLink>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to={"/categories"}
                  data-bs-toggle="dropdown"
                  role="button"
                >
                  🔧 Categories
                </Link>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to={"/categories"}>
                      📱 All Categories
                    </Link>
                  </li>
                  {categories?.map((c) => (
                    <li key={c._id}>
                      <Link
                        className="dropdown-item"
                        to={`/category/${c.slug}`}
                      >
                        ⚡ {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>

              {!auth?.user ? (
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link btn-auth">
                    🔑 Login / Sign Up
                  </NavLink>
                </li>
              ) : (
                <>
                  <li className="nav-item dropdown">
                    <button
                      className="nav-link dropdown-toggle user-dropdown-btn"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <div className="user-avatar">
                        {auth?.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      {auth?.user?.name?.split(' ')[0]}
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <Link
                          to={`/dashboard/${
                            auth?.user?.role === 1 ? "admin" : "user"
                          }`}
                          className="dropdown-item"
                        >
                          📊 Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={`/dashboard/user/profile`}
                          className="dropdown-item"
                        >
                          👤 Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to={`/dashboard/user/orders`}
                          className="dropdown-item"
                        >
                          📦 My Orders
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item"
                          style={{ width: '100%', textAlign: 'left' }}
                        >
                          🚪 Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              )}

              <li className="nav-item">
                <Badge count={cart?.length} showZero>
                  <div
                    className="nav-link cart-icon"
                    onClick={() => {
                      if (!auth?.token) {
                        navigate("/login", {
                          state: { from: "/cart" }
                        });
                        toast.error("Please login to view cart", {
                          duration: 3000,
                          position: "top-center"
                        });
                      } else {
                        navigate("/cart");
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    🛒
                  </div>
                </Badge>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;