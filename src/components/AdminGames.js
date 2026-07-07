import { useState, useEffect } from "react";
import { collection, setDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, Timestamp, where } from "firebase/firestore";
import { db } from "../utilities/firebase";

const AdminGames = () => {
    const [games, setGames] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingGame, setEditingGame] = useState(null);
    const [referees, setReferees] = useState([]);
    const [form, setForm] = useState({
        homeTeam: (''),
        awayTeam: (''),
        date: (''),
        time: (''),
        locationId: (''),
        refereeId: (''),
        sequence: ('1')
    }) 
    
    useEffect(() => {
        const gamesRef = collection(db, 'games')
        const gamesQuery = query(gamesRef, orderBy('date'));

        const unsuscribe = onSnapshot(gamesQuery, (snapshot) => {
            const gamesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGames(gamesList);
            setIsLoading(false);
        })
        return unsuscribe;
    }, [])

    useEffect(() => {
        const fetchLocations = async () => {
            try {

                const locationRef = collection(db, 'locations');
                const locationsSnap = await getDocs(locationRef);
                const locationsList = locationsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setLocations(locationsList);
            } catch (error) {
                setError('Firestore Error')
            } finally {
                setIsLoading(false);
            }
        }
        fetchLocations();
    }, [])

    useEffect(() => {
        const fetchReferees = async () => {
            setIsLoading(true);
            try {
                const refereeRef = collection(db, 'users') 
                const refereeQuery = query(refereeRef, where('rol', '==', 'referee'));
                const refereeSnap = await getDocs(refereeQuery);

                const refereesList = refereeSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setReferees(refereesList);
            } catch (error) {
               setError('Error to connect firestore') 
            } finally {
                setIsLoading(false);
            }
        }
        fetchReferees();
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setError('');

        const requiredFields = [form.homeTeam, form.awayTeam, form.date, form.time, form.locationId, form.sequence]
        const hasEmptyFields = requiredFields.some(field => !field || field.trim() === '');

        if (hasEmptyFields) {
           setError('All the fields are required') 
           return;
        }

        const [year, month, day] = form.date.split('-');
        const localDate = new Date(year, month - 1, day);
        const timestampDate = Timestamp.fromDate(localDate);
        const gameId = `${form.date.replace(/-/g, '_')}_${form.sequence}`;

        const { sequence, ...rest } = form;
        const gameData = {
            ...rest,
            date: timestampDate
        }

        setIsLoading(true)

        try {
            if (editingGame !== null) {
               const gameRef = doc(db, 'games', editingGame.id)
               await updateDoc(gameRef, gameData); 
               setEditingGame(null);
            } else {
                await setDoc(doc(db, 'games', gameId), gameData);
            }
            setForm({
                homeTeam: (''),
                awayTeam: (''),
                date: (''),
                time: (''),
                locationId: (''),
                refereeId: (''),
                sequence: ('1')
            })
        } catch (error) {
            setError('Firestore Error')
        } finally {
            setIsLoading(false)
        }

    }
    
    const handleEdit = (game) => {
        setEditingGame(game);
        const gameString = game.date.toDate().toISOString().split('T')[0];
        setForm({
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            date: gameString,
            time: game.time,
            locationId: game.locationId,
            refereeId: game.refereeId || '',
            sequence: game.sequence || '1'
        })
    }

    const handleDelete = async (gameId) => {
        setIsLoading(true)
        try {
            const gameRef = doc(db, 'games', gameId);
            await deleteDoc(gameRef)
        } catch (error) {
            setError('Failed to delete the game');
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancelEdit = () => {
        setEditingGame(null);
        setForm({
            homeTeam: (''),
            awayTeam: (''),
            date: (''),
            time: (''),
            locationId: (''),
            refereeId: (''),
            sequence: ('1') 
        })
    }

    return (
        <div>
            <section>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="homeTeam">Home Team:</label>
                    <select
                        id="homeTeam"
                        name="homeTeam"
                        value={form.homeTeam}
                        disabled={isLoading}
                        onChange={handleChange}
                    >
                        <option value={''} disabled hidden>Select a Team</option>
                        <option value={'U1'}>U1</option>
                        <option value={'U2'}>U2</option>
                        <option value={'U3'}>U3</option>
                        <option value={'U4'}>U4</option>
                        <option value={'U5'}>U5</option>
                        <option value={'U6'}>U6</option>
                    </select>
                    <label htmlFor="awayTeam">Away Team:</label>
                    <select
                        id="awayTeam"
                        name="awayTeam"
                        value={form.awayTeam}
                        disabled={isLoading}
                        onChange={handleChange}
                    >
                        <option value={''} disabled hidden>Select a Team</option>
                        <option value={'U1'}>U1</option>
                        <option value={'U2'}>U2</option>
                        <option value={'U3'}>U3</option>
                        <option value={'U4'}>U4</option>
                        <option value={'U5'}>U5</option>
                        <option value={'U6'}>U6</option>
                    </select>
                    <label htmlFor="date">Date:</label>
                    <input 
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <label htmlFor="time">Time:</label>
                    <input 
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <label htmlFor="sequence">Sequence:</label>
                    <input 
                        type="number"
                        min={"1"}
                        max={"9"}
                        name="sequence"
                        value={form.sequence}
                        onChange={handleChange}
                        disabled={isLoading}
                    />
                    <label htmlFor="location">Location</label>
                    <select 
                        id="location"
                        name="locationId"
                        value={form.locationId}
                        onChange={handleChange}
                    >
                        <option value={''} disabled hidden>Select a Location</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                    </select>
                    <label htmlFor="referee">Referee</label>
                    <select 
                        id="referee"
                        name="refereeId"
                        value={form.refereeId}
                        onChange={handleChange}
                    >
                        <option value={''} disabled hidden>Select a Referee</option>
                            {referees.map(referee => (
                                <option key={referee.id} value={referee.id}>{referee.name}</option>
                        ))}
                    </select>
                    <button disabled={isLoading}>
                        {
                            isLoading
                            ? (editingGame !== null ? 'Updating Game...' : 'Creating Game...')
                            : (editingGame !== null ? 'Update Game' : 'Create Game')
                        }
                    </button>
                    {
                        editingGame !== null && (
                            <button type="button" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )
                    }
                </form>
            </section>
            <section>
                <h2>Game List</h2>
                { games.map((game) => {
                    return (
                        <article key={game.id}>
                            <h2>{game.homeTeam} vs {game.awayTeam}</h2>
                            <p>Date: {game.date.toDate().toLocaleDateString()}</p>
                            <p>{game.time}</p>
                            <p>Location: {locations.find(location => location.id === game.locationId)?.name}</p>
                            <button type="button" onClick={() => handleEdit(game)}>Edit</button>
                            <button type="button" onClick={() => handleDelete(game.id)}>Delete</button>
                        </article>
                    )
                })}
            </section>
            { isLoading && <p>Loading...</p>}
            { error && <p>{error}</p>}
        </div>
    )
}

export default AdminGames;