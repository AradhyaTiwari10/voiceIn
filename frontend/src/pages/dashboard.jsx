import { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { BarVisualizer } from "../components/ui/bar-visualizer";
import "./dashboard.css";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await axios.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const name = data.message.replace("Welcome ", "").replace("!", "");
        setUserName(name);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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
          alert("Failed to transcribe audio.");
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const visualizerState = isRecording ? "listening" : isProcessing ? "thinking" : "idle";

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎙️ VoiceIn</h1>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome, {userName}! 👋</h2>
          <p>Record your voice and get instant transcription</p>
        </div>

        <div className="visualizer-section">
          <div className="visualizer-card">
            <div className="visualizer-container">
              <BarVisualizer
                state={visualizerState}
                barCount={20}
                mediaStream={mediaStream}
                centerAlign={true}
              />
            </div>

            <div className="controls">
              {!isRecording ? (
                <button
                  className="btn-record"
                  onClick={startRecording}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="record-icon">●</span>
                      Start Recording
                    </>
                  )}
                </button>
              ) : (
                <button className="btn-stop" onClick={stopRecording}>
                  <span className="stop-icon">■</span>
                  Stop Recording
                </button>
              )}
            </div>
          </div>

          {transcription && (
            <div className="transcription-card">
              <div className="transcription-header">
                <h3>Transcription</h3>
                <button
                  className="btn-clear"
                  onClick={() => setTranscription("")}
                >
                  Clear
                </button>
              </div>
              <div className="transcription-content">
                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Your transcription will appear here..."
                  rows={6}
                />
              </div>
              <div className="transcription-actions">
                <button
                  className="btn-nexi"
                  onClick={() => navigate("/nexi", { state: { transcription } })}
                >
                  ✨ Generate with Nexi
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
