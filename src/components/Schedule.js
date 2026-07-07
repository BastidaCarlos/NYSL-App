import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "../utilities/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

const Schedule = () => {
    const [games, setGames] = useState([]);
    const [locations, setLocations] = useState([]);
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

                const gamesList = gamesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const locationsList = locationsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setGames(gamesList);
                setLocations(locationsList);
            } catch (error) {
                setError('Error to connect firestore')
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
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
        <section>
            {isLoading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {filteredGamesList.map(game => (
                <article key={game.id}>
                    <h2>{game.homeTeam} vs {game.awayTeam}</h2>
                    <p>Date: {game.date.toDate().toLocaleDateString()}</p>
                    <p>Location: {locations.find(location => location.id === game.locationId)?.name}</p>
                    <p>Direction: {locations.find(location => location.id === game.locationId)?.address}</p>
                    <span><Link to={`/games/${game.id}`}>See Details</Link></span>
                </article>
            ))}
        </section>
    )

}

export default Schedule;