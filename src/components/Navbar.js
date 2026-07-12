import React from "react";
import { useDocumentData } from 'react-firebase-hooks/firestore'; 
import { doc } from "firebase/firestore";
import { db } from "../utilities/firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../utilities/firebase";
// Imports Styles and Icons
import 'bootstrap/dist/css/bootstrap.min.css'
import styles from '../styles/Navbar.module.css'
import { Home, CalendarDays, User, ShieldCheck } from "lucide-react";

const Navbar = () => {
    const [user, loading] = useAuthState(auth);
    const userDocRef = user ? doc(db, 'users', user.uid) : null;
    const [userData, loadingDoc] = useDocumentData(userDocRef);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/games') return location.pathname.startsWith('/games');
        return location.pathname === path;
    }

    const isAdmin = userData?.rol === 'admin';

    const handleProfileChange = () => {
        if (!user) {
           navigate('/login') 
        } else {
            navigate('/profile')
        }
    }

    const handleAdminClick = () => {
        if (user && isAdmin) {
            navigate('/admin')
        }
    }

    if (loading || (user && loadingDoc)) {
        return (
            <footer>
                <nav className={`fixed-bottom ${styles.navbarCustom}`}>
                    <div className="container">
                        <ul className={styles.navLinks}>
                            <li className={styles.navItem}>
                                <span className={styles.navLink}>
                                    <span className={styles.navIcon}><Home/></span>
                                    <span className={styles.navLabel}>Loading...</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                </nav>
            </footer>
        ) 
    }

    return (
        <nav className={`navbar fixed-bottom ${styles.navbarCustom}`}>
            <div className="container">
                <ul className={styles.navLinks}>
                    <li className={styles.navItem}>
                        <button 
                            onClick={() => navigate('/')}
                            className={`${styles.navLink} ${isActive('/') ? styles.active: ''}`}
                            aria-label="games"
                        >
                            <span className={styles.navIcon}>
                                <Home size={24} />
                            </span>
                            <span className={styles.navLabel}>Home</span>
                        </button>
                    </li>
                    <li className={styles.navItem}>
                        <button 
                            onClick={() => navigate('/games')}
                            className={`${styles.navLink} ${isActive('/games') ? styles.active: ''}`}
                            aria-label="games"
                        >
                            <span className={styles.navIcon}>
                                <CalendarDays size={24} />
                            </span>
                            <span className={styles.navLabel}>Games</span>
                        </button>
                    </li>
                    <li className={styles.navItem}>
                        <button 
                            onClick={handleProfileChange}
                            className={`${styles.navLink} ${
                                (isActive('/profile') || isActive('/login')) ? styles.active: ''
                            }`}
                            aria-label={user ? 'Profile': 'Login'}
                        >
                            <span className={styles.navIcon}>
                                <User size={24} />
                            </span>
                            <span className={styles.navLabel}>
                                {user ? 'Profile' : 'Login'}
                            </span>
                        </button>
                    </li>
                    {isAdmin && (
                        <li className={styles.navItem}>
                            <button
                                onClick={handleAdminClick}
                                className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
                                aria-label="Admin Panel"
                            >
                                <span className={styles.navIcon}>
                                    <ShieldCheck size={24} />
                                </span>
                                <span className={styles.navLabel}>
                                    Admin
                                </span>
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    )
}

export default Navbar;