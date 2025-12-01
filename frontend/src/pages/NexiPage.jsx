import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
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
    const hasGeneratedRef = useRef(false);

    useEffect(() => {
        if (!transcription) {
            // Redirect back if no transcription provided
            navigate("/dashboard");
            return;
        }

        // Auto-generate on load (only once)
        if (!hasGeneratedRef.current) {
            hasGeneratedRef.current = true;
            generatePost();
        }
    }, [transcription]);

    const generatePost = async () => {
        if (loading) return; // Prevent duplicate calls

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
        alert("Copied to clipboard!");
    };

    const handlePostToLinkedIn = async () => {
        if (posting) return; // Prevent duplicate calls

        console.log("Attempting to post to LinkedIn...");
        console.log("Generated post content:", generatedPost);

        setPosting(true);
        setError("");
        setPostSuccess("");

        try {
            console.log("Sending request to /post-to-linkedin");
            const { data } = await axios.post("/post-to-linkedin", { post: generatedPost });
            console.log("Post successful:", data);
            setPostSuccess(data.message || "Posted to LinkedIn successfully!");
            setTimeout(() => setPostSuccess(""), 5000); // Clear success message after 5s
        } catch (err) {
            console.error("LinkedIn posting failed:", err);
            console.error("Error response:", err.response?.data);
            const errorMsg = err.response?.data?.error || "Failed to post to LinkedIn. Please try again.";
            setError(errorMsg);
        } finally {
            setPosting(false);
        }
    };

    return (
        <div className="nexi-container">
            <header className="nexi-header">
                <h1>✨ Nexi AI</h1>
                <button className="btn-back" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </header>

            <main className="nexi-content">
                <div className="split-view">
                    <div className="original-card">
                        <h3>Original Transcription</h3>
                        <div className="text-content">
                            <p>{transcription}</p>
                        </div>
                    </div>

                    <div className="generated-card">
                        <h3>LinkedIn Post</h3>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Nexi is crafting your post...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>{error}</p>
                                <button className="btn-retry" onClick={generatePost}>Retry</button>
                            </div>
                        ) : (
                            <div className="post-content">
                                <textarea
                                    value={generatedPost}
                                    onChange={(e) => setGeneratedPost(e.target.value)}
                                    placeholder="Your generated post will appear here..."
                                />
                                {postSuccess && (
                                    <div className="success-message">
                                        ✓ {postSuccess}
                                    </div>
                                )}
                                <div className="actions">
                                    <button className="btn-copy" onClick={handleCopy}>
                                        Copy to Clipboard
                                    </button>
                                    <button
                                        className="btn-linkedin"
                                        onClick={handlePostToLinkedIn}
                                        disabled={posting || !generatedPost}
                                    >
                                        {posting ? "Posting..." : "📤 Post to LinkedIn"}
                                    </button>
                                    <button className="btn-regenerate" onClick={generatePost}>
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
