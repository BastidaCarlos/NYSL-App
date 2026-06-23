import React from "react";
import schedule from '../data/schedule.json';
import { useParams } from "react-router-dom";

const GameDetails = () => {
    const { gameId } = useParams();
    const game = schedule.games[gameId];
    const locations = schedule.locations;

    return (
        <section>
            <h1>{game.teams}</h1>
            <p>Date: {game.date} {game.time}</p>
            <p>Location: {locations[game.location]?.name ?? 'Location not available'}</p>
            <p>Direction: {locations[game.location]?.address ?? 'Address not available'}</p>
            <iframe src={locations[game.location]?.mapFrame} title="Location Map"></iframe>
        </section>
    )
}

export default GameDetails;