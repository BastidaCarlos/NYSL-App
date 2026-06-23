import React from 'react';
import schedule from '../data/schedule.json';
import { Link } from 'react-router-dom';

const Schedule = () => {
    const scheduleData = Object.entries(schedule.games);
    const locations = schedule.locations;

    return (
        <section>
            { scheduleData.map(([gameId, game]) => {
                return (
                    <article key={gameId}>
                        <h2>{game.teams}</h2>
                        <p>Date: {game.date} {game.time}</p>
                        <p>Location: {locations[game.location]?.name ?? 'Location not available'}</p>
                        <p>Direction: {locations[game.location]?.address ?? 'Address not available'}</p>
                        <span><Link to={`/games/${gameId}`}>See Details</Link></span>
                    </article>
                )
            })}
        </section>
    )
}

export default Schedule;