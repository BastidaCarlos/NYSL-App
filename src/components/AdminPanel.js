import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utilities/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminGames from "./AdminGames";
import AdminUsers from "./AdminUsers";
import AdminAnnouncements from "./AdminAnnouncements";
// Import Styles
import style from '../styles/AdminPanel.module.css'

const AdminPanel = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('games');
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user) {
           navigate('/') 
           return;
        }
        const fetchUser = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    if (userData.rol === 'admin') {
                       setIsAdmin(true); 
                    } else {
                        navigate('/');
                        return;
                    }
                } else {
                    navigate('/');
                    return;
                }
            } catch (error) {
                setError('Failed to connect to Firebase')
            } finally {
                setIsLoading(false);
            } 
        }
        fetchUser();
    }, [user, loading, navigate])

    if (isLoading) {
        return (
            <div className={style.loadignContainer}>
                <div className={style.spinner}></div>
                <p>Loading Admin Dashboard</p>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <section className={style.adminContainer}>
            <div className={style.headerSection}>
                <h1 className={style.adminTitle}>Admin Dashboard</h1>
                <p className={style.adminSubtitle}>Manage league operations and content</p>
                {error && <p className={style.errorBadge}>{error}</p>}
            </div>

            <nav className={style.tabContainer}>
                <button
                    className={`${style.tabBtn} ${activeTab === 'games' ? style.activeTab : ''}`}
                    onClick={() => setActiveTab('games')}
                    disabled={activeTab === 'games'}
                >
                    Games
                </button>

                <button
                    className={`${style.tabBtn} ${activeTab === 'announcements' ? style.activeTab : ''}`}
                    onClick={() => setActiveTab('announcements')}
                    disabled={activeTab === 'announcements'}
                >
                    News
                </button>

                <button
                    className={`${style.tabBtn} ${activeTab === 'users' ? style.activeTab : ''}`}
                    onClick={() => setActiveTab('users')}
                    disabled={activeTab === 'users'}
                >
                    Users
                </button>
            </nav>

            <div className={style.contentArea}>
                {activeTab === 'games' && <AdminGames />}
                {activeTab === 'announcements' && <AdminAnnouncements />}
                {activeTab === 'users' && <AdminUsers />}
            </div>
        </section>
    )
}

export default AdminPanel;