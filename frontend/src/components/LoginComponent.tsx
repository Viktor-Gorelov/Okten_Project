import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";

const LoginComponent = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        setError('');

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password: password }),
            });

            if (!response.ok) {
                throw new Error('Login failed!');
            }

            const data = await response.json();
            console.log('Tokens:', data);
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            navigate("/orders");
        } catch (err) {
            console.error(err);
            setError('Login failed! Check your credentials.');
        }
    };

    return (
        <div className='login_page'>
            <div className='login_card'>
                <div className='login_info'>
                    <form id='login' onSubmit={handleLogin}>
                        <div className='login_text'>
                            <label className='login_text' htmlFor='email'>Email</label>
                            <input type='text' id='email' name='email' placeholder='Email' value={email}
                                   onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className='login_text'>
                            <label className='login_text' htmlFor='password'>Password</label>
                            <input type='text' id='password' name='password' placeholder='Password' value={password}
                                   onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <button type='submit' className='login_button' form='login'>LOGIN</button>
                    </form>
                    {error && <p className='error_message'>{error}</p>}
                </div>
            </div>
        </div>
    )
};

export default LoginComponent;