import { useState } from "react";
import api, { setAuthToken } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const register = async () => {
        if (!username.trim() || !password.trim()) {
            alert("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/Auth/register", {
                username,
                password,
            });

            const token = res.data.token;
            const role = res.data.user.role;

            // Save token & role
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            setAuthToken(token);

            alert("Registered successfully!");

            // Redirect based on role
            if (role === "Admin") navigate("/admin");
            else navigate("/products"); // or user home page
        } catch (err) {
            console.error(err);
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg p-4" style={{ width: "380px" }}>
                <h2 className="mb-3">Create an Account</h2>

                <input
                    className="form-control mb-2"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    className="form-control mb-3"
                    type="password"
                    placeholder="Confirm Password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    className="btn btn-primary w-100"
                    onClick={register}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                <div className="mt-3 text-center">
                    <small>
                        Already have an account?{" "}
                        <Link to="/">Login</Link>
                    </small>
                </div>
            </div>
        </div>
    );
}
