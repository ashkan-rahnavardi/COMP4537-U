import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import axios from 'axios';

export default function Login({admin, setAdmin, accessToken, setAccessToken, refreshToken, setRefreshToken}) {

    const [showAlert, setShowAlert] = useState(null);
    const [isAdmin, setIsAdmin] = useState(admin);
    const [token, setToken] = useState(accessToken);
    const [refToken, setRefToken] = useState(refreshToken);

    let handleSubmit = () => {
        var name = document.getElementById('name').value;
        var password = document.getElementById('password').value;

        let data = {
            'username': name,
            'password': password,
        }

        axios.post('http://localhost:3001/login', data)
            .then(res => {
                //console.log(res.data.isAdmin);
                setToken(res.headers['auth-token-access']);
                setRefToken(res.headers['auth-token-refresh']);
                if (res.data.isAdmin === true) {
                    setIsAdmin(true);
                    window.location.replace('/admin');
                } else {
                    window.location.replace('/api');
                }
            })
            .catch(err => {
                console.log(err);
                setShowAlert(err.response.data);
            })
    }

    useEffect(() => {
        setAdmin(isAdmin);
    }, [isAdmin]);

    useEffect(() => {
        setAccessToken(token);
        setRefreshToken(refToken);
    }, [token, refToken]);


    const register = (
        <Box
            display="flex"
            flexDirection="column"
        >
            <TextField
                size='small'
                id="name"
                required
                label="username" /> <br />
            <TextField
                size='small'
                id="password"
                required
                label="password" /> <br />
            <Button variant='outlined' onClick={handleSubmit}>Login</Button>
            <br />
            <Link href='/register'>Don't have an account? Click Here</Link>
        </Box>
    )


    return (
        <>
            {showAlert && <Alert variant='filled' severity="error" onClose={() => { setShowAlert(null) }}>{showAlert}</Alert>}
            <Box
                sx={{
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                {register}
            </Box>
        </>
    )
}