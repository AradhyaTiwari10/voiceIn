import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await axios.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg(data.message);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>{msg || "Loading..."}</h2>
      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
        Logout
      </button>
    </div>
  );
}
