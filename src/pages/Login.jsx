import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { post } from '../services/endPoints';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await post('/api/v1/users/login', {
                email,
                password,
            }, {
                withCredentials: true,
            });

            if (response.data.success) {
                const { _id: userId, role } = response.data.user;
                localStorage.setItem("userId", userId);
                setSuccessMessage('Login successful!');
                if (role === "Admin") {
                    navigate('/dashboard');
                } else {
                    navigate('/home-page');
                }
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <p className="redirect-link">
                    Not a user? <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
