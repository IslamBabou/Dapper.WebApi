import { Link, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <div className="bg-dark text-white d-flex flex-column p-4"
            style={{ width: "260px", minHeight: "100vh" }}>

            <div>
                <h3>Admin Panel</h3>
                <hr />

                <ul className="nav flex-column">

                    <li className="nav-item mb-2">
                        <Link className="nav-link text-white" to="/admin/users">
                            Manage Users
                        </Link>
                    </li>

                    <li className="nav-item mb-2">
                        <Link className="nav-link text-white" to="/admin/products">
                            Manage Products
                        </Link>
                    </li>

                    <li className="nav-item mb-2">
                        <Link className="nav-link text-white" to="/admin/admins">
                            Manage Admins
                        </Link>
                    </li>

                </ul>
            </div>

            {/* --- Logout Button at Bottom --- */}
            <button
                className="btn btn-danger mt-auto"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
}