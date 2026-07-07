import { useState, useEffect } from "react";
import { db } from "../utilities/firebase";
import { collection, query, orderBy, onSnapshot, getDocs, where, Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";

const TeamButton = ({team, setTeam, checked}) => (
    <>
        <input
            type="radio"
            id={team}
            className="btn-check"
            autoComplete="off"
            checked={checked}
            onChange={() => setTeam(team === 'All' ? null : team)}
        />
        <label
            className="btn-team btn btn-outline-primary px-4 py-2 rounded-pill fw-medium transition-all shadow-sm"
            htmlFor={team}
        >
            { team }
        </label>
    </>
)

const Home = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [upcomingGames, setUpcomingGames] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const teamList = [
        "U1",
        "U2",
        "U3",
        "U4",
        "U5",
        "U6"
    ];

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

            setIsLoading(true);
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
                console.error("Real Error for firebase: ", error)
               setError('Error to connect Firestore') 
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [])

    const filteredUpcomingGames = selectedTeam 
        ? upcomingGames.filter(game => game.homeTeam === selectedTeam || game.awayTeam === selectedTeam) 
        : upcomingGames;

    return (
        <div className="container py-4 d-flex flex-column gap-2">

            <div className="text-center mb-4">
                <h1 className="fw-bold">NYSL Fall Season</h1>
                <p className="text-muted">North Youth Soccer League</p>
            </div>

            <h2>Announcements</h2>
            {announcements.map(announcement => (
                <div className="card" key={announcement.id}>
                    <div className="card-header">
                        <h3>{announcement.type}</h3> 
                        {announcement.homeTeam} VS {announcement.awayTeam}
                        {(announcement.type === 'Canceled' || announcement.type === 'Delayed') && <p>{announcement.reason}</p>}
                        {announcement.type === 'Delayed' && <p>{announcement.newDate} {announcement.newTime}</p>}
                        {announcement.type === 'Event' && <p>{announcement.title}</p>}
                    </div>
                </div>
            ))}
            {announcements.length === 0 && !isLoading && <p>No announcements at this time</p>}
            <section>
                <h3 className="mb-3">Filter by Team</h3>
                <div className="d-flex flex-wrap gap-2 mb-4">
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
            </section>
            <section className="my-3">
                <h3 className="mb-3">upcoming Games</h3>
                {isLoading && <p>Loading games...</p>}
                {error && <p className="text-danger">{error}</p>}
                {!isLoading && filteredUpcomingGames.length === 0 && (
                    <p className="text-muted">No games for this team</p>
                )}
                <div className="d-flex flex-column gap-3">
                    {filteredUpcomingGames.map(game => (
                        <article className="card shadow-sm" key={game.id}>
                            <div className="card-body">
                                <h5 className="card-title fw-bold">
                                    {game.homeTeam} vs {game.awayTeam}
                                </h5>
                                <p className="card-text mb-1">
                                    <strong>Date:</strong>{game.date.toDate().toLocaleDateString()}
                                </p>
                                <p className="card-text mb-1">
                                    <strong>Location:</strong>{game.location.name}
                                </p>
                                <p className="card-text mb-1">
                                    <strong>Address:</strong>{game.location.address}
                                </p>
                                <button><Link to={`/games/${game.id}`}>See Details</Link></button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            
            <div className="card">
                <div className="card-header fw-bold">Contact</div>
                <div className="card-body">
                    <p className="mb-1"><strong>League Coordinator:</strong>Michael Randal</p>
                    <p className="mb-0"><strong>Phone:</strong>(630) 690-8132</p>
                    <p className="mb-0"><strong>League Director:</strong>Tom Denton</p>
                </div>
            </div>
        </div>
    );
};

export default Home;