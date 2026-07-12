import { Fragment, useState, useEffect } from "react";
import { doc, getDocs, addDoc, updateDoc, deleteDoc, collection, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../utilities/firebase";
// Import Styles
import style from '../styles/AdminSubcomponents.module.css'
import { BellRing, Clock, Info } from "lucide-react";

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

    const getSelectedGame = (games, gameId) => games.find(game => game.id === gameId);

    return (
        <div>
            <section>
                <form className={style.formCard} onSubmit={handleSubmit}>
                    <div className={style.formGroup}>
                        <label htmlFor="type">Announcement Type</label>
                        <select
                            id="type"
                            name="type"
                            className={style.inputField}
                            value={form.type}
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            <option value={''} disabled hidden>Announcement type</option>
                            <option value={'Canceled'}>Canceled</option>
                            <option value={'Delayed'}>Delayed</option>
                            <option value={'Event'}>Event</option>
                        </select>
                    </div>

                    <div className={style.formGroup}>
                        <label htmlFor="gameId">Select a game</label>
                        <select
                            id="gameId"
                            name="gameId"
                            className={style.inputField}
                            value={form.gameId}
                            onChange={handleGameSelect}
                            disabled={isLoading}
                        >
                            <option value={''} disabled hidden>Select a Game</option>
                            {games.map(game => (
                                <option key={game.gameId} value={game.id}>{game.homeTeam} vs {game.awayTeam}</option>
                            ))}
                        </select>
                    </div>
                    {form.gameId && (
                        <div className={style.formGroup}>
                            {(() => {
                                const selectedGame = getSelectedGame(games, form.gameId);
                                    if (!selectedGame) return null;
            
                                    return (
                                    <div className={style.formGroup}>
                                        <p className={style.cardText}>
                                            <strong>Game Selected:</strong> {selectedGame.homeTeam} vs {selectedGame.awayTeam}
                                        </p>
                                        <p className={style.cardText}>
                                            <strong>Date:</strong> {
                                                selectedGame.date?.toDate?.() 
                                                ? selectedGame.date.toDate().toLocaleDateString('en-US', {
                                                weekday: 'short', 
                                                month: 'short', 
                                                day: 'numeric'
                                                })
                                                : 'Date not available'
                                            }
                                        </p>
                                    </div>
                                    );
                            })()}
                        </div>
                    )}
                    {(form.type === 'Delayed' || form.type === 'Canceled') && (
                        <div className={style.formGroup}>
                            <label htmlFor="reason">Reason</label>
                            <input
                                id="reason"
                                name="reason"
                                type="text"
                                className={style.inputField}
                                placeholder="Reason..."
                                value={form.reason}
                                disabled={isLoading}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    {form.type === 'Event' && (
                        <div className={style.formGroup}>
                            <label htmlFor="title">Event Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className={style.inputField}
                                value={form.title}
                                disabled={isLoading}
                                onChange={handleChange}
                                placeholder="Meeting..."
                            />
                        </div>
                    )}

                    {form.type === 'Delayed' && (
                        <>
                            <div className={style.formGroup}>
                                <label htmlFor="newDate">New Date:</label>
                                <input 
                                    type="date"
                                    id="newDate"
                                    name="newDate"
                                    className={style.inputField}
                                    value={form.newDate}
                                    disabled={isLoading}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={style.formGroup}>
                                <label htmlFor="newTime">New Time:</label>
                                <input 
                                    type="time"
                                    id="newTime"
                                    name="newTime"
                                    className={style.inputField}
                                    value={form.newTime}
                                    disabled={isLoading}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )} 
                    
                    <div className={style.btnContainer}>
                        <button className={style.primaryBtn} disabled={isLoading}>
                            {isLoading
                                ? (editingAnnouncement !== null ? 'Updating...' : 'Creating...')
                                : (editingAnnouncement !== null ? 'Update Announcement' : 'Create Announcement')
                            }
                        </button>
                        {editingAnnouncement !== null && (
                            <button type="button" className={style.dangerBtn} onClick={handleCancelEdit}>
                                Cancel
                            </button>
                        )} 
                    </div>
                </form>
            </section>
            <section className={style.listSection}>
                <h2 className={style.sectionTitle}>Recent Announcements</h2>
                {announcements.map(announcement => (
                    <Fragment key={announcement.id}>
                        {announcement.type === 'Canceled' && (
                            <article className={`${style.announcementCard} ${style.announcementCanceledCard}`}>
                                <div className={style.announcementHeader}>
                                    <span className={style.canceledIcon}><BellRing /></span>
                                    <h3 className={style.canceledTitleCard}>{announcement.type} {announcement.homeTeam} VS {announcement.awayTeam}</h3>
                                </div>
                                <div className={style.announcementBody}>
                                    <p className={style.announcementReason}>{announcement.reason}</p>
                                </div>
                                <div className={style.btnContainer}>
                                    <button className={style.secondaryBtn} onClick={() => handleEdit(announcement)}>Edit</button>
                                    <button className={style.dangerBtn} onClick={() => handleDelete(announcement.id)}>Delete</button>
                                </div>
                            </article>
                        )}
                        {announcement.type === 'Delayed' && (
                            <article className={`${style.announcementCard} ${style.announcementDelayedCard}`}>
                                <div className={style.announcementHeader}>
                                    <span className={style.delayedIcon}><Clock /></span>
                                    <h3 className={style.delayedTitleCard}>{announcement.type} {announcement.homeTeam} VS {announcement.awayTeam}</h3>
                                </div>
                                <div className={style.announcementBody}>
                                    <p className={style.announcementReason}>{announcement.reason}</p>
                                    <p className={style.announcementNewDates}>{announcement.newDate} {announcement.newTime}</p>
                                </div>
                                <div className={style.btnContainer}>
                                    <button className={style.secondaryBtn} onClick={() => handleEdit(announcement)}>Edit</button>
                                    <button className={style.dangerBtn} onClick={() => handleDelete(announcement.id)}>Delete</button>
                                </div>
                            </article>
                        )}
                        {announcement.type === 'Event' && (
                            <article className={`${style.announcementCard} ${style.announcementEventCard}`}>
                                <div className={style.announcementHeader}>
                                    <span className={style.eventIcon}><Info /></span>
                                    <h3 className={style.eventTitleCard}> {announcement.type} {announcement.homeTeam} VS {announcement.awayTeam}</h3>
                                </div>
                                <div className={style.announcementBody}>
                                    <p className={style.announcementEventTitle}>{announcement.title}</p>
                                </div>
                                <div className={style.btnContainer}>
                                    <button className={style.secondaryBtn} onClick={() => handleEdit(announcement)}>Edit</button>
                                    <button className={style.dangerBtn} onClick={() => handleDelete(announcement.id)}>Delete</button>
                                </div>
                            </article>
                        )}
                    </Fragment>
                ))}
                {announcements.length === 0 && !isLoading && <p className={style.announcementDisclaimer}>No announcements at this time</p>}
            </section>
            
            <section>
                {isLoading && <p className={style.infoText}>Loading...</p>}
                {error && <p className={style.errorText}>{error}</p>}
            </section>
        </div>
    )
}

export default AdminAnnouncements;