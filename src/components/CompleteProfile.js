import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utilities/firebase";

const CompleteProfile =  ({uid, onComplete}) => {
    const [rol, setRol] = useState('select-rol');
    const [team, setTeam] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async (e) => {
        e.preventDefault();
        if (rol === 'select-rol') {
           setError('Please select a rol') 
           return;
        }

        if (rol === 'familiar' && team === '') {
           setError('Please select a team') 
           return;
        }

        setIsLoading(true);

        try {
            const userData = doc(db, 'users', uid)
            const userUpdate = {
                rol: rol,
                team: rol === 'familiar' ? team: ''
            } 

            await updateDoc(userData, userUpdate)
            onComplete();
        } catch (error) {
            setError('Firestore failed')
            return;
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <form onSubmit={handleComplete}>
            <label>Select a Rol</label>
            <select
                id="rol"
                name="rol"
                value={rol}
                onChange={(e) => {setRol(e.target.value)}}
                disabled={isLoading}
            >
                <option value="select-rol" disabled hidden>Select a rol</option>
                <option value="familiar">Familiar</option>
                <option value="player">Player</option>
                <option value="refere">Refere</option>
            </select>
            {rol === 'familiar' && (
                <>
                    <label htmlFor="team">Team</label>
                    <select
                        id="team"
                        name="team"
                        value={team}
                        onChange={(e) => {setTeam(e.target.value)}}
                        disabled={isLoading}
                    >
                        <option value="" disabled hidden>Select a team</option>
                        <option value="U1">U1</option>
                        <option value="U2">U2</option>
                        <option value="U3">U3</option>
                        <option value="U4">U4</option>
                        <option value="U5">U5</option>
                        <option value="U6">U6</option>
                    </select>
                </>
            )}

            {error && <p style={{color : 'red'}}>{error}</p>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update'}
            </button>
        </form>
    )

}

export default CompleteProfile;