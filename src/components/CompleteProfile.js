import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../utilities/firebase";
// Import Styles
import style from '../styles/CompleteProfile.module.css'

const CompleteProfile =  ({uid, onComplete}) => {
    const [form, setForm] = useState({
        rol: 'select-rol',
        team: 'select-team'
    })
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.rol === 'select-rol') {
            setError('Please select a role')
            return;
        }

        if (form.rol === 'familiar' && form.team === "select-team") {
            setError('Please select a team')
            return; 
        }

        setIsLoading(true);

        try {
           const userRef = doc(db, 'users', uid) 
           await updateDoc(userRef, {
                rol: form.rol,
                team: form.rol === 'familiar' ? form.team : ''
           });

           onComplete();

        } catch (error) {
            setError('Failed to update profile. Please try again.')            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalCard}>
                <h2 className={style.modalTitle}>Complete your profile</h2>
                <p className={style.modalSubtitle}>Just a few more details to get started</p>

                <form onSubmit={handleSubmit} className={style.modalForm}>
                    <div className={style.formGroup}>
                        <label htmlFor="rol">Role:</label>
                        <select
                            id="rol"
                            name="rol"
                            value={form.rol}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={style.selectField}
                        >
                            <option value={"select-rol"} disabled hidden>Select a role</option>
                            <option value={"familiar"}>Family Member</option>
                            <option value={"player"}>Player</option>
                            <option value={"refere"}>Referee</option>
                        </select>
                    </div>

                    {form.rol === 'familiar' && (
                        <div className={style.formGroup}>
                            <label htmlFor="team">Team:</label>
                            <select
                                id="team"
                                name="team"
                                value={form.team}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={style.selectField}
                            >
                                <option value={"select-team"} disabled hidden>Select a team</option>
                                <option value={"U1"}>U1</option>
                                <option value={"U2"}>U2</option>
                                <option value={"U3"}>U3</option>
                                <option value={"U4"}>U4</option>
                                <option value={"U5"}>U5</option>
                                <option value={"U6"}>U6</option>
                            </select>
                        </div>
                    )}

                    {error && <p className={style.errorText}>{error}</p>}

                    <button type="submit" disabled={isLoading} className={style.submitBtn}>
                        {isLoading ? 'Saving...' : 'Finish Registration'}
                    </button>
                </form>
            </div>
        </div>
    )

}

export default CompleteProfile;