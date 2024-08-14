"use client"

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
import { toast } from 'react-toastify';

export default function Home() {

    const [name, setname] = useState('')
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');

    const [nameError, setnameError] = useState('')
    const [emailError, setemailError] = useState('')
    const [passwordError, setpasswordError] = useState('')

    const router = useRouter();

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault();
            if (name == "") {
                setnameError("Please Enter Name");
            } else if (email == "") {
                setemailError("Please Enter Email");
            } else if ((password == "")) {
                setpasswordError("Please Enter Password")
            } else {
                const res = await fetch(`${constant?.Live_url}/api/register`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({ Name: name, Email: email, Password: password }),
                });
                var resps = await res?.json()
                if (resps?.status) {
                    toast.success("Registred Successfully");
                    setTimeout(() => {
                        router.push("/");
                    }, 1000);
                } else {
                    setemailError(resps?.message)
                }
            }
        } catch (error) {
            console.log("🚀 ~ handleSubmit ~ error:", error)
        }
    }

    return (
        <>
            <div style={{ marginTop: "10px" }}>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '28ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{ textAlign: "center" }}
                >
                    <TextField id="outlined-basic" label="Name" variant="outlined" onChange={(e) => { setname(e.target.value); setnameError("") }} />
                </Box>
                {nameError ? <div style={{ textAlign: "center", color: "red" }}>{nameError}</div> : <></>}
            </div>

            <div style={{ marginTop: "10px" }}>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '28ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{ textAlign: "center" }}
                >
                    <TextField type='email' id="outlined-basic" label="Email" variant="outlined" onChange={(e) => { setemail(e.target.value); setemailError("") }} />
                </Box>
                {emailError ? <div style={{ textAlign: "center", color: "red" }}>{emailError}</div> : <></>}
            </div>

            <div>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '28ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{ textAlign: "center" }}
                >
                    <TextField id="outlined-basic" label="Password" variant="outlined" onChange={(e) => { setpassword(e.target.value); setpasswordError() }} />
                </Box>
                {passwordError ? <div style={{ textAlign: "center", color: "red" }}>{passwordError}</div> : <></>}
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button variant="outlined" onClick={(e) => { handleSubmit(e) }}>Submit</Button>
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { router.back() }}>Login</Button>
            </div>
        </>
    );
}
