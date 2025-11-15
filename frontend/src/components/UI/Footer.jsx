import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Rhythm Notes. All rights reserved.</p>
                <p>
                    <a href="/privacy-policy">Privacy Policy</a> | <a href="/terms-of-service">Terms of Service</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;