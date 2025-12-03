import React from 'react';
import './Loader.css';

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
    if (fullScreen) {
        return (
            <div className="loader-overlay">
                <div className="loader-container">
                    <div className="loader-spinner"></div>
                    {text && <p className="loader-text">{text}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="loader-container">
            <div className="loader-spinner"></div>
        </div>
    );
};

export default Loader;
