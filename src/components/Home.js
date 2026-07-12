import { Fragment, useState, useEffect } from "react";
import { db } from "../utilities/firebase";
import { collection, query, orderBy, onSnapshot, getDocs, where, Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
// Import Styles and Icons
import style from '../styles/Home.module.css'
import { BellRing, Clock, Info, Calendar1, MapPin, ArrowRight } from "lucide-react";

const TeamButton = ({team, setTeam, checked}) => (
    <button
        type="button"
        className={`${style.filterPill} ${checked ? style.activePill : ''}`}
        onClick={() => setTeam(team === 'All' ? null : team)}
    >
        {team}
    </button>
)

const Home = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const teamList = [ "U1", "U2", "U3", "U4", "U5", "U6" ];

    useEffect(() => {
        const announcementRef = collection(db, 'announcements')
        const announcementQuery = query(announcementRef, orderBy('timestamp'))

        const unsuscribe = onSnapshot(announcementQuery, (snapshot) => {
            const announcementsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAnnouncements(announcementsList);
            setIsLoading(false);
        })
        return unsuscribe;
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);

            const todayTimestamp = Timestamp.fromDate(today);
            const nextWeekTimestamp = Timestamp.fromDate(nextWeek);

            const gamesRef = collection(db, 'games');
            const locationRef = collection(db, 'locations');

            const gamesQuery = query(
                gamesRef,
                where('date', '>=', todayTimestamp),
                where('date', '<', nextWeekTimestamp),
                orderBy('date')
            );

            setIsLoadingGames(true);
            try {
                const [gamesSnap, locationsSnap] = await Promise.all([
                    getDocs(gamesQuery),
                    getDocs(locationRef)
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
                        location: locationsMap[gameData.locationId] || {name: 'Location not Found'}
                    };
                });

                setUpcomingGames(fullGamesList);
            } catch (error) {
               setError('Error connecting to Firestore') 
            } finally {
                setIsLoadingGames(false);
            }
        }
        fetchData();
    }, [])

    const filteredUpcomingGames = selectedTeam 
        ? upcomingGames.filter(game => game.homeTeam === selectedTeam || game.awayTeam === selectedTeam) 
        : upcomingGames;

    return (
        <div className={style.mainContainer}>
            <div className={style.headerContainer}>
                <h1 className={style.homeTitle}>Fall Season</h1>
                <p className={style.homeSubtitle}>North Youth Soccer League</p>
            </div>

            <h2 className={style.announcementTitle}>Announcements</h2>
            <section className={style.announcementSection}>
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
                            </article>
                        )}
                    </Fragment>
                ))}
                {announcements.length === 0 && !isLoading && <p className={style.announcementDisclaimer}>No announcements at this time</p>}
            </section>
            <section className={style.upcomingSection}>
                <h2 className={style.upcomingTitle}>Upcoming Games</h2>
                <div className={style.filterContainer}>
                    <TeamButton 
                        team={'All'}
                        setTeam={setSelectedTeam}
                        checked={selectedTeam === null}

                    />
                    {teamList.map((teamName) => (
                        <TeamButton
                            key={teamName}
                            team={teamName}
                            setTeam={setSelectedTeam}
                            checked={selectedTeam === teamName}
                        />
                    ))}
                </div>
                <div className={style.gamesGrid}>
                    {isLoadingGames && <p className={style.statusText}>Loading games...</p>}
                    {error && <p className={style.errorText}>{error}</p>}
                    {!isLoadingGames && filteredUpcomingGames.length === 0 && (
                        <p className={style.noGamesText}>No games for this team</p>
                    )}

                    {!isLoadingGames && filteredUpcomingGames.map(game => (
                        <article className={style.gameCard} key={game.id}>
                            <h3 className={style.gameCardTitle}>{game.homeTeam} vs {game.awayTeam}</h3>

                            <div className={style.gameInfoRow}>
                                <span className={style.infoIcon}><Calendar1 size={18}/></span>
                                <p className={style.infoText}>
                                    {game.date.toDate().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} - {game.time}
                                </p>
                            </div>

                            <div className={style.gameInfoRow}>
                                <span className={style.infoIcon}><MapPin size={18}/></span>
                                <p className={style.infoText}>{game.location.name}</p>
                            </div>

                            <Link 
                                to={`/games/${game.id}`}
                                className={style.detailsBtn}
                            >
                                See Details <ArrowRight size={16} />
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
            
            <div className={style.contactCard}>
                <div className={style.contactHeader}>Contact Information</div>
                <div className={style.contactBody}>
                    <p><strong>League Coordinator:</strong>Michael Randal</p>
                    <p><strong>Phone:</strong>(630) 690-8132</p>
                    <p><strong>League Director:</strong>Tom Denton</p>
                </div>
            </div>
        </div>
    );
};

export default Home;