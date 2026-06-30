import React from "react";
import { useAuthState } from 'react-firebase-hooks/auth';
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../utilities/firebase";

const Navbar = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    const handleProfileChange = () => {
        if (!user) {
           navigate('/login') 
        } else {
            navigate('/profile')
        }
    }

    return (
        <nav>
            <div>
                NYSL
            </div>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/games">Game Details</NavLink></li>
                <li><span onClick={!loading ? handleProfileChange : null}>Profile</span></li>
            </ul>
        </nav>
    )
}

export default Navbar;