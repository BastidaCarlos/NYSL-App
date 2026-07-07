import { useState, useEffect } from "react";
import { doc, getDocs, addDoc, updateDoc, deleteDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../utilities/firebase";

const AdminAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [form, setForm] = useState({
        type: '',
        gameId: '',
        title: '',
        homeTeam: '',
        awayTeam: '',
        reason: '',
        newDate: '',
        newTime: ''
    })

    useEffect(() => {
        const announcementRef = collection(db, 'announcements')
        const announcementQuery = query(announcementRef, orderBy('timestamp'))

        const unsuscribe = onSnapshot(announcementQuery, (snapshot) => {
            const annoncementsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })); 
            setAnnouncements(annoncementsList)
            setIsLoading(false)
        })
        return unsuscribe;
    }, [])

    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true)
            try {
               const gamesRef = collection(db, 'games'); 
               const gamesSnap = await getDocs(gamesRef);
               const gamesList = gamesSnap.docs.map(game => ({
                    id: game.id,
                    ...game.data()
               }))
               setGames(gamesList);
            } catch (error) {
               setError('Firestore Error') 
            } finally {
                setIsLoading(false);
            }
        }
        fetchGames();
    }, [])

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleGameSelect = (e) => {
        const gameId = e.target.value;
        const findGame = games.find(game => game.id === gameId);
        if (!findGame) return;
        setForm(prevState => ({
            ...prevState,
            gameId: findGame.id,
            homeTeam: findGame.homeTeam,
            awayTeam: findGame.awayTeam
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const requiredFields = [form.type, form.gameId, form.reason]
        const hasEmptyFields = requiredFields.some(field => !field || field.trim() === '') 
        if (hasEmptyFields) {
           setError('All the fields are required') 
           return;
        }
        
        if (form.type === 'Delayed') {
            if (form.newDate.trim() === '' || form.newTime.trim() === '' ) {
               setError('All the fields are required') 
               return;
            } 
        }

        if (form.type === 'Event') {
            if (form.title.trim() === '') {
                setError('All the fields are required') 
                return;
            }
        }

        const announcementData = {
            ...form,
            timestamp: serverTimestamp()
        }

        setIsLoading(true);
        try {
           if (editingAnnouncement !== null) {
            const announcementRef = doc(db, 'announcements', editingAnnouncement.id) 
            await updateDoc(announcementRef, announcementData)
            setEditingAnnouncement(null)
           } else {
            await addDoc(collection(db, 'announcements'), announcementData) 
           } 
           setForm({
                type: '',
                gameId: '',
                title: '',
                homeTeam: '',
                awayTeam: '',
                reason: '',
                newDate: '',
                newTime: ''
           })
        } catch (error) {
           setError('Firestore Error') 
        } finally {
            setIsLoading(false)
        }

    }

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        setForm({
            type: announcement.type,
            gameId: announcement.gameId,
            title: announcement.title || '',
            homeTeam: announcement.homeTeam,
            awayTeam: announcement.awayTeam,
            reason: announcement.reason,
            newDate: announcement.newDate || '',
            newTime: announcement.newTime || ''
        })
    }

    const handleDelete = async (announcement) => {
        setIsLoading(true);
        try {
           const announcementRef = doc(db, 'announcements', announcement) 
           await deleteDoc(announcementRef)
        } catch (error) {
           setError('Failed to delete the announcement') 
        } finally {
            setIsLoading(false);
        }
    }

    const handleCancelEdit = () => {
        setEditingAnnouncement(null);
        setForm({
            type: '',
            gameId: '',
            title: '',
            homeTeam: '',
            awayTeam: '',
            reason: '',
            newDate: '',
            newTime: ''
        })
        setError('');
    }

    return (
        <div>
            <section>
                <form
                    onSubmit={handleSubmit}
                >
                    <label htmlFor="type">Announcement Type</label>
                    <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        disabled={isLoading}
                    >
                        <option value={''} disabled hidden>Announcement type</option>
                        <option value={'Canceled'}>Canceled</option>
                        <option value={'Delayed'}>Delayed</option>
                        <option value={'Event'}>Event</option>
                    </select>
                    <label htmlFor="gameId">Select a game</label>
                    <select
                        id="gameId"
                        name="gameId"
                        value={form.gameId}
                        disabled={isLoading}
                        onChange={handleGameSelect}
                    >
                        <option value={''} disabled hidden>Select a Game</option>
                        { games.map(game => (
                            <option key={game.gameId} value={game.id}>{game.homeTeam} vs {game.awayTeam}</option>
                        ))}
                    </select>
                    {form.gameId && (
                        <div>
                            <p>Game Selected:</p>
                            <p>{form.homeTeam} vs {form.awayTeam}</p>
                        </div>
                    )}
                    {(form.type === 'Delayed' || form.type === 'Canceled') && (
                        <div>
                            <label htmlFor="reason">Reason</label>
                            <input
                                id="reason"
                                name="reason"
                                type="text"
                                placeholder="Reason..."
                                value={form.reason}
                                disabled={isLoading}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                    {form.type === 'Event' && (
                        <div>
                            <label htmlFor="title">Event Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={form.title}
                                disabled={isLoading}
                                onChange={handleChange}
                                placeholder="Meeting..."
                            />
                        </div>
                    )}
                    {form.type === 'Delayed' && (
                        <div>
                            <label htmlFor="newDate">New Date:</label>
                            <input 
                                type="date"
                                id="newDate"
                                name="newDate"
                                value={form.newDate}
                                disabled={isLoading}
                                onChange={handleChange}
                            />
                            <label htmlFor="newTime">New Time:</label>
                            <input 
                                type="time"
                                id="newTime"
                                name="newTime"
                                value={form.newTime}
                                disabled={isLoading}
                                onChange={handleChange}
                            />
                        </div>
                    )} 
                    <button disabled={isLoading}>
                        {
                            isLoading
                            ? (editingAnnouncement !== null ? 'Updating Announcement...' : 'Creating Announcement...')
                            : (editingAnnouncement !== null ? 'Update Announcement' : 'Create Announcement')
                        }
                    </button>
                    {
                        editingAnnouncement !== null && (
                            <button type="button" onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )
                    } 
                </form>
            </section>
            <section>
                {announcements.map(announcement => {
                    return (
                        <article key={announcement.id}>
                            <h3>{announcement.type} Game {announcement.homeTeam} vs {announcement.awayTeam}</h3>
                            <p>{announcement.reason}</p>
                            { announcement.type === 'Delayed' && (
                                <div>
                                    <p>New Date: {announcement.newDate}</p>
                                    <p>New Time: {announcement.newTime}</p>
                                </div>
                            ) }
                            <button onClick={() => handleEdit(announcement)}>Edit</button>
                            <button onClick={() => handleDelete(announcement.id)}>Delete</button>
                        </article>
                    )
                })}
            </section>
            <section>
                {isLoading && <p>Loading...</p>}
                {error && <p>{error}</p>}
            </section>
        </div>
    )
}

export default AdminAnnouncements;