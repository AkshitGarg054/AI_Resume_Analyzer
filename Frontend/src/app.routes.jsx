import { createBrowserRouter, Navigate, useParams } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import AppLayout from "./features/interview/pages/AppLayout";
import Library from "./features/interview/pages/Library";
import Analytics from "./features/interview/pages/Analytics";

// Redirect /interview/:id → /analytics/:id (backward compat)
const InterviewRedirect = () => {
    const { interviewId } = useParams()
    return <Navigate to={`/analytics/${interviewId}`} replace />
}


export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        // Redirect bare root to /dashboard
        path: "/",
        element: <Navigate to="/dashboard" replace />
    },
    {
        // Backward-compat: old interview links redirect to analytics
        path: "/interview/:interviewId",
        element: <InterviewRedirect />
    },
    {
        // Protected app shell — all tabs live under AppLayout
        element: <Protected><AppLayout /></Protected>,
        children: [
            {
                path: "/dashboard",
                element: <Home />
            },
            {
                // Analytics placeholder (Option C) — no report selected
                path: "/analytics",
                element: <Analytics />
            },
            {
                // Full report view
                path: "/analytics/:interviewId",
                element: <Interview />
            },
            {
                path: "/library",
                element: <Library />
            }
        ]
    }
])