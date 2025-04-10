import { Navigate } from "react-router-dom";

export default function PrivateRoute({children}) {
    const accessToken = localStorage.getItem('accessToken');

    //if no token exist, redirect to login
    if(!accessToken) {
        return <Navigate to="/login" replace />
    }

    //if token exist allow access
    return children;
}