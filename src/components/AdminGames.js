import { useState, useEffect } from "react";
import { collection, setDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, getDocs, Timestamp, where } from "firebase/firestore";
import { db } from "../utilities/firebase";
// Import Styles and Icons
import style from '../styles/AdminSubcomponents.module.css'
import { Calendar1, MapPin } from "lucide-react";

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
                <form className={style.formCard} onSubmit={handleSubmit}>
                    <div className={style.formGroup}>
                        <label htmlFor="homeTeam">Home Team:</label>
                        <select
                            id="homeTeam"
                            name="homeTeam"
                            className={style.inputField}
                            value={form.homeTeam}
                            disabled={isLoading}
                            onChange={handleChange}
                        >
                            <option value={''} disabled hidden>Select a team</option>
                            <option value={'U1'}>U1</option>
                            <option value={'U2'}>U2</option>
                            <option value={'U3'}>U3</option>
                            <option value={'U4'}>U4</option>
                            <option value={'U5'}>U5</option>
                            <option value={'U6'}>U6</option>
                        </select>
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="awayTeam">Away Team:</label>
                        <select
                            id="awayTeam"
                            name="awayTeam"
                            className={style.inputField}
                            value={form.awayTeam}
                            disabled={isLoading}
                            onChange={handleChange}
                        >
                            <option value={''} disabled hidden>Select a team</option>
                            <option value={'U1'}>U1</option>
                            <option value={'U2'}>U2</option>
                            <option value={'U3'}>U3</option>
                            <option value={'U4'}>U4</option>
                            <option value={'U5'}>U5</option>
                            <option value={'U6'}>U6</option>
                        </select>
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="date">Date:</label>
                        <input 
                            id="date"
                            type="date"
                            name="date"
                            className={style.inputField}
                            value={form.date}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="time">Time:</label>
                        <input 
                            id="time"
                            type="time"
                            name="time"
                            className={style.inputField}
                            value={form.time}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="sequence">Sequence:</label>
                        <input 
                            id="sequence"
                            type="number"
                            min={"1"}
                            max={"9"}
                            name="sequence"
                            className={style.inputField}
                            value={form.sequence}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="location">Location</label>
                        <select
                            id="location"
                            name="location"
                            className={style.inputField}
                            value={form.locationId}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value={''} disabled hidden>Select a Location</option>
                            {locations.map(location => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className={style.formGroup}>
                        <label htmlFor="referee">Referee</label>
                        <select
                            id="referee"
                            name="referee"
                            className={style.inputField}
                            value={form.refereeId}
                            onChange={handleChange}
                        >
                            <option value={''} disabled hidden>Select a Referee</option>
                            {referees.map(referee => (
                                <option key={referee.id} value={referee.id}>{referee.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={style.btnContainer}>
                        <button className={style.primaryBtn} disabled={isLoading}>
                            {isLoading
                                ? (editingGame !== null ? 'Updating Game...' : 'Creating Game...')
                                : (editingGame !== null ? 'Update Game' : 'Create Game')
                            }
                        </button>
                        {editingGame !== null && (
                            <button type="button" className={style.dangerBtn} onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>
            <section className={style.listSection}>
                <h2 className={style.sectionTitle}>Game List</h2> 
                {isLoading && <p className={style.statusText}>Loading schedule...</p>}
                {error && <p className={style.errorText}>{error}</p>}

                {!isLoading && games.length === 0 && (
                    <p className={style.noGamesText}>No games Schedule for your profile</p>
                )}

                {!isLoading && games.map(game => (
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
                                <p className={style.infoText}><strong>{locations.find(location => location.id === game.locationId)?.name}</strong></p>
                                <p className={style.addressText}>{locations.find(location => location.id === game.locationId)?.address}</p>
                            </div>
                        </div>
                        <div className={style.btnContainer}>
                            <button
                                type="submit"
                                className={style.secondaryBtn}
                                disabled={isLoading}
                                onClick={() => handleEdit(game)}
                            >
                                Edit
                            </button>
                            <button
                                type="submit"
                                className={style.dangerBtn}
                                disabled={isLoading}
                                onClick={() => handleDelete(game.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                ))}
            </section>
            {isLoading && <p className={style.statusTextText}>Loading...</p>}
            {error && <p className={style.errorText}>{error}</p>}
        </div>
    )
}

export default AdminGames;