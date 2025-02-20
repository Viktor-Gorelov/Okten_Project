import React, {FC, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {jwtDecode, JwtPayload} from "jwt-decode";


const HeaderComponent= () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<string>('');
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const decoded = jwtDecode<JwtPayload &
                { user_id: string; sub: string; roles: string | string[] }>(token!);
            console.log(decoded.user_id);
            console.log(decoded);
            const role = Array.isArray(decoded.roles) ? decoded.roles[0] : decoded.roles;
            setUserRole(role || "");
            const response = await fetch(
                `/api/managers/${decoded.user_id}/name`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );
            const data = await response.text();
            console.log(data);
            setCurrentUser(data)
        }
        catch (error){
            console.error("Invalid token:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/login");
        }
    };

    const handleLogOut = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    const handleTransitionToAdminPanel = () => {
        if (userRole === "ADMIN") {
            navigate("/adminPanel");
        } else {
            alert("Access denied! You are not an admin.");
        }
    };

    return (
        <div className="header">
            <h3>Logo</h3>
            <div className="header_section">
                <h4>{currentUser}</h4>
                <div className="section_buttons">
                    {userRole === "ADMIN" && (
                        <button className="admin_button" onClick={handleTransitionToAdminPanel}></button>
                    )}
                    <button className="logout_button" onClick={handleLogOut}></button>
                </div>
            </div>
        </div>
    );
};

export default HeaderComponent;