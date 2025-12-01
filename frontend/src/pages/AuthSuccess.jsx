import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            // Force a reload or state update if needed, but navigate should work if App checks localStorage on render.
            // However, App.jsx checks localStorage once on mount or render.
            // If we navigate to /dashboard, App might not re-render the token check if it's outside the component or just a const.
            // In App.jsx: const token = localStorage.getItem("token");
            // This runs on every render.
            // But we need to make sure we trigger a re-render of App or Dashboard.
            // Since we are doing a full navigation, it should be fine.
            // Actually, if we are in the same SPA, `navigate` might not reset the `App` component state if `token` is just a variable.
            // But `Dashboard` route is conditional: `element={token ? ...}`.
            // If `token` variable in `App` is not state, it won't update.
            // We might need to reload the page or use a context.
            // For simplicity, let's reload or dispatch a custom event, or just window.location.href = '/dashboard'.
            window.location.href = "/dashboard";
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return <div>Loading...</div>;
}
