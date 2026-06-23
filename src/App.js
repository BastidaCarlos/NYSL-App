import React from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Schedule from "./components/Schedule";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameDetails from "./components/GameDetails";

const App = () => (
  <BrowserRouter>
    <div className="container py-5">
      <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/games' element={<Schedule />} />
          <Route path='/games/:gameId' element={<GameDetails />}/>
        </Routes>
    </div>
  </BrowserRouter>
)

export default App;