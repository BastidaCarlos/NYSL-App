import { useState, useEffect} from "react";
import { db } from "../utilities/firebase";
import { doc, getDoc } from "firebase/firestore";
import MessageBoard from "./MessageBoard";
import PhotoBoard from "./PhotoBoard";
import { useParams } from "react-router-dom";

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
        <div>
            <section>
                {isLoading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {!isLoading && !game && <p>Game not found</p>}
            </section>
            <section>
                <h1>{game?.homeTeam} VS {game?.awayTeam}</h1>
                <p>Date: {game?.date?.toDate().toLocaleDateString()} {game?.time}</p>
                <p>Location: {location?.name ?? 'Location not available'}</p>
                <p>Direction: {location?.address ?? 'Address not available'}</p>
                <iframe src={location?.mapFrame} title="Location Map"></iframe>
            </section>
            <section>
                <MessageBoard gameId={gameId} />
            </section>
            <section>
                <PhotoBoard gameId={gameId} />
            </section>
        </div>
    )
}

export default GameDetails;