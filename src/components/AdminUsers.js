import { useState, useEffect } from "react";
import { db } from "../utilities/firebase";
import { doc,updateDoc, collection, getDocs } from "firebase/firestore";
// Import styles and Icons
import style from '../styles/AdminSubcomponents.module.css'
import { Users, ShieldCheck, Flag, User } from "lucide-react";


const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [updateUser, setUpdateUser] = useState({
        team: (''),
        rol: ('')
    })

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const usersRef = collection(db, 'users');
                const usersSnap = await getDocs(usersRef); 
                const usersList = usersSnap.docs.map(user => ({
                    id: user.id,
                    ...user.data()
                }))
                setUsers(usersList);
            } catch (error) {
                setError('Firebase Error')
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, [])

    const handleChange = (e) => {
        const {name, value} = e.target;
        setUpdateUser(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        const userData = {};
        if (updateUser.team) userData.team = updateUser.team;
        if (updateUser.rol) userData.rol = updateUser.rol;
        if (Object.keys(userData).length === 0) {
           setError('Please update at least one field') 
           return;
        }

        setIsLoading(true);
        try {
           const userRef = doc(db, 'users', editingUser.id); 
           await updateDoc(userRef, userData)   
           setEditingUser(null);
           setUpdateUser ({
            team: (''),
            rol: ('')
           })
        } catch (error) {
           setError('Failed to update user') 
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (user) => {
        setEditingUser(user);
        setUpdateUser({
            team: user.team || '',
            rol: user.rol || '' 
        })
    }

    const handleCancelEdit = () => {
        setEditingUser(null);
        setUpdateUser({
            team: (''),
            rol: ('')
        })
    }

    const getRoleIcon = (rol) => {
        switch (rol) {
            case 'admin':
                return <ShieldCheck size={20} color="#DC2626" />; 
            case 'familiar':
                return <Users size={20} color="#2563EB" />; 
            case 'referee':
                return <Flag size={20} color="#16A34A" />; 
            case 'player':
            default:
                return <User size={20} color="#4B5563" />; 
        }
    };

    return (
        <div>
            <section className={style.listSection}>
                <h2 className={style.sectionTitle}>Users Directory</h2>
                {users.map(user => (
                    <article key={user.id} className={style.listCard}>
                        <div className={style.cardHeader}>
                            <span className={style.userIcon}>
                                {getRoleIcon(user.rol)}
                            </span>
                            <h3 className={style.cardTitle}>{user.name}</h3>
                        </div>
                        <p className={style.cardText}><strong>Email:</strong> {user.email}</p>
                        <p className={style.cardText}><strong>Rol:</strong> {user.rol}</p>
                        <p className={style.cardText}><strong>Team:</strong> {user.team || 'N/A'}</p>

                        {editingUser?.id !== user.id && (
                            <div className={style.btnContainer}>
                                <button
                                    type="button"
                                    className={style.primaryBtn}
                                    onClick={() => handleEdit(user)}
                                >
                                    Edit User
                                </button>
                            </div>
                        )}

                        {(editingUser !== null && editingUser.id === user.id) && (
                            <form className={style.userFormCard} style={{marginTop: '1rem', marginBottom: '0'}} onSubmit={handleUpdateUser}>
                                <div className={style.userFormGroup}>
                                    <label htmlFor="changeTeam">Change Team:</label>
                                    <select
                                        id="changeTeam"
                                        name="team"
                                        className={style.userInputField}
                                        value={updateUser.team}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value={''} disabled hidden>Select a team</option>
                                        <option value={'U1'}>U1</option>
                                        <option value={'U2'}>U2</option>
                                        <option value={'U3'}>U3</option>
                                        <option value={'U4'}>U4</option>
                                        <option value={'U5'}>U5</option>
                                        <option value={'U6'}>U6</option>
                                    </select>
                                </div>

                                <div className={style.userFormGroup}>
                                    <label htmlFor="changeRol">Change Role:</label>
                                    <select
                                        id="changeRol"
                                        name="rol"
                                        className={style.userInputField}
                                        value={updateUser.rol}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value={''} disabled hidden>Select a Role</option>
                                        <option value={'admin'}>Admin</option>
                                        <option value={'familiar'}>Family Member</option>
                                        <option value={'player'}>Player</option>
                                        <option value={'referee'}>Referee</option>
                                    </select>
                                </div>

                                <div className={style.btnContainer}>
                                    <button
                                        type="submit"
                                        className={style.primaryBtn}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Updating...' : 'Save Changes'}
                                    </button>

                                    <button
                                        type="submit"
                                        className={style.dangerBtn}
                                        onClick={handleCancelEdit}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </article>
                ))}
            </section>
                {isLoading && <p className={style.infoText}>Loading...</p>}
                {error && <p className={style.errorText}>{error}</p>}
        </div>
    )

}

export default AdminUsers;