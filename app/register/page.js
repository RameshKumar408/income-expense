"use client"

// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import Box from '@mui/material/Box';
// import TextField from '@mui/material/TextField';
// import Button from '@mui/material/Button';

// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useState } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import constant from '@/constant';
import { toast } from 'react-toastify';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import '../loginRegister.css'
import { useLoader } from '@/app/context/LoaderContext'

export default function Home() {

    const [name, setname] = useState('')
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [nameError, setnameError] = useState('')
    const [emailError, setemailError] = useState('')
    const [passwordError, setpasswordError] = useState('')
    const [confirmPasswordError, setConfirmPasswordError] = useState('')

    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault();
            if (name == "") {
                setnameError("Please Enter Name");
            } else if (email == "") {
                setemailError("Please Enter Email");
            } else if ((password == "")) {
                setpasswordError("Please Enter Password")
            } else if (confirmPassword == "") {
                setConfirmPasswordError("Please Enter Confirm Password")
            } else if (password !== confirmPassword) {
                setConfirmPasswordError("Password does not match")
            } else {
                var sanitizedEmail = email.trim().toLowerCase()
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
                    setemailError("Please Enter Valid Email");
                    return
                }
                showLoader()
                const res = await fetch(`${constant?.Live_url}/api/register`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify({ Name: name, Email: sanitizedEmail, Password: password }),
                });
                var resps = await res?.json()
                if (resps?.status) {
                    toast.success("Registred Successfully");
                    setTimeout(() => {
                        router.push("/");
                    }, 1000);
                } else {
                    hideLoader()
                    setemailError(resps?.message)
                }
            }
        } catch (error) {
            hideLoader()
            console.log("🚀 ~ handleSubmit ~ error:", error)
        }
    }

    return (
        <>
            <main className="register-page">
                <form className="register-panel" onSubmit={handleSubmit}>
                    <div className="register-heading">
                        <div className="register-art" aria-hidden="true">
                            <span className="register-art-top"></span>
                            <span className="register-art-user"></span>
                            <span className="register-art-check one"></span>
                            <span className="register-art-check two"></span>
                            <span className="register-art-line one"></span>
                            <span className="register-art-line two"></span>
                        </div>
                        <h1>Register</h1>
                    </div>

                    <div className="register-fields">
                        <div className="register-field">
                            <input
                                value={name}
                                placeholder="Name"
                                type="text"
                                onChange={(e) => { setname(e.target.value); setnameError("") }}
                            />
                            {nameError ? <div className="register-error">{nameError}</div> : <></>}
                        </div>

                        <div className="register-field">
                            <input
                                value={email}
                                placeholder="Email"
                                type="email"
                                onChange={(e) => { setemail(e.target.value); setemailError("") }}
                            />
                            {emailError ? <div className="register-error">{emailError}</div> : <></>}
                        </div>

                        <div className="register-field password-field">
                            <input
                                value={password}
                                placeholder="Password"
                                type={showPassword ? "text" : "password"}
                                onChange={(e) => { setpassword(e.target.value); setpasswordError(""); setConfirmPasswordError(""); }}
                            />
                            <button
                                className="password-toggle"
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                onClick={() => { setShowPassword(!showPassword) }}
                            >
                                {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                            </button>
                            {passwordError ? <div className="register-error">{passwordError}</div> : <></>}
                        </div>

                        <div className="register-field password-field">
                            <input
                                value={confirmPassword}
                                placeholder="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(""); }}
                            />
                            <button
                                className="password-toggle"
                                type="button"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                onClick={() => { setShowConfirmPassword(!showConfirmPassword) }}
                            >
                                {showConfirmPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                            </button>
                            {confirmPasswordError ? <div className="register-error">{confirmPasswordError}</div> : <></>}
                        </div>
                    </div>

                    <button className="register-submit" type="submit">
                        Register
                    </button>

                    <Link className="register-login-link" href="/">
                        Login
                    </Link>
                </form>
            </main>
        </>
    );
}
