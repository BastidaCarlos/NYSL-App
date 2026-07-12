import { ReactComponent as Logo} from '../assets/nysl_logo.svg'
import styles from '../styles/Header.module.css'

const Header = () => (
    <header className={styles.headerContainer}>
        <Logo className={styles.logoCustom}/>
        <span className={styles.titleContainer}>NYSL</span>
    </header>
) 

export default Header;