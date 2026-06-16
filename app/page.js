"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
// import dbConnect from "../libs/mongodb";
import { toast } from 'react-toastify';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import './loginRegister.css'

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
          if (topic == "admin@admin.com") {
            window.localStorage.setItem("roles", "admin")
          }
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
      <main className="login-page">
        <form className="login-panel" noValidate>
          <div className="login-heading">
            <AccountCircleIcon className="login-avatar" />
            <h1>Login</h1>
          </div>

          <div className="login-fields">
            <div className="login-field">
              <input
                value={topic}
                placeholder="Email"
                type="text"
                onChange={(e) => { setTopic(e.target.value); setTopicError("") }}
              />
              {topicError ? <div className="auth-error">{topicError}</div> : <></>}
            </div>

            <div className="login-field password-field">
              <input
                value={amount}
                placeholder="Password"
                type="password"
                onChange={(e) => { setAmount(e.target.value); setAmountError() }}
              />
              <span className="password-toggle" aria-hidden="true">
                <VisibilityOffOutlinedIcon />
              </span>
              {amountError ? <div className="auth-error">{amountError}</div> : <></>}
            </div>
          </div>

          <span className="forgot-password-btn">Forgot password ?</span>

          <button className="login-submit" type="button" onClick={(e) => { handleSubmit(e) }}>
            Login
          </button>

          <Link className="login-register-link" href="/register">
            Register
          </Link>
        </form>
      </main>
    </>

  )

}
