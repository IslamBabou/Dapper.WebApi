import { Link } from "react-router-dom";

export default function AdminSidebar() {
    return (
        <div className="bg-dark text-white p-4"
            style={{ width: "260px", minHeight: "100vh" }}>

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
    );
}
