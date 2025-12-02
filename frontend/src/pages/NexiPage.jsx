import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "../utils/axiosInstance";
import ProfilePreview from "../components/ProfilePreview";
import Toast from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import "./nexi.css";

export default function NexiPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [transcription, setTranscription] = useState(location.state?.transcription || "");
    const [generatedPost, setGeneratedPost] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [posting, setPosting] = useState(false);
    const [postSuccess, setPostSuccess] = useState("");
    const [user, setUser] = useState(null);
    const { toasts, showToast, removeToast } = useToast();
    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        // Fetch user data for preview
        fetchUser();

        // Auto-generate ONLY if transcription is passed from navigation AND we haven't generated yet
        if (location.state?.transcription && !hasGeneratedRef.current) {
            hasGeneratedRef.current = true;
            generatePost();
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get("/user");
            setUser(data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        }
    };

    const generatePost = async () => {
        if (loading || !transcription) return;

        setLoading(true);
        setError("");
        try {
            const { data } = await axios.post("/generate-post", { text: transcription });
            setGeneratedPost(data.post);
        } catch (err) {
            console.error("Generation failed:", err);
            setError("Failed to generate post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPost);
        showToast("Copied to clipboard!", "success", 3000);
    };

    const handleSaveDraft = async () => {
        if (!transcription && !generatedPost) {
            showToast("Nothing to save", "error", 3000);
            return;
        }

        try {
            await axios.post("/drafts", {
                title: "Draft from " + new Date().toLocaleDateString(),
                content: generatedPost || transcription,
                transcription: transcription
            });
            showToast("Draft saved successfully!", "success", 3000);
        } catch (err) {
            console.error("Failed to save draft:", err);
            showToast("Failed to save draft", "error", 4000);
        }
    };

    const handlePostToLinkedIn = async () => {
        if (posting) return;

        setPosting(true);
        setError("");
        setPostSuccess("");

        try {
            const { data } = await axios.post("/post-to-linkedin", { post: generatedPost });
            setPostSuccess(data.message || "Posted to LinkedIn successfully!");
            setTimeout(() => setPostSuccess(""), 5000);
        } catch (err) {
            console.error("LinkedIn posting failed:", err);
            const errorMsg = err.response?.data?.error || "Failed to post to LinkedIn. Please try again.";
            setError(errorMsg);
        } finally {
            setPosting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="nexi-container">
            <Toast toasts={toasts} onClose={removeToast} />
            <header className="nexi-header">
                <div className="header-left">
                    <div className="logo">
                        <img
                            src="https://i.postimg.cc/RV0FDLyx/image-removebg-preview-(14).png"
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

            <div className="nexi-hero">
                <h1>Create a new post with your voice</h1>
                <p>Record or upload your audio, and let Nexi craft the perfect LinkedIn post for you.</p>
            </div>

            <main className="nexi-main">
                <div className="split-layout">
                    {/* Left Column: Input */}
                    <div className="card input-card">
                        <div className="input-content">
                            <div className="record-state">
                                <div className="mic-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mic-icon"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                </div>
                                <p className="transcription-preview">
                                    {transcription || "Your live transcription will appear here as you speak..."}
                                </p>
                                <button className="btn-start-record" onClick={() => navigate("/dashboard")}>
                                    <div className="record-dot-small"></div>
                                    Start Recording
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="card output-card">
                        <h3>Nexi's Draft</h3>

                        {
                            loading ? (
                                <div className="loading-state">
                                    <div className="sparkle-spinner">✨</div>
                                    <p>Nexi is crafting your post...</p>
                                </div>
                            ) : !generatedPost ? (
                                <div className="empty-state">
                                    <div className="sparkle-icon-large">✨</div>
                                    <p>Generate a post to see the AI-crafted result appear here.</p>
                                </div>
                            ) : (
                                <div className="result-state">
                                    <div className="post-preview-container">
                                        <textarea
                                            value={generatedPost}
                                            onChange={(e) => setGeneratedPost(e.target.value)}
                                            className="post-textarea"
                                            placeholder="Your generated post..."
                                        />
                                    </div>

                                    <div className="action-bar">
                                        <button className="btn-ghost" onClick={generatePost}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
                                            Regenerate
                                        </button>
                                        <button className="btn-ghost" onClick={handleCopy}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            Copy
                                        </button>
                                        <button className="btn-ghost" onClick={handleSaveDraft}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                            Save Draft
                                        </button>
                                    </div>

                                    <button
                                        className="btn-publish-linkedin"
                                        onClick={handlePostToLinkedIn}
                                        disabled={posting}
                                    >
                                        {posting ? "Publishing..." : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                                Publish to LinkedIn
                                            </>
                                        )}
                                    </button>

                                    {postSuccess && <div className="success-toast">{postSuccess}</div>}
                                    {error && <div className="error-toast">{error}</div>}
                                </div>
                            )
                        }
                    </div >
                </div >
            </main >
        </div >
    );
}
