import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle, db } from "../utilities/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import CompleteProfile from "./CompleteProfile";

const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [needsProfile, setNeedsProfile] = useState(false);
    const [userUid, setUserUid] = useState('');

    const handleEmailLogin = async () => {
        if (!email || !password) {
            setError('Please fill all the fields');
            return;
        }

        try {
            const user = await signInWithEmail(email, password);
            console.log('Authenticated user:', user.email)

            navigate('/');
        } catch (error) {
            setError('Fail to login sesion')
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            const uid = user.uid; 
            const userData = {
                name: user.displayName,
                email: user.email,
                rol: '',
                team: ''
            }
            const userRef = doc(db, "users", uid)
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
               await setDoc(doc(db, "users", uid), userData); 
               setUserUid(uid);
               setNeedsProfile(true);
            } else {
                navigate('/');
            }

        } catch (error) {
            setError('Email already exists');
        }
    }

    return (
        <section>
            {needsProfile && <CompleteProfile uid={userUid} onComplete={() => {setNeedsProfile(false); navigate('/');}} />}
            <h1>Sign In!</h1>
            <form>
                <label htmlFor="email">Email</label>
                <input 
                    type="text"
                    value={email}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your Email"
                />
                <label htmlFor="password">Password</label>
                <input 
                    type="password"
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                />

                    { error && <p style={{color: 'red'}}> {error}</p>}
                <div>
                    <button 
                        type="button"
                        onClick={handleEmailLogin}
                    >
                        Sign In!
                    </button>
                    <button 
                        type="button"
                        onClick={handleGoogleLogin}
                    >
                        Sign In With Google
                    </button>
                </div>
            </form>
            <Link to='/register'>You don't have an account? Register</Link>
        </section>
    )

}

export default Login;