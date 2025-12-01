import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";
import multer from "multer";
import { AssemblyAI } from "assemblyai";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

//Scehma
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  linkedinId: { type: String },
  linkedinAccessToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);


mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

//cors
app.use(
  cors()
);

app.use(express.json());

//signup
// signup route removed
// app.post("/api/signup", async (req, res) => { ... });


//login route
// login route removed
// app.post("/api/login", async (req, res) => { ... });

// LinkedIn Auth Route
app.get("/api/auth/linkedin", (req, res) => {
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=openid%20profile%20w_member_social%20email`;
  res.redirect(url);
});

// LinkedIn Callback Route
app.get("/api/auth/linkedin/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post("https://www.linkedin.com/oauth/v2/accessToken", null, {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = tokenResponse.data.access_token;

    // Fetch user profile
    const profileResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { sub: linkedinId, name, email } = profileResponse.data;

    console.log("LinkedIn Auth - Access Token received:", accessToken ? "YES" : "NO");
    console.log("LinkedIn Auth - User email:", email);

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      console.log("Creating new user with LinkedIn token");
      user = new User({
        name,
        email,
        linkedinId,
        linkedinAccessToken: accessToken,
      });
      await user.save();
    } else {
      console.log("Updating existing user with LinkedIn token");
      user.linkedinId = linkedinId;
      user.linkedinAccessToken = accessToken;
      await user.save();
    }

    console.log("LinkedIn token saved to DB:", user.linkedinAccessToken ? "YES" : "NO");

    // Generate JWT
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);

  } catch (error) {
    console.error("LinkedIn Auth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "LinkedIn authentication failed" });
  }
});

// Helper function for retry logic
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Transcription Route
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file provided" });

    // Check if API key is configured
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error("ASSEMBLYAI_API_KEY is not configured");
      return res.status(500).json({ error: "AssemblyAI API key not configured" });
    }

    console.log("Received audio file:", {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    });

    const audioBuffer = req.file.buffer;

    console.log("Uploading to AssemblyAI...");

    // Upload the audio file to AssemblyAI with retry
    const uploadResponse = await retryOperation(async () => {
      return await Promise.race([
        client.files.upload(audioBuffer),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 30000)
        )
      ]);
    });

    console.log("Upload successful, URL:", uploadResponse);

    // Transcribe the audio with retry
    console.log("Starting transcription...");
    const transcript = await retryOperation(async () => {
      return await client.transcripts.transcribe({
        audio_url: uploadResponse,
      });
    });

    console.log("Transcription status:", transcript.status);

    if (transcript.status === 'error') {
      console.error("Transcription error:", transcript.error);
      throw new Error(transcript.error);
    }

    console.log("Transcription successful");
    res.json({ text: transcript.text });
  } catch (error) {
    console.error("Transcription Error:", error);

    // Provide more specific error messages
    let errorMessage = "Transcription failed";
    if (error.message.includes('timeout')) {
      errorMessage = "Request timeout - please try again";
    } else if (error.message.includes('ECONNRESET') || error.message.includes('network') || error.message.includes('fetch failed')) {
      errorMessage = "Network error - please check your connection and try again";
    } else if (error.message.includes('API key')) {
      errorMessage = "Invalid API key";
    }

    res.status(500).json({ error: errorMessage });
  }
});

// Gemini AI Integration


app.post("/api/generate-post", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
You are an expert LinkedIn content writer. Your task is to transform rough or conversational text into a polished, professional, humanized LinkedIn post.

Guidelines:
- Write in a storytelling style with a smooth narrative flow.
- The English should be simple and Humanize it.
- Avoid the use of complex vocabulary and jargon.
- Avoid using – in the result if it does remove it.
- Approximate length: 110 words.
- Maintain a formal yet relatable tone.
- No emojis and no hashtags.
- Make the writing concise, well-structured, and engaging.
- Bring out key emotions, lessons, achievements, or learnings authentically.
- Include a strong opening hook and a meaningful closing line.
- Do not exaggerate or add fictional details — only refine what is provided.
- Format into clean paragraphs suitable for LinkedIn.

Input text (transcribed from a spoken voice note):
"${text}"

Convert it into the final professional LinkedIn post.
    `;

    const generatedText = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text;
    }, 5, 2000);

    res.json({ post: generatedText });
  } catch (error) {
    // Fallback for 429 Too Many Requests
    if (error.status === 429 || error.message.includes('429')) {
      console.log("Quota exceeded, returning mock response for testing.");
      return res.json({
        post: `(Mock Response - Quota Exceeded)\n\nHere is a professional LinkedIn post based on your input:\n\n"${req.body.text}"\n\n🚀 Excited to share this update! #Professional #Growth\n\n(Note: The AI service is currently experiencing high traffic. This is a placeholder response.)`
      });
    } else {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ error: "Failed to generate post" });
    }
  }
});

// LinkedIn Post Route
app.post("/api/post-to-linkedin", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];
  const { post } = req.body;

  if (!post) {
    return res.status(400).json({ error: "No post content provided" });
  }

  try {
    // Verify JWT and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    console.log("LinkedIn Post - User found:", user ? "YES" : "NO");
    console.log("LinkedIn Post - User email:", user?.email);
    console.log("LinkedIn Post - LinkedIn token exists:", user?.linkedinAccessToken ? "YES" : "NO");

    if (!user) return res.status(401).json({ error: "User not found" });
    if (!user.linkedinAccessToken) {
      console.log("LinkedIn Post - ERROR: No LinkedIn access token found for user");
      return res.status(400).json({ error: "LinkedIn not connected. Please authenticate with LinkedIn first." });
    }

    // Get user's LinkedIn person URN
    const profileResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${user.linkedinAccessToken}` },
    });

    const personUrn = `urn:li:person:${profileResponse.data.sub}`;

    // Post to LinkedIn using Share API
    const shareResponse = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: post,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${user.linkedinAccessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    res.json({
      success: true,
      message: "Posted to LinkedIn successfully!",
      postId: shareResponse.data.id
    });
  } catch (error) {
    console.error("LinkedIn Post Error:", error.response?.data || error.message);

    // Handle token expiration
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "LinkedIn token expired. Please reconnect your LinkedIn account."
      });
    }

    res.status(500).json({ error: "Failed to post to LinkedIn" });
  }
});

//dashboard route
app.get("/api/dashboard", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: "User not found" });

    res.json({ message: `Welcome ${user.name}!` });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));