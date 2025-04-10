import { Navigate } from "react-router-dom";

export default function PrivateRouter({children}) {
    const accessToken = localStorage.getItem('accessToken');

    //if no tocken excist, redirect to login
    if(!accessToken) {
        return <Navigate to="/login" replace />
    }

    //if token exist allow access
    return children;
}