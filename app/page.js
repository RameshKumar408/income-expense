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


export default function Home() {


  const [selectedDate, setSelectedDate] = useState();
  const [topic, setTopic] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('');

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
    console.log("🚀 ~ handleDateChange ~ date:", `${date?.$D}-${date?.$M + 1}-${date?.$y}`)
    setSelectedDate(`${date?.$D}-${date?.$M + 1}-${date?.$y}`);
    setSelectedDateError()
  };

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      console.log('Topic: ', topic, 'Amount: ', amount, 'Date: ', selectedDate);
      if ((selectedDate == "") || (selectedDate == undefined)) {
        setSelectedDateError("Please Select A Date");
      } else if (topic == "") {
        setTopicError("Please Enter topic");
      } else if ((amount == "") || (amount == 0)) {
        setAmountError("Please Enter Amount")
      } else if (type == "") {
        setTypeError("Please Select Type")
      } else {
        const res = await fetch("http://localhost:3000/api/incomes", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ Title: topic, Amount: amount, Type: type, Date: selectedDate }),
        });
        console.log(res?.ok, "res")
        if (res?.ok) {
          console.log("success")
          router.push("/");
          window.location.reload();
        } else {
          throw new Error("Failed to create a topic");
        }
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error)
    }
  }

  return (
    <>
      <div >
        <div style={{ textAlign: "center" }}>Please Select Date</div>
        <LocalizationProvider dateAdapter={AdapterDayjs} >
          <DemoContainer components={['DatePicker']}>
            <DatePicker label="Basic date picker" onChange={(e) => { handleDateChange(e) }} />
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
          <TextField id="outlined-basic" label="Topic" variant="outlined" onChange={(e) => { setTopic(e.target.value); setTopicError("") }} />
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
          <TextField type='Number' id="outlined-basic" label="Amount" variant="outlined" onChange={(e) => { setAmount(e.target.value); setAmountError() }} />
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
        <Button variant="outlined" onClick={(e) => { handleSubmit(e) }}>Submit</Button>
      </div>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Link href="/viewDetails">
          <Button variant="outlined">ViewDetails</Button>
        </Link>
      </div>
    </>
  );
}
