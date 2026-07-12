import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail, signInWithGoogle, db } from "../utilities/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import CompleteProfile from "./CompleteProfile";
// Import styles and Logo
import { ReactComponent as Logo } from '../assets/nysl_logo.svg' 
import style from '../styles/Login.module.css'

const Login = () => {

    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [needsProfile, setNeedsProfile] = useState(false);
    const [userUid, setUserUid] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please fill all the fields');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
           await signInWithEmail(email, password); 
           navigate('/')
        } catch (error) {
           setError('Failed to sign in. Please chech your credentials.') 
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
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
            setError('Google sign in failed or account conflict detected.');
        } finally {
            setIsLoading(false)
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first to reset your password')
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset emial sent! Please check your inbox.')
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setError('No user found with this emial address.')
            } else {
                setError('Failed to send password reset email. Please verify the email')
            } 
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={style.loginWrapper}>
            {needsProfile && (
                <CompleteProfile 
                    uid={userUid}
                    onComplete={() => { setNeedsProfile(false); navigate('/') }}
                />
            )}

            <div className={style.brandContainer}>
                <div className={style.logoPlaceholder}>
                    <Logo className={style.loginLogo}/>
                </div>
                <h1 className={style.loginTitle}>Welcome to NYSL</h1>
                <p className={style.loginSubtitle}>Sign in to post messages and photos</p>
            </div>

            <form
                onSubmit={handleFormSubmit}
                className={style.loginForm}
            >
                <div className={style.formGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        disabled={isLoading}
                        className={style.inputField}
                    />
                </div>

                <div className={style.formGroup}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        disabled={isLoading}
                        className={style.inputField}
                    />
                </div>

                <div className={style.forgotPasswordContainer}>
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isLoading}
                        className={style.forgotPasswordLink}
                    >
                        Forgot password?
                    </button>
                </div>

                {error && <p className={style.erroText}>{error}</p>}
                {message && <p className={style.succesText}>{message}</p>}

                <div className={style.actionContainer}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={style.signInBtn}
                    >
                        {isLoading ? 'Sign In...' : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className={style.googleBtn}
                    >
                        <svg className={style.googleIcon} viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22l.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Sign in whit Google</span>
                    </button>

                    <Link to='/register' className={style.createAccountBtn}>
                        Create Account
                    </Link>
                </div>
            </form>
        </div>
    )
};

export default Login;