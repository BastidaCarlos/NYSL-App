import { useState, useEffect} from "react";
import { db } from "../utilities/firebase";
import { doc, getDoc } from "firebase/firestore";
import MessageBoard from "./MessageBoard";
import PhotoBoard from "./PhotoBoard";
import { useParams } from "react-router-dom";
// Import Styles and Icons
import style from '../styles/GameDetails.module.css'
import { Calendar1, MapPin, Map } from "lucide-react";

const GameDetails = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDataGame = async () => {
            setIsLoading(true)
            try {
                const gameRef = doc(db, 'games', gameId)
                const gameSnap = await getDoc(gameRef);
                const gameData = gameSnap.data();
                const locationRef = doc(db, 'locations', gameData.locationId);
                const locationSnap = await getDoc(locationRef);
                const locationData = locationSnap.data();
                setGame(gameData);
                setLocation(locationData);
            } catch (error) {
                setError('Error to connect with firestore')    
            } finally {
                setIsLoading(false);
            }
        }
        fetchDataGame();
    }, [gameId])

    return (
        <div className={style.container}>
            {isLoading && <p className={style.statusText}>Loading game details...</p>}
            {error && <p className={style.errorText}>{error}</p>}
            {!isLoading && !game && <p className={style.statusText}>Game not Found</p>}

            {!isLoading && game && (
                <>
                    <h1 className={style.sectionTitle}>Match Details</h1>

                    <article className={style.matchCard}>
                        <h2 className={style.matchTeams}>{game.homeTeam} vs {game.awayTeam}</h2>

                        <div className={style.infoRow}>
                            <Calendar1 size={18} className={style.icon}/>
                            <span>
                                {game.date?.toDate().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} - {game.time}
                            </span>
                        </div>

                        <div className={style.infoRow}>
                            <MapPin size={18} className={style.icon}/>
                            <span>
                                {location?.name ?? 'Location not available'}
                            </span>
                        </div>

                        {location?.mapFrame && (
                            <div className={style.mapWrapper}>
                                <iframe
                                    src={location.mapFrame}
                                    title="Location Map"
                                    className={style.mapIframe}
                                    loading="lazy"
                                ></iframe>
                            </div>
                        )}

                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location?.address || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={style.mapBtn}
                        >
                            <Map size={16} /> Open in maps
                        </a>
                    </article>
                    <MessageBoard gameId={gameId} />
                    <PhotoBoard gameId={gameId} />
                </>
            )}            
        </div>
    )
}

export default GameDetails;