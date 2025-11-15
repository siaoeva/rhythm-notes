import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/UI/Header';
import Footer from './components/UI/Footer';
import Landing from './pages/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './pages/Dashboard';
import StudyUpload from './pages/StudyUpload';
import GamePage from './pages/GamePage';
import Notes from './pages/Notes';
import Music from './pages/Music';
import ProfilePage from './pages/ProfilePage';
import './App.css';

// /collaborate  routes to be added later

function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<StudyUpload />} />
                    <Route path="/game" element={<GamePage />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;