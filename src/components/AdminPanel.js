import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utilities/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminGames from "./AdminGames";
import AdminUsers from "./AdminUsers";
import AdminAnnouncements from "./AdminAnnouncements";

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
    }, [user])

    if (isLoading) return <p>Loading admin panel...</p>;
    if (!isAdmin) return null;

    return (
        <section>
            <div>
                <button 
                    onClick={() => setActiveTab('games')}
                    disabled={activeTab === 'games'}
                >
                    Games
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    disabled={activeTab === 'users'}
                >
                    Users
                </button>
                <button 
                    onClick={() => setActiveTab('announcements')}
                    disabled={activeTab === 'announcements'}
                >
                    Announcements
                </button>
            </div>
            <div>
                {activeTab === 'games' && <AdminGames /> }        
                {activeTab === 'users' && <AdminUsers /> }        
                {activeTab === 'announcements' && <AdminAnnouncements /> }        
            </div>
        </section>
    )
}

export default AdminPanel;