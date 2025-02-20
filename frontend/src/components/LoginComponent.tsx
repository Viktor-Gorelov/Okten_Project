import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";

const LoginComponent = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const validateForm = (): boolean => {
        if (!email.trim()) {
            setError('Email is required.');
            return false;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Invalid email format.');
            return false;
        }
        if (email.length < 8) {
            setError('Email must be at least 8 characters long.');
            return false;
        }


        if (!password.trim()) {
            setError('Password is required.');
            return false;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return false;
        }

        setError('');
        return true;
    };
    const handleLogin = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (!response.ok) {
                throw new Error('Login failed!');
            }

            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            navigate("/orders");
        } catch (err) {
            setError('Login failed! User is banned.');
        }
    };

    return (
        <div className='login_page'>
            <div className='login_card'>
                <div className='login_info'>
                    <form id='login' onSubmit={handleLogin}>
                        <div className='login_text'>
                            <label htmlFor='email'>Email</label>
                            <input type='text' id='email' name='email' placeholder='Email' value={email}
                                   onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className='login_text'>
                            <label htmlFor='password'>Password</label>
                            <input type='password' id='password' name='password' placeholder='Password' value={password}
                                   onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <button type='submit' className='login_button' form='login'>LOGIN</button>
                    </form>
                    {error && <p>{error}</p>}
                </div>
            </div>
        </div>
    )
};

export default LoginComponent;