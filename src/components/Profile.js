import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, signOut } from "../utilities/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth/web-extension";

const Profile = () => {
    const [team, setTeam] = useState('');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true)
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                setUserData(userSnap.data());

            } catch (error) {
               setError('Error firebase') 
            } finally {
                setIsLoading(false)
            }
        }
        if (user) fetchUserData(); 

    }, [user]);

    const handleSignOut = async () => {
        try  {
            await signOut();
            navigate('/login');
       } catch (error) {
            setError('Error logging out')
       }
    }

    const handleTeamUpdate = async () => {
        if (userData?.rol !== 'familiar') return; 
        if (team === '') return; 

        setIsLoading(true);
        try {
            const userRef = doc(db, 'users', user.uid);

            await updateDoc(userRef, { team: team});
            setUserData(prevState => ({...prevState, team: team}))
            setTeam('');
        } catch (error) {
            setError('Error to try update the team')
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if(!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            alert(`A password reset link has been sent to ${user.email}`)
        } catch (error) {
            setError('Failed to send password reset email.')
        }
    }

    if (loading) return <p>Loading...</p> 
    if (isLoading && !userData) return <p>Loading profile...</p> 

    return (
        <div className="container py-5">
            <h1>{userData?.name}</h1>
            <h5>Team {userData?.team} - {userData?.rol}</h5>
            <p><span>Name:</span></p>
            <h3>{userData?.name}</h3>
            <p><span>Email:</span></p>
            <h3>{userData?.email}</h3>
            <p><span>Team:</span></p>
            <h3>{userData?.team}</h3>
            {userData?.rol === 'familiar' && (
                <div>
                    <input 
                        type="text"
                        placeholder="New team..."
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                    />
                    <button
                        onClick={handleTeamUpdate}
                        disabled={isLoading || !team}
                    >
                        Save
                    </button>
                </div>
            )}            

            <h3>Password:</h3>
            <button 
                onClick={handlePasswordChange}
            >
                Change
            </button>
            {error && (<p>{error}</p>)}

                <button 
                    type="button" 
                    className="btn btn-outline-danger px-4 rounded-pill fw-semibold"
                    onClick={handleSignOut}
                >
                    Sign Out
                </button>
        </div>

    )
}

export default Profile;