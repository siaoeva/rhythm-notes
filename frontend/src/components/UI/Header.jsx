import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-inner">
                <div className="logo">
                    <img src="/snote.png" alt="Rhythm Notes logo" className="logo-img" />
                    <h1>Rhythm Notes</h1>
                </div>

                <nav>
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/upload">Upload Study Material</Link></li>
                        <li><Link to="/game">Rhythm Game</Link></li>
                        <li><Link to="/notes">Notes</Link></li>
                        <li><Link to="/music">Music</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;