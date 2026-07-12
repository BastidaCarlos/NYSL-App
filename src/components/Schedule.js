import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../utilities/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
// Import Styles and Icons 
import style from '../styles/Schedule.module.css'
import { Calendar1, MapPin, ArrowRight } from "lucide-react";

const Schedule = () => {
    const [games, setGames] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [user] = useAuthState(auth);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [gamesSnap, locationsSnap] = await Promise.all([
                    getDocs(query(collection(db, 'games'), orderBy('date'))),
                    getDocs(collection(db, 'locations'))
                ]); 

                const locationsMap = {};
                locationsSnap.docs.forEach(doc => {
                    locationsMap[doc.id] = {
                        id: doc.id,
                        ...doc.data()
                    };
                });

                const fullGamesList = gamesSnap.docs.map(doc => {
                    const gameData = doc.data();
                    return {
                        id: doc.id,
                        ...gameData,
                        location: locationsMap[gameData.locationId] || {name: 'Location not found', address: ''}
                    }
                });
                setGames(fullGamesList);
            } catch (error) {
                setError('Error connecting to firestore')
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userRef);

                setUserProfile(userSnap.data());
            } catch (error) {
                setError('Error to connect firestore')    
            } finally {
                setIsLoading(false);
            }
        }
        if (user) fetchUserData();

    }, [user])

    const filteredGames = () => {
        if (!user || !userProfile) return games;
        if (userProfile?.rol === 'admin') return games; 
        if (userProfile?.rol === 'player' || userProfile?.rol === 'familiar') {
            return games.filter(game => game.homeTeam === userProfile?.team || game.awayTeam === userProfile?.team);
        }
        if (userProfile?.rol === 'referee') {
           return games.filter(game => game.refereeId === user.uid) 
        }
        return games;
    }

    const filteredGamesList = filteredGames();

    return (
        <div className={style.mainContainer}>
            <h1 className={style.pageTitle}>Game Schedule</h1>

            <section className={style.gamesGrid}>
                {isLoading && <p className={style.statusText}>Loading schedule...</p>}
                {error && <p className={style.errorText}>{error}</p>}

                {!isLoading && filteredGamesList.length === 0 && (
                    <p className={style.noGamesText}>No games Schedule for your profile</p>
                )}

                {!isLoading && filteredGamesList.map(game => (
                    <article className={style.gameCard} key={game.id}>
                        <h2 className={style.gameCardTitle}>
                            {game.homeTeam} vs {game.awayTeam}
                        </h2>

                        <div className={style.gameInfoRow}>
                            <span className={style.infoIcon}><Calendar1 size={24}/></span>
                            <p className={style.infoText}>
                                {game.date?.toDate().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} {game.time}
                            </p>
                        </div>

                        <div className={style.gameInfoRow}>
                            <span className={style.infoIcon}><MapPin size={24}/></span>
                            <div className={style.locationTextGroup}>
                                <p className={style.infoText}><strong>{game.location.name}</strong></p>
                                <p className={style.addressText}>{game.location.address}</p>
                            </div>
                        </div>
                        
                        <Link
                            to={`/games/${game.id}`}
                            className={style.detailsBtn}
                        >
                            See Details <ArrowRight size={18}/>
                        </Link>
                    </article>
                ))}
            </section>
        </div>
    )

}

export default Schedule;