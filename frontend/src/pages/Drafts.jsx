import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Toast from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import "./Drafts.css";

export default function Drafts() {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [editingDraft, setEditingDraft] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editTitle, setEditTitle] = useState("");

    // Pagination, search, sort states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");

    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();

    useEffect(() => {
        fetchUser();
        fetchDrafts();
    }, [currentPage, searchQuery, sortOrder]);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/user");
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    };

    const fetchDrafts = async () => {
        try {
            const params = {
                page: currentPage,
                limit: 6,
                sortBy: 'createdAt',
                order: sortOrder
            };

            if (searchQuery) {
                params.search = searchQuery;
            }

            const { data } = await axios.get("/drafts", { params });
            setDrafts(data.drafts || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            console.error("Failed to fetch drafts:", err);
            showToast("Failed to load drafts", "error", 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (draftId) => {
        try {
            await axios.delete(`/drafts/${draftId}`);
            setDrafts(drafts.filter(d => d._id !== draftId));
            showToast("Draft deleted successfully", "success", 3000);
        } catch (err) {
            console.error("Failed to delete draft:", err);
            showToast("Failed to delete draft", "error", 4000);
        }
    };

    const handleEdit = (draft) => {
        setEditingDraft(draft._id);
        setEditContent(draft.content);
        setEditTitle(draft.title);
    };

    const handleSaveEdit = async (draftId) => {
        try {
            await axios.put(`/drafts/${draftId}`, {
                title: editTitle,
                content: editContent
            });
            setDrafts(drafts.map(d => d._id === draftId ? { ...d, title: editTitle, content: editContent } : d));
            setEditingDraft(null);
            showToast("Draft updated successfully", "success", 3000);
        } catch (err) {
            console.error("Failed to update draft:", err);
            showToast("Failed to update draft", "error", 4000);
        }
    };

    const handleCancelEdit = () => {
        setEditingDraft(null);
        setEditContent("");
        setEditTitle("");
    };

    const handlePublish = (draft) => {
        navigate("/nexi", {
            state: {
                transcription: draft.transcription,
                generatedPost: draft.content,
                fromDraft: true,
                draftId: draft._id
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="drafts-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="drafts-container">
            <Toast toasts={toasts} onClose={removeToast} />

            <header className="drafts-header">
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
                        <Link to="/history" className="nav-link">Post History</Link>
                        <Link to="/drafts" className="nav-link active">Drafts</Link>
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

            <main className="drafts-main">
                <div className="drafts-hero">
                    <h1>Drafts</h1>
                    <p>Manage your saved draft posts</p>
                </div>

                <div className="drafts-controls">
                    <input
                        type="text"
                        placeholder="Search drafts..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="search-input"
                    />
                    <select value={sortOrder} onChange={handleSortChange} className="sort-select">
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>

                <div className="drafts-content">
                    {drafts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📝</div>
                            <h3>No drafts yet</h3>
                            <p>Save your posts as drafts before publishing!</p>
                            <button className="btn-create" onClick={() => navigate("/dashboard")}>
                                Create Draft
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="drafts-grid">
                                {drafts.map((draft) => (
                                    <div key={draft._id} className="draft-card">
                                        <div className="draft-header">
                                            <div className="draft-meta">
                                                {editingDraft === draft._id ? (
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="draft-title-input"
                                                        placeholder="Draft title..."
                                                    />
                                                ) : (
                                                    <h3 className="draft-title">{draft.title || "Untitled Draft"}</h3>
                                                )}
                                                <span className="draft-date">
                                                    {new Date(draft.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="draft-actions">
                                                {editingDraft === draft._id ? (
                                                    <>
                                                        <button className="btn-save" onClick={() => handleSaveEdit(draft._id)}>
                                                            Save
                                                        </button>
                                                        <button className="btn-cancel" onClick={handleCancelEdit}>
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn-icon-small" onClick={() => handleEdit(draft)} title="Edit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        <button className="btn-icon-small btn-delete" onClick={() => handleDelete(draft._id)} title="Delete">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="draft-content">
                                            {editingDraft === draft._id ? (
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="draft-edit-textarea"
                                                />
                                            ) : (
                                                <p>{draft.content}</p>
                                            )}
                                        </div>
                                        {editingDraft !== draft._id && (
                                            <button className="btn-publish" onClick={() => handlePublish(draft)}>
                                                Publish to LinkedIn
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="btn-page"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    <span className="page-info">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="btn-page"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
