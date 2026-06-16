"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
import { decodeToken } from '@/libs/jwt';
import { toast } from 'react-toastify';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import './loginRegister.css'

export default function Home() {



  useEffect(() => {
    var isAdd = window.location.search.includes('add=1')
    var tokens = window.localStorage.getItem("token")
    if (tokens && !isAdd) {
      router.push("/createDetail");
    }
  }, [])


  const [topic, setTopic] = useState('');
  const [amount, setAmount] = useState('');

  const [topicError, setTopicError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
          var token = resps?.result
          var user = decodeToken(token)
          var existing = JSON.parse(window.localStorage.getItem('accounts') || '[]')
          var idx = existing.findIndex(a => a.email == user?.email)
          var account = { email: user?.email, name: user?.name, token: token, role: user?.email == 'admin@admin.com' ? 'admin' : 'user' }
          if (idx >= 0) existing[idx] = account
          else existing.push(account)
          window.localStorage.setItem('accounts', JSON.stringify(existing))
          window.localStorage.setItem('activeAccount', user?.email)
          window.localStorage.setItem("token", token)
          window.localStorage.setItem("roles", account.role)
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
                type={showPassword ? 'text' : 'password'}
                onChange={(e) => { setAmount(e.target.value); setAmountError() }}
              />
              <button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </button>
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
