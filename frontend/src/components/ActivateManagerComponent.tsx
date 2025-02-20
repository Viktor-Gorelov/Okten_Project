import React, {useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import "../ActivateManager.css"

const ActivateManagerComponent = () => {

    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        if (!password.trim()) {
            setError('Password is required.');
            return false;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters long.');
            return false;
        }

        if (!confirmPassword.trim()) {
            setError('Confirm Password is required.');
            return false;
        }

        if (confirmPassword !== password) {
            setError('Confirm Password must be duplicate Password');
            return false;
        }

        setError('');
        return true;
    };

    const handleActivate = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch(`/api/auth/activate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( {
                    token: token,
                    confirmPassword: confirmPassword
                }),
            });

            if (!response.ok) {
                throw new Error('Activate failed!');
            }
            navigate("/login");

        } catch (error) {
            setError('Activate failed! Check your credentials.');
        }
    };

    return (
        <div className="activate_page">
            <div className="activate_card">
                <div className='activate_info'>
                    <form id='activate' onSubmit={handleActivate}>
                        <div className='activate_text'>
                            <label htmlFor='password'>Password</label>
                            <input type='password' id='password' name='password'
                                   placeholder='Password' value={password}
                                   onChange={(e) =>
                                       setPassword(e.target.value)}/>
                        </div>
                        <div className='activate_text'>
                            <label htmlFor='confirm_password'>Confirm Password</label>
                            <input type='password' id='confirm_password' name='confirm_password'
                                   placeholder='Confirm Password' value={confirmPassword}
                                   onChange={(e) =>
                                       setConfirmPassword(e.target.value)}/>
                        </div>
                        <button type='submit' className='activate_button' form='activate'>ACTIVATE</button>
                    </form>
                    {error && <p>{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default ActivateManagerComponent;