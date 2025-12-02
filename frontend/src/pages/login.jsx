import { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";

export default function Login() {
  return (
    <div className="auth-page">
      <nav className="auth-navbar">
        <div className="logo">
          <img
            src="https://i.postimg.cc/RV0FDLyx/image-removebg-preview-(14).png"
            alt="VoiceIn Logo"
            className="logo-image"
          />
        </div>
        <Link to="http://localhost:5001/api/auth/linkedin" className="btn-nav-login">Connect</Link>
      </nav>

      <main className="auth-main">
        <div className="auth-content">
          <div className="image-column">
            <div className="image-container">
              <img
                src="https://media.istockphoto.com/id/1705796774/photo/team-office-and-computer-in-night-workshop-for-planning-strategy-or-goal-for-business-in.jpg?s=612x612&w=0&k=20&c=V0GVmEAK8Job1ssrVLV430pYVCGrrLO1Ti0YTY6L7UM="
                alt="Team working in office"
                className="hero-image"
              />
            </div>
          </div>

          <div className="text-column">
            <h1>Speaking is Easy Right?</h1>
            <p className="subheadline">
              VoiceIn analyzes your spoken thoughts and transforms them into professional, engaging LinkedIn posts that drive engagement and build your personal brand.
            </p>

            <button
              type="button"
              className="btn-linkedin-large"
              onClick={() => window.location.href = "http://localhost:5001/api/auth/linkedin"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="linkedin-icon">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Connect with LinkedIn
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
