"use client"

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import dayjs, { Dayjs } from 'dayjs';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
import { toast } from 'react-toastify';


export default function Home({ params }) {

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

    const getDetails = async (id) => {
        try {
            const res = await fetch(`${constant?.Live_url}/api/getelementid`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "authorization": window.localStorage.getItem("token")
                },
                body: JSON.stringify({ Id: id }),
            });
            var resp = await res?.json();
            if (resp?.topics) {
                setTopic(resp?.topics?.Title)
                setAmount(resp?.topics?.Amount)
                setType(resp?.topics?.Type)
                setSelectedDate(resp?.topics?.Date)
                setTimeStamp(resp?.topics?.TimeStamp)
            }
        } catch (error) {

        }
    }

    useEffect(() => {
        if (params?.id) {
            getDetails(params?.id)
        }

    }, [params])

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault();
            if ((selectedDate == "") || (selectedDate == undefined)) {
                setSelectedDateError("Please Select A Date");
            } else if (topic == "") {
                setTopicError("Please Enter topic");
            } else if ((amount == "") || (amount == 0)) {
                setAmountError("Please Enter Amount")
            } else if (type == "") {
                setTypeError("Please Select Type")
            } else {
                const res = await fetch(`${constant?.Live_url}/api/getelementid`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    body: JSON.stringify({ Id: params?.id, Title: topic, Amount: amount, Type: type, Date: selectedDate, TimeStamp: TimeStamp }),
                });
                if (res?.ok) {
                    toast.success("Updated Successfully");
                    setTimeout(() => {
                        router.push("/viewDetails");
                    }, 1000);
                    // window.location.reload();
                } else {
                    toast.error("Something Went Wrong");
                    throw new Error("Failed to create a topic");
                }
            }
        } catch (error) {
            console.log("🚀 ~ handleSubmit ~ error:", error)
        }
    }

    const handleDelete = async () => {
        try {
            if (params?.id) {
                const res = await fetch(`${constant?.Live_url}/api/incomes`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    body: JSON.stringify({ id: params?.id }),
                });
                if (res?.ok) {
                    toast.success("Deleted Successfully");
                    setTimeout(() => {
                        router.push("/viewDetails");
                    }, 1000);
                } else {
                    toast.error("Something Went Wrong");
                    console.log("error")
                }
            }
        } catch (error) {
            console.log("🚀 ~ handleDelete ~ error:", error)
        }
    }

    return (
        <>
            <div style={{ textAlign: "center" }}>Edit Details</div>
            <div >
                <div style={{ textAlign: "center" }}>Please Select Date</div>
                <LocalizationProvider dateAdapter={AdapterDayjs} >
                    <DemoContainer components={['DatePicker']}>
                        <DatePicker label="Basic date picker" value={dayjs(selectedDate)} onChange={(e) => { handleDateChange(e) }} />
                    </DemoContainer>
                </LocalizationProvider>
                {selectedDateError ? <div style={{ textAlign: "center", color: "red" }}>{selectedDateError}</div> : <></>}
            </div>

            <div style={{ marginTop: "10px" }}>
                <div style={{ textAlign: "center" }}>Topic</div>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '28ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{ textAlign: "center" }}
                >
                    <TextField id="outlined-basic" label="Topic" value={topic} variant="outlined" onChange={(e) => { setTopic(e.target.value); setTopicError("") }} />
                </Box>
                {topicError ? <div style={{ textAlign: "center", color: "red" }}>{topicError}</div> : <></>}
            </div>

            <div>
                <div style={{ textAlign: "center" }}>Amount</div>
                <Box
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, width: '28ch' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{ textAlign: "center" }}
                >
                    <TextField type='Number' id="outlined-basic" label="Amount" value={amount} variant="outlined" onChange={(e) => { setAmount(e.target.value); setAmountError() }} />
                </Box>
                {amountError ? <div style={{ textAlign: "center", color: "red" }}>{amountError}</div> : <></>}
            </div>
            <div>
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
                {typeError ? <div style={{ textAlign: "center", color: "red" }}>{typeError}</div> : <></>}
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button variant="outlined" onClick={(e) => { handleSubmit(e) }}>Update</Button>
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { handleDelete() }}>Delete</Button>
            </div>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Link href="/viewDetails">
                    <Button variant="outlined">Back</Button>
                </Link>
            </div>
        </>
    );
}
