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

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './createdeails.css'


export default function Home() {
    const [selectedDate, setSelectedDate] = useState();
    const [topic, setTopic] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('');
    const [TimeStamp, setTimeStamp] = useState('');

    const [selectedDateError, setSelectedDateError] = useState('')
    const [topicError, setTopicError] = useState('')
    const [amountError, setAmountError] = useState('')
    const [typeError, setTypeError] = useState('')

    const router = useRouter();

    const handleChange = (event) => {
        setType(event.target.value);
        setTypeError("")
    };

    const handleDateChange = (date) => {
        var year = date?.$y
        var month = date?.$M + 1 >= 10 ? date?.$M + 1 : `0${date?.$M + 1}`
        var dates = date?.$D >= 10 ? date?.$D : `0${date?.$D}`
        setSelectedDate(`${year}-${month}-${dates}`);

        const dateString = `${year}-${month}-${dates}`;
        const dateObject = new Date(dateString);
        const timestamp = dateObject.getTime();
        setTimeStamp(timestamp)
        setSelectedDateError()
    };

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault();
            if ((selectedDate == "") || (selectedDate == undefined)) {
                setSelectedDateError("Please Select Date");
            } else if (topic == "") {
                setTopicError("Please Enter Topic");
            } else if ((amount == "") || (amount == 0)) {
                setAmountError("Please Enter Amount")
            } else if (type == "") {
                setTypeError("Please Select Type")
            } else {
                const res = await fetch(`${constant?.Live_url}/api/incomes`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    body: JSON.stringify({ Title: topic, Amount: amount, Type: type, Date: selectedDate, TimeStamp: TimeStamp }),
                });
                if (res?.ok) {
                    // router.push("/");
                    toast.success("Created Successfully");
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    toast.error("Something went wrong");
                    throw new Error("Failed to create a topic");
                }
            }
        } catch (error) {
            console.log("🚀 ~ handleSubmit ~ error:", error)
        }
    }

    const logout = async () => {
        window.localStorage.removeItem("token")
        router.push('/')
    }

    return (
        <>
            <div className='containers'>
                <div className='coverDiv'>
                    <div >
                        <div style={{ textAlign: "center", fontSize: "20px" }}>Please Select Date</div>
                        <LocalizationProvider dateAdapter={AdapterDayjs} >
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker label="Basic date picker" onChange={(e) => { handleDateChange(e) }} sx={{ width: "100%" }} />
                            </DemoContainer>
                        </LocalizationProvider>
                        {selectedDateError ? <div style={{ textAlign: "center", color: "red" }}>{selectedDateError}</div> : <></>}
                    </div>

                    <div>
                        <div style={{ textAlign: "center", fontSize: "20px" }}>Topic</div>
                        <TextField id="outlined-basic" label="Topic" variant="outlined" onChange={(e) => { setTopic(e.target.value); setTopicError("") }} style={{ width: "100%" }} />
                        {topicError ? <div style={{ textAlign: "center", color: "red", fontSize: "18px" }}>{topicError}</div> : <></>}
                    </div>

                    <div>
                        <div style={{ textAlign: "center", fontSize: "20px" }}>Amount</div>

                        <TextField type='Number' id="outlined-basic" label="Amount" variant="outlined" onChange={(e) => { setAmount(e.target.value); setAmountError() }} style={{ width: "100%" }} />

                        {amountError ? <div style={{ textAlign: "center", color: "red", fontSize: "18px" }}>{amountError}</div> : <></>}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Type</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={type}
                                    label="Age"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={"Income"}>Income</MenuItem>
                                    <MenuItem value={"Expense"}>Expense</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        {typeError ? <div style={{ textAlign: "center", color: "red", fontSize: "18px" }}>{typeError}</div> : <></>}
                    </div>

                    <div className='btns'>
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Button variant="outlined" onClick={(e) => { handleSubmit(e) }}>Submit</Button>
                        </div>

                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Link href="/viewDetails">
                                <Button variant="outlined">ViewDetails</Button>
                            </Link>
                        </div>
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Button variant="outlined" onClick={() => { logout() }}>Logout</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
