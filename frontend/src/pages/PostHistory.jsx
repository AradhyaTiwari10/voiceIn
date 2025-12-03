import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Toast from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import "./PostHistory.css";

export default function PostHistory() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState("");
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();

    useEffect(() => {
        fetchUser();
        fetchPosts();
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/user");
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    };

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get("/posts");
            setPosts(data.posts || []);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        const post = posts.find(p => p._id === postId);

        try {
            await axios.delete(`/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
            showToast("Post deleted from your history", "success", 5000);

            // If post has LinkedIn URL, inform user to delete manually on LinkedIn
            if (post?.linkedinUrl) {
                setTimeout(() => {
                    showToast("Note: Please delete manually on LinkedIn if needed", "info", 6000);
                }, 500);
            }
        } catch (err) {
            console.error("Failed to delete post:", err);
            showToast("Failed to delete post", "error", 4000);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post._id);
        setEditContent(post.content);
    };

    const handleSaveEdit = async (postId) => {
        const post = posts.find(p => p._id === postId);

        try {
            const { data } = await axios.put(`/posts/${postId}`, { content: editContent });
            setPosts(posts.map(p => p._id === postId ? { ...p, content: editContent } : p));
            setEditingPost(null);
            showToast("Post updated in your history", "success", 5000);

            // If post has LinkedIn URL, inform user to edit manually on LinkedIn
            if (post?.linkedinUrl) {
                setTimeout(() => {
                    showToast("Note: Please edit manually on LinkedIn if needed", "info", 6000);
                }, 500);
            }
        } catch (err) {
            console.error("Failed to update post:", err);
            showToast("Failed to update post", "error", 4000);
        }
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setEditContent("");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="history-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="history-container">
            <Toast toasts={toasts} onClose={removeToast} />
            <header className="history-header">
                <div className="header-left">
                    <div className="logo">
                        <img
                            src="https://res.cloudinary.com/dbfvgqsdy/image/upload/v1764741100/image-removebg-preview_14_agp14q.png"
                            alt="VoiceIn Logo"
                            className="logo-image"
                            style={{ height: "32px" }}
                        />
                    </div>
                </div>
                <div className="header-center">
                    <nav className="nav-links">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/history" className="nav-link active">Post History</Link>
                        <Link to="/drafts" className="nav-link">Drafts</Link>
                    </nav>
                </div>
                <div className="header-right">
                    <button className="btn-icon settings-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </button>
                    <div className="user-profile" onClick={handleLogout}>
                        <img
                            src={user?.picture || "https://static.licdn.com/sc/h/9c8pery4andzj6ohjkjp54ma2"}
                            alt={user?.name}
                            className="user-avatar"
                        />
                    </div>
                </div>
            </header>

            <main className="history-main">
                <div className="history-hero">
                    <h1>Post History</h1>
                    <p>View and manage your VoiceIn LinkedIn posts</p>
                </div>

                <div className="posts-container">
                    {error && <div className="error-message">{error}</div>}

                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No posts yet</h3>
                            <p>Create your first LinkedIn post using VoiceIn!</p>
                            <button className="btn-create" onClick={() => navigate("/dashboard")}>
                                Create Post
                            </button>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {posts.map((post) => (
                                <div key={post._id} className="post-card">
                                    <div className="post-header">
                                        <div className="post-date">
                                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="post-actions">
                                            {editingPost === post._id ? (
                                                <>
                                                    <button className="btn-save" onClick={() => handleSaveEdit(post._id)}>
                                                        Save
                                                    </button>
                                                    <button className="btn-cancel" onClick={handleCancelEdit}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn-icon-small" onClick={() => handleEdit(post)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button className="btn-icon-small btn-delete" onClick={() => handleDelete(post._id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="post-content">
                                        {editingPost === post._id ? (
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="post-edit-textarea"
                                            />
                                        ) : (
                                            <p>{post.content}</p>
                                        )}
                                    </div>
                                    {post.linkedinUrl && (
                                        <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-view-linkedin">
                                            View on LinkedIn
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
