import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, signOut } from "../utilities/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
// Imports Styles and Icons
import { User, Mail, Shield, LockKeyhole, LogOut } from "lucide-react";
import style from '../styles/Profile.module.css'

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

    const displayRole = userData?.rol === 'familiar' ? 'Family Member' : 'Player';

    return (
        <div className={style.profileContainer}>
            <div className={style.profileHeader}>
                <h1 className={style.profileMainName}>{userData?.name || 'User Name'}</h1>
                <p className={style.profileSubBadge}>
                    Team {userData?.team || 'N/A'} - {displayRole}
                </p>
            </div>

            <div className={style.profileCard}>
                <div className={style.profileRow}>
                    <div className={style.rowLeft}>
                        <span className={style.fieldIcon}><User size={20} /></span>
                        <span className={style.fieldLabel}>Name</span>
                    </div>
                    <div className={style.rowRigth}>
                        <span className={style.fieldValue}>{userData?.name}</span>
                    </div>
                </div>

                <div className={style.profileRow}>
                    <div className={style.rowLeft}>
                        <span className={style.fieldIcon}><Mail size={20} /></span>
                        <span className={style.fieldLabel}>Email</span>
                    </div>
                    <div className={style.rowRigth}>
                        <span className={style.fieldValue}>{userData?.email}</span>
                    </div>
                </div>

                <div className={style.profileRowColumn}>
                    <div className={style.profileRowTop}>
                        <div className={style.rowLeft}>
                            <span className={style.fieldIcon}><Shield size={20} /></span>
                            <span className={style.fieldLabel}>Team</span>
                        </div>
                        <div className={style.rowRight}>
                            <span className={style.fieldValue}>
                                {userData?.team ? `Current: ${userData.team}` : 'No team'}
                            </span>
                        </div>
                    </div>
                    
                    {userData?.rol === 'familiar' && (
                        <div className={style.teamEditContainer}>
                            <select
                                id="team"
                                name="team"
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                                disabled={isLoading}
                                className={style.teamSelect}
                            >
                                <option value="" disabled hidden>Select a team</option>
                                <option value="U1">U1</option>
                                <option value="U2">U2</option>
                                <option value="U3">U3</option>
                                <option value="U4">U4</option>
                                <option value="U5">U5</option>
                                <option value="U6">U6</option>
                            </select>
                            <button
                                type="button"
                                onClick={handleTeamUpdate}
                                disabled={isLoading || !team || team === userData?.team}
                                className={style.saveTeamBtn}
                            >
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                <div className={style.profileRow}>
                    <div className={style.rowLeft}>
                        <span className={style.fieldIcon}><LockKeyhole size={20} /></span>
                        <span className={style.fieldLabel}>Password</span>
                    </div>
                    <div className={style.rowRigth}>
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            className={style.changePasswordBtn}
                        >
                            Change
                        </button>
                    </div>
                </div>
            </div>
            {error && <p className={style.errorText}>{error}</p>}

            <button
                type="button"
                className={style.logoutButton}
                onClick={handleSignOut}
            >
                <LogOut size={20} />
                <span>Log out</span>
            </button>
        </div>
    );
};

export default Profile;