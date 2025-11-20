import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLogin, user }) => {
    const onSuccess = (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        console.log('Login Success:', decoded);
        onLogin(decoded, credentialResponse.credential);
    };

    const onError = () => {
        console.log('Login Failed');
    };

    if (user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                    src={user.picture}
                    alt={user.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {user.email}
                </span>
            </div>
        );
    }

    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap
            theme="filled_black"
            shape="pill"
        />
    );
};

export default Login;
