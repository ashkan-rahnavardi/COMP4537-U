import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import axios from 'axios';

export default function Login() {

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // let handleSubmit = (type) => {
    //     var formElement = document.getElementById('login-form');
    //     var formData = new FormData(formElement);

    //     axios.post('http://localhost:3001/' + type, formData)
    // }

    const registerForm = (
        <form action='http://localhost:3001/register' method="POST">
            <label>Name:    </label>
            <input type="text" name="username" /> <br/>
            <label>Password: </label>
            <input type="text" name="password" /> <br/>
            <label>Email: </label>
            <input type="text" name="email" /> <br/>
            <label>Role: </label>
            <input type="text" name="role" /> <br/>
            <input type="submit" value="Submit" />
        </form>
    )

    const loginForm = (
        <form action='http://localhost:3001/login' method="POST">
            <label>Name:    </label>
            <input type="text" name="username" /> <br/>
            <label>Password: </label>
            <input type="text" name="password" /> <br/>
            <input type="submit" value="Submit" />
        </form>
    )

    let LoginRegister = (
            <Stack spacing={2} direction='row'>
                <Button variant="contained" onClick={() => setShowLogin(!showLogin)}>Login</Button>
                <Button variant="contained" onClick={() => setShowRegister(!showRegister)}>Register</Button>
            </Stack>
    )


    return (
        <Box
            sx={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            { !showLogin && !showRegister && LoginRegister}
            {(showRegister && registerForm) || (showLogin && loginForm)}
        </Box>
    )
}