import React from "react";
import "./ProfilePreview.css";

const ProfilePreview = ({ user, content }) => {
    const currentDate = new Date();

    return (
        <div className="linkedin-card">
            {/* Header */}
            <div className="linkedin-header">
                <img
                    src={user?.picture || "https://static.licdn.com/sc/h/9c8pery4andzj6ohjkjp54ma2"}
                    alt={user?.name || "User"}
                    className="linkedin-avatar"
                />
                <div className="linkedin-info">
                    <div className="linkedin-name">{user?.name || "Your Name"}</div>
                    <div className="linkedin-meta">
                        <span>Now • </span>
                        <span className="linkedin-globe">🌐</span>
                    </div>
                </div>
                <div className="linkedin-more">•••</div>
            </div>

            {/* Content */}
            <div className="linkedin-content">
                {content ? (
                    <p>{content}</p>
                ) : (
                    <p className="placeholder-text">Your generated post will appear here...</p>
                )}
            </div>

            {/* Action Bar (Visual Only) */}
            <div className="linkedin-actions">
                <div className="action-btn">
                    <span className="icon">👍</span> Like
                </div>
                <div className="action-btn">
                    <span className="icon">💬</span> Comment
                </div>
                <div className="action-btn">
                    <span className="icon">🔁</span> Repost
                </div>
                <div className="action-btn">
                    <span className="icon">✈️</span> Send
                </div>
            </div>
        </div>
    );
};

export default ProfilePreview;
