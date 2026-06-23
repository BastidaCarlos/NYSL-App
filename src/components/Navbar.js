import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <nav>
            <div>
                NYSL
            </div>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/games">Game Details</NavLink></li>
            </ul>
        </nav>
    )
}

export default Navbar;