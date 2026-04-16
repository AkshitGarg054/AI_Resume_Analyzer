import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'
import '../auth.form.scss'

const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if(loading){
        return (
            <div className='auth-loading'>
                <div className='auth-loading__inner'>
                    <div className='auth-spinner' />
                    <p>Loading application...</p>
                </div>
            </div>
        )
    }

    if(!user){
        return <Navigate to={'/login'} />
    }
    
    return children
}

export default Protected