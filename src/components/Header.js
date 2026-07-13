import { ReactComponent as Logo} from '../assets/nysl_logo.svg'
import { Link } from 'react-router-dom';
import styles from '../styles/Header.module.css'

const Header = () => (
    <header className={styles.headerContainer}>
        <Link to={'/'} className={styles.linkHome}> 
            <Logo className={styles.logoCustom}/>
            <span className={styles.titleContainer}>NYSL</span>
        </Link>
    </header>
) 

export default Header;