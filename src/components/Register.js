import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, registerWithEmail } from "../utilities/firebase";
import { doc, setDoc } from "firebase/firestore";


const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        rol: 'select-rol',
        team: 'select-team',
        error: ''
    })
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {

        // Prevenir comportamiento de form
        e.preventDefault();

        // Limpiar errores anteriore
        setForm(prevState => ({
            ...prevState,
            error: ''
        }))

        // Array de campos obligatorios
        const requiredFields = [form.name, form.email, form.password, form.confirmPassword]

        // Verificar si hay campos vacios
        const hasEmptyFields = requiredFields.some(field => !field || field.trim() === '');

        if (hasEmptyFields) {
           setForm(prevState => ({
                ...prevState,
                error: 'All the fields are required'
           }));
           return; 
        } 

        if (form.rol === 'select-rol') {
           setForm(prevState => ({
                ...prevState,
                error: 'Please select a rol'
           }));
           return; 
        }

        if (form.password !== form.confirmPassword) {
           setForm(prevState => ({
                ...prevState,
                error: 'The passwords do not match'
                
           }));
           return; 
        }

        if (form.rol === 'familiar') {
           if (form.team.trim() === 'select-team') {
                setForm(prevState => ({
                    ...prevState,
                    error: 'please select a team' 
                })); 
                return;
           }  
        }

        setIsLoading(true);

        // Llamar a registerWithEmail
        try {
            const result = await registerWithEmail(form.email, form.password);
            const uid = result.uid;
            const userData = {
                name: form.name,
                email: form.email,
                rol: form.rol,
                team: form.rol === 'familiar' ? form.team: ''
            }

            await setDoc(doc(db, "users", uid), userData);

            navigate('/');
            
        } catch (error) {
            setForm(prevState => ({
                ...prevState,
                error: 'Registration failed' 
            }))

        } finally {
            setIsLoading(false);
        }


    }

    return (
        <form onSubmit={handleRegister}>
            <label htmlFor="name">Name</label>
            <input
                type="text"
                value={form.name}
                onChange={handleChange}
                name="name"
                placeholder="Enter your name"
                disabled={isLoading}
            />
            <label htmlFor="email">Email</label>
            <input
                type="email"
                value={form.email}
                onChange={handleChange}
                name="email"
                placeholder="Enter your email"
                disabled={isLoading}
            />
            <label htmlFor="password">Password</label>
            <input
                type="password"
                value={form.password}
                onChange={handleChange}
                name="password"
                placeholder="********"
                disabled={isLoading}
            />
            <label htmlFor="password">Confirm Password</label>
            <input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder="********"
                disabled={isLoading}
            />
            <label>Select a Rol</label>
            <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                disabled={isLoading}
            >
                <option value="select-rol" disabled hidden>Select a rol</option>
                <option value="familiar">Familiar</option>
                <option value="player">Player</option>
                <option value="refere">Refere</option>
            </select>
            {form.rol === 'familiar' && (
                <>
                    <label htmlFor="team">Team</label>
                    <select
                        id="team"
                        name="team"
                        value={form.team}
                        onChange={handleChange}
                        disabled={isLoading}
                    >
                        <option value="select-team" disabled hidden>Select a team</option>
                        <option value="U1">U1</option>
                        <option value="U2">U2</option>
                        <option value="U3">U3</option>
                        <option value="U4">U4</option>
                        <option value="U5">U5</option>
                        <option value="U6">U6</option>
                    </select>
                </>
            )}

            {form.error && <p style={{color : 'red'}}>{form.error}</p>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
            </button>

            <Link to="/login">Already have an account? Sign In</Link>
        </form>
    )

}

export default Register;