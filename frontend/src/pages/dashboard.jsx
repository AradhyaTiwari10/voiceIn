import { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { BarVisualizer } from "../components/ui/bar-visualizer";
import Toast from "../components/ui/Toast";
import { useToast } from "../hooks/useToast";
import "./dashboard.css";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Fetch user data including picture
        const { data: userData } = await axios.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(userData.name);
        setUserPicture(userData.picture);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Timer Logic
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        // Stop the media stream
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);

        setIsProcessing(true);
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.post("/transcribe", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            },
          });
          setTranscription(data.text);
        } catch (error) {
          console.error("Transcription failed:", error);
          showToast("Failed to transcribe audio.", "error", 4000);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      showToast("Microphone access denied or not supported.", "error", 4000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (isRecording || isPaused)) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const visualizerState = isRecording && !isPaused ? "listening" : isProcessing ? "thinking" : "idle";

  return (
    <div className="dashboard-container">
      <Toast toasts={toasts} onClose={removeToast} />
      <header className="dashboard-header">
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
            <Link to="/dashboard" className="nav-link active">Dashboard</Link>
            <Link to="/history" className="nav-link">Post History</Link>
            <Link to="/drafts" className="nav-link">Drafts</Link>
          </nav>
        </div>
        <div className="header-right">
          <button className="btn-icon settings-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <div className="user-profile" onClick={handleLogout} title="Click to logout">
            <img
              src={userPicture || "https://static.licdn.com/sc/h/9c8pery4andzj6ohjkjp54ma2"}
              alt={userName}
              className="user-avatar"
            />
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome! 👋</h2>
          <p>Record your voice and get instant transcription.</p>
        </div>

        <div className="dashboard-content">
          {/* Recording Card */}
          <div className="card recording-card">
            <div className="visualizer-container">
              {isRecording || isProcessing ? (
                <BarVisualizer
                  state={visualizerState}
                  barCount={30}
                  mediaStream={mediaStream}
                  centerAlign={true}
                />
              ) : (
                <div className="visualizer-placeholder">
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                </div>
              )}
            </div>

            <div className="recording-controls">
              <div className="timer">
                {isRecording || isPaused ? formatTime(recordingTime) : "00:00"}
              </div>

              <div className="control-buttons">
                {!isRecording ? (
                  <button
                    className="btn-control btn-record-main"
                    onClick={startRecording}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <span className="spinner-small"></span> : <div className="record-dot"></div>}
                  </button>
                ) : (
                  <button
                    className="btn-control btn-record-main recording"
                    onClick={stopRecording}
                  >
                    <div className="stop-square"></div>
                  </button>
                )}

                <button
                  className={`btn-control btn-pause ${isPaused ? 'active' : ''}`}
                  onClick={togglePause}
                  disabled={!isRecording}
                >
                  {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  )}
                </button>
              </div>

              <div className="status-text">
                {isPaused ? "Paused" : isRecording ? "Recording..." : "Ready to record"}
              </div>
            </div>
          </div>

          {/* Transcription Card */}
          <div className="card transcription-card">
            <div className="card-header">
              <h3>Transcription</h3>
              <button className="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </button>
            </div>

            <div className="transcription-body">
              <textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder="My name is John Doe."
                className="transcription-input"
              />
              <div className="char-count">
                {transcription.length} characters / {transcription.split(/\s+/).filter(w => w.length > 0).length} words
              </div>
            </div>

            <div className="card-footer">
              <button
                className="btn-discard"
                onClick={() => setTranscription("")}
              >
                Discard
              </button>
              <button
                className="btn-generate"
                onClick={() => navigate("/nexi", { state: { transcription } })}
                disabled={!transcription}
              >
                <span className="sparkle-icon">✨</span> Generate with Nexi
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
