import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import axios from 'axios';

export default function Login() {

    let handleSubmit = () => {
        var name = document.getElementById('name').value;
        var password = document.getElementById('password').value;
        var email = document.getElementById('email').value;
        var role = document.getElementById('role').value;
        
        let data = {
            username: name,
            password: password,
            email: email,
            role: role
        }

        axios.post('http://localhost:3001/register', data)
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
            <TextField
                size='small'
                id="email"
                required
                label="email"/> <br/>
            <TextField
                size='small'
                id="role"
                required
                label="role"/> <br/>
            <Button variant='outlined' onClick={handleSubmit}>Register</Button>
        </Box>
    )


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


    return (
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
    )
}