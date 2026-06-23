import React from "react";

const Home = () => {
    return (
        <div className="container py-4">

            <div className="text-center mb-4">
                <h1 className="fw-bold">NYSL Fall Season</h1>
                <p className="text-muted">North Youth Soccer League</p>
            </div>

            <div className="card mb-4">
                <div className="card-header fw-bold">Announcements</div>
                <div className="card-body">
                    <ul className="mb-0">
                        <li>All games take place on Saturday</li>
                        <li>Games may be shortened or cancelled due extreme weather conditions</li>
                        <li>Facility type: Outdoor</li>
                    </ul>
                </div>

                <div className="card">
                    <div className="card-header fw-bold">Contact</div>
                    <div className="card-body">
                        <p className="mb-1"><strong>League Coordinator:</strong>Michael Randal</p>
                        <p className="mb-0"><strong>Phone:</strong>(630) 690-8132</p>
                        <p className="mb-0"><strong>League Director:</strong>Tom Denton</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;