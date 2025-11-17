import { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("/signup", form);
    navigate("/login");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input placeholder="Name" onChange={(e)=>setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={(e)=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={(e)=>setForm({...form, password:e.target.value})}/>
      <button type="submit">Sign Up</button>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </form>
  );
}
