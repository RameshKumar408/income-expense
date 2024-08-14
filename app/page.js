"use client"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
// import dbConnect from "../libs/mongodb";
import { toast } from 'react-toastify';

export default function Home() {



  useEffect(() => {
    var tokens = window.localStorage.getItem("token")
    if (tokens) {
      router.push("/createDetail");
    }
  }, [])


  const [topic, setTopic] = useState('');
  const [amount, setAmount] = useState('');

  const [topicError, setTopicError] = useState('')
  const [amountError, setAmountError] = useState('')

  const router = useRouter();

  const handleSubmit = async (e) => {
    try {
      e?.preventDefault();
      if (topic == "") {
        setTopicError("Please Enter Email");
      } else if ((amount == "")) {
        setAmountError("Please Enter Password")
      } else {
        const res = await fetch(`${constant?.Live_url}/api/login`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ Email: topic, Password: amount }),
        });
        var resps = await res?.json()
        if (resps?.status) {
          window.localStorage.setItem("token", resps?.result)
          toast.success("Logged In Successfully");
          setTimeout(() => {
            router.push("/createDetail");
          }, 1000);
        } else {
          if (resps?.email) {
            setTopicError(resps?.email)
          } else {
            setAmountError(resps?.password)
          }
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
          <TextField id="outlined-basic" label="Email" variant="outlined" onChange={(e) => { setTopic(e.target.value); setTopicError("") }} />
        </Box>
        {topicError ? <div style={{ textAlign: "center", color: "red" }}>{topicError}</div> : <></>}
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
          <TextField id="outlined-basic" label="Password" variant="outlined" onChange={(e) => { setAmount(e.target.value); setAmountError() }} />
        </Box>
        {amountError ? <div style={{ textAlign: "center", color: "red" }}>{amountError}</div> : <></>}
      </div>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <Button variant="outlined" onClick={(e) => { handleSubmit(e) }}>Submit</Button>
        <Link href={'/register'} >Register</Link>
      </div>
    </>
  );
}
