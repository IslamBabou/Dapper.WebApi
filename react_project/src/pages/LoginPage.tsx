import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../services/api";
import type { LoginResponse } from "../types/LoginResponse";


export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const login = async () => {
        try {
            const res = await api.post<LoginResponse>("/Auth/login", {
                username,
                password,
            });

            const { token, role } = res.data;

            setAuthToken(token);
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            alert("Logged in as: " + role);

            // Redirect based on role
            if (role === "Admin") {
                navigate("/admin");
            } else {
                navigate("/products"); // user home page
            }

        } catch {
            alert("Login failed");
        }
    };

    return (
        <div className="p-3">
            <h2>Login</h2>
            <input
                className="form-control mb-2"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                className="form-control mb-2"
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary" onClick={login}>
                Login
            </button>
        </div>
    );
}
