import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import axios from 'axios';

export default function Login(admin) {

    const [showAlert, setShowAlert] = useState(null);

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
                if (res.data.isAdmin === true) {
                    admin.admin();
                }
                window.location.href = '/api';
            })
            .catch(err => {
                console.log(err);
                setShowAlert(err.response.data);
            })
    }


    const register = (
        <Box
            display="flex"
            flexDirection="column"
        >
            <TextField
                size='small'
                id="name"
                required
                label="username"/> <br/>
            <TextField
                size='small'
                id="password"
                required
                label="password"/> <br/>
            <Button variant='outlined' onClick={handleSubmit}>Login</Button>
            <br/>
            <Link href='/register'>Don't have an account? Click Here</Link>
        </Box>
    )


    return (
        <>
        {showAlert && <Alert variant='filled' severity="error" onClose={() => {setShowAlert(null)}}>{showAlert}</Alert>}
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