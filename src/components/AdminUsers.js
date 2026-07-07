import { useState, useEffect } from "react";
import { db } from "../utilities/firebase";
import { doc,updateDoc, collection, getDocs } from "firebase/firestore";

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

    return (
        <div>
            <section>
                <h2>Users</h2>
                {users.map(user => {
                    return (
                        <article key={user.id}>
                            <h3>Name: {user.name}</h3>
                            <p>Email: {user.email}</p>
                            <p>Actual Rol: {user.rol}</p>
                            <p>Actual Team: {user.team}</p>
                            <button type="button" onClick={() => handleEdit(user)}>Edit</button>
                            {(editingUser !== null && editingUser.id === user.id) && (
                               <form
                                onSubmit={handleUpdateUser}
                               >
                                 <label htmlFor="changeTeam">Change Team:</label>
                                 <select
                                    id="changeTeam"
                                    name="team"
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
                                 <label htmlFor="changeRol">Change Rol:</label>
                                 <select
                                    id="changeRol"
                                    name="rol"
                                    value={updateUser.rol}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                 >
                                    <option value={''} disabled hidden>Select a Rol</option>
                                    <option value={'admin'}>Admin</option>
                                    <option value={'familiar'}>Familiar</option>
                                    <option value={'player'}>Player</option>
                                    <option value={'referee'}>Referee</option>
                                 </select>
                                 <button type="submit">{isLoading ? 'Updating...' : 'Update'}</button>
                                 <button type="button" onClick={handleCancelEdit}>Cancel</button>
                               </form> 
                            )}
                        </article>
                    )
                })}
            </section>
            {isLoading && <p>Loading...</p>}
            {error && <p>{error}</p>}
        </div>
    )

}

export default AdminUsers;