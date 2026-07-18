"use client"

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AddCardIcon from '@mui/icons-material/AddCard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import constant from '@/constant';
import { decodeToken } from '@/libs/jwt';
import { toast } from 'react-toastify';
import { useLoader } from '@/app/context/LoaderContext';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';


export default function Home() {
    const isMobile = useMediaQuery('(max-width:520px)', { noSsr: true });
    const isShortMobile = useMediaQuery('(max-width:520px) and (max-height:700px)', { noSsr: true });
    const [dateValue, setDateValue] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Expense');
    const [TimeStamp, setTimeStamp] = useState(dayjs().valueOf());
    const [accType, setAccType] = useState('')

    const [selectedDateError, setSelectedDateError] = useState('')
    const [topicError, setTopicError] = useState('')
    const [descriptionError, setDescriptionError] = useState('')
    const [amountError, setAmountError] = useState('')
    const [typeError, setTypeError] = useState('')
    const [accTypeError, setAccTypeError] = useState('')

    const handleChange = (event) => {
        setType(event.target.value);
        setTypeError("")
    };

    const handleChangeAcc = (event) => {
        setAccType(event.target.value);
        setAccTypeError("")
    }

    const handleDateChange = (date) => {
        if (!date || !date.isValid()) {
            setDateValue(null);
            setSelectedDate('');
            setTimeStamp('');
            setSelectedDateError("Please Select Date");
            return;
        }
        setDateValue(date);
        var year = date?.$y
        var month = date?.$M + 1 >= 10 ? date?.$M + 1 : `0${date?.$M + 1}`
        var dates = date?.$D >= 10 ? date?.$D : `0${date?.$D}`
        setSelectedDate(`${year}-${month}-${dates}`);

        setTimeStamp(date.valueOf())
        setSelectedDateError()
    };

    const [titleSuggestions, setTitleSuggestions] = useState([]);

    useEffect(() => {
        const fetchTitles = async () => {
            try {
                var threeMonthsAgo = dayjs().subtract(3, 'month').startOf('day').valueOf()
                var now = dayjs().endOf('day').valueOf()
                var res = await fetch(`${constant?.Live_url}/api/getDateRange`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        authorization: window.localStorage.getItem('token')
                    },
                    body: JSON.stringify({ From: threeMonthsAgo, To: now }),
                })
                var data = await res.json()
                if (data?.topics?.length) {
                    var seenTitles = new Set()
                    var unique = data.topics.reduce((list, item) => {
                        var normalizedTitle = item?.Title?.trim()
                        if (!normalizedTitle) {
                            return list
                        }

                        var dedupeKey = normalizedTitle.toLowerCase()
                        if (seenTitles.has(dedupeKey)) {
                            return list
                        }

                        seenTitles.add(dedupeKey)
                        list.push(normalizedTitle)
                        return list
                    }, [])
                    setTitleSuggestions(unique)
                }
            } catch (error) {
                console.log('Error fetching titles:', error)
            }
        }
        fetchTitles()
    }, [])

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            backgroundColor: '#151515',
            borderRadius: { xs: '12px', sm: '14px' },
            fontSize: { xs: '16px', sm: '20px' },
            minHeight: { xs: '48px', sm: '66px' },
            '& fieldset': {
                borderColor: '#666a72',
                borderWidth: '1.5px',
            },
            '&:hover fieldset': {
                borderColor: '#8a8f99',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#2366d6',
                borderWidth: '1.5px',
            },
        },
        '& .MuiInputBase-input': {
            color: '#ffffff',
            padding: { xs: '11px 13px', sm: '18px 20px' },
        },
        '& .MuiInputBase-input::placeholder': {
            color: '#8c8c8c',
            opacity: 1,
        },
        '& input[type=number]': {
            MozAppearance: 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
        },
        '& .clear-field-button': {
            color: '#8c8c8c',
            marginRight: { xs: '-4px', sm: '2px' },
            '&:hover': {
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
        },
    };

    const clearButton = (label, onClear) => (
        <InputAdornment position='end'>
            <IconButton
                className='clear-field-button'
                type='button'
                size='small'
                aria-label={`Clear ${label}`}
                title={`Clear ${label}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClear}
            >
                <CloseIcon fontSize='small' />
            </IconButton>
        </InputAdornment>
    );

    const selectSx = {
        color: type == 'Expense' ? '#ff3b3f' : '#2fd06f',
        backgroundColor: '#050505',
        borderRadius: { xs: '12px', sm: '14px' },
        fontSize: { xs: '13px', sm: '20px' },
        fontWeight: 700,
        minHeight: { xs: '48px', sm: '66px' },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: type == 'Expense' ? '#ff3b3f' : '#2fd06f',
            borderWidth: '1.5px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: type == 'Expense' ? '#ff575a' : '#45df82',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: type == 'Expense' ? '#ff3b3f' : '#2fd06f',
            borderWidth: '1.5px',
        },
        '& .MuiSvgIcon-root': {
            color: type == 'Expense' ? '#ff3b3f' : '#2fd06f',
        },
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
            }
            // else if (accType == "") {
            //     setAccTypeError("Please Select Account Type")
            // } 
            else {
                showLoader()
                const res = await fetch(`${constant?.Live_url}/api/incomes`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    // body: JSON.stringify({ Title: topic, Amount: amount, Type: type, Description: description, Date: selectedDate, TimeStamp: TimeStamp, AccType: accType }),
                    body: JSON.stringify({ Title: topic, Amount: amount, Type: type, Description: description, Date: selectedDate, TimeStamp: TimeStamp }),
                });
                if (res?.ok) {
                    toast.success("Created Successfully");
                    setDateValue(dayjs());
                    setSelectedDate(dayjs().format('YYYY-MM-DD'));
                    setTopic('');
                    setDescription('');
                    setAmount('');
                    setType('Expense');
                    setTimeStamp(dayjs().valueOf());
                    setSelectedDateError('');
                    setTopicError('');
                    setDescriptionError('');
                    setAmountError('');
                    setTypeError('');
                    hideLoader()
                } else {
                    hideLoader()
                    toast.error("Something went wrong");
                    throw new Error("Failed to create a topic");
                }
            }
        } catch (error) {
            hideLoader()
            console.log("🚀 ~ handleSubmit ~ error:", error)
        }
    }

    const [role, setRole] = useState()
    const [accounts, setAccounts] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [showAccountMenu, setShowAccountMenu] = useState(false)
    const accountRef = useRef(null)
    const router = useRouter()
    const { showLoader, hideLoader } = useLoader()

    const loadAccounts = () => {
        try {
            var token = window.localStorage.getItem('token')
            var activeEmail = window.localStorage.getItem('activeAccount')
            var list = JSON.parse(window.localStorage.getItem('accounts') || '[]')
            setAccounts(list)
            setRole(window.localStorage.getItem('roles'))
            var active = list.find(a => a.email == activeEmail) || list.find(a => a.token == token) || list[0]
            if (active) {
                setCurrentUser(active)
                if (active.email != activeEmail) {
                    window.localStorage.setItem('activeAccount', active.email)
                }
            } else if (token) {
                var decoded = decodeToken(token)
                if (decoded) {
                    setCurrentUser({ email: decoded.email, name: decoded.name, token: token, role: decoded.role })
                }
            }
        } catch (error) {
            console.log("🚀 ~ loadAccounts ~ error:", error)
        }
    }

    const switchAccount = (account) => {
        window.localStorage.setItem('token', account.token)
        window.localStorage.setItem('roles', account.role)
        window.localStorage.setItem('activeAccount', account.email)
        setShowAccountMenu(false)
        toast.success(`Switched to ${account.email}`)
        setTimeout(() => window.location.reload(), 600)
    }

    const logoutAccount = () => {
        var activeEmail = window.localStorage.getItem('activeAccount')
        var list = JSON.parse(window.localStorage.getItem('accounts') || '[]')
        if (list.length > 1) {
            var remaining = list.filter(a => a.email != activeEmail)
            window.localStorage.setItem('accounts', JSON.stringify(remaining))
            var next = remaining[0]
            window.localStorage.setItem('token', next.token)
            window.localStorage.setItem('roles', next.role)
            window.localStorage.setItem('activeAccount', next.email)
            setShowAccountMenu(false)
            toast.success(`Removed account. Switched to ${next.email}`)
            setTimeout(() => window.location.reload(), 600)
        } else {
            window.localStorage.setItem('accounts', JSON.stringify([]))
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("roles");
            window.localStorage.removeItem("activeAccount");
            router.push('/');
        }
    }

    const addAccount = () => {
        router.push('/?add=1');
    }

    useEffect(() => {
        loadAccounts()
        var handleClick = (e) => { if (accountRef.current && !accountRef.current.contains(e.target)) setShowAccountMenu(false) }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    return (
        <>
            <div className='create-detail-page'>
                <main className='expense-shell'>
                    <header className='expense-header'>
                        <div className='expense-title-wrap'>
                            <span className='expense-title-icon'>
                                <AddCardIcon fontSize='small' />
                            </span>
                            <h1>Expenses</h1>
                        </div>
                        <div className='account-wrapper' ref={accountRef}>
                            <button type='button' className='account-pill' onClick={() => setShowAccountMenu(!showAccountMenu)}>
                                <span>{currentUser?.name || 'Account'}</span>
                                <ExpandMoreIcon fontSize='small' />
                            </button>
                            {showAccountMenu && accounts.length > 0 &&
                                <div className='account-menu'>
                                    {accounts.map((acc) => (
                                        <button
                                            key={acc.email}
                                            className={`account-menu-item ${acc.email == currentUser?.email ? 'active' : ''}`}
                                            type='button'
                                            onClick={() => { if (acc.email != currentUser?.email) switchAccount(acc) }}
                                        >
                                            <span className='account-menu-name'>{acc.name}</span>
                                            <span className='account-menu-email'>{acc.email}</span>
                                        </button>
                                    ))}
                                    <div className='account-menu-divider' />
                                    <button className='account-menu-action' type='button' onClick={addAccount}>
                                        <PersonAddIcon fontSize='small' />
                                        <span>Add account</span>
                                    </button>
                                    <button className='account-menu-action danger' type='button' onClick={logoutAccount}>
                                        <LogoutIcon fontSize='small' />
                                        <span>{accounts.length > 1 ? 'Remove account' : 'Logout'}</span>
                                    </button>
                                </div>
                            }
                        </div>
                    </header>

                    <form className='expense-form' onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label>Date<span>*</span></label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={dateValue}
                                    onChange={(e) => { handleDateChange(e) }}
                                    format={isMobile ? 'DD MMM hh:mm A' : 'dddd (DD MMMM YYYY hh:mm A)'}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            placeholder: 'Today',
                                            sx: inputSx,
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                            {selectedDateError ? <div className='field-error'>{selectedDateError}</div> : <></>}
                        </div>

                        <div className='form-group'>
                            <label>Title<span>*</span></label>
                            <TextField
                                value={topic}
                                placeholder='Title'
                                variant='outlined'
                                onChange={(e) => { setTopic(e.target.value); setTopicError("") }}
                                sx={inputSx}
                                fullWidth
                                InputProps={{
                                    endAdornment: topic
                                        ? clearButton('title', () => { setTopic(''); setTopicError(''); })
                                        : null,
                                }}
                            />
                            {titleSuggestions.length > 0 &&
                                <div className='suggestion-row' aria-label='Title suggestions'>
                                    {titleSuggestions.filter(s => !topic || s.toLowerCase().includes(topic.toLowerCase())).map((item) => (
                                        <button
                                            type='button'
                                            className='suggestion-chip'
                                            key={item}
                                            onClick={() => { setTopic(item); setTopicError(""); }}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            }
                            {topicError ? <div className='field-error'>{topicError}</div> : <></>}
                        </div>

                        <div className='form-group'>
                            <label>Description</label>
                            <TextField
                                value={description}
                                placeholder='Description'
                                variant='outlined'
                                multiline
                                minRows={isShortMobile ? 2 : isMobile ? 3 : 4}
                                onChange={(e) => { setDescription(e.target.value); setDescriptionError("") }}
                                sx={inputSx}
                                fullWidth
                                InputProps={{
                                    endAdornment: description
                                        ? clearButton('description', () => { setDescription(''); setDescriptionError(''); })
                                        : null,
                                }}
                            />
                            {descriptionError ? <div className='field-error'>{descriptionError}</div> : <></>}
                        </div>

                        <div className='form-row'>
                            <div className='form-group'>
                                <label>Amount<span>*</span></label>
                                <TextField
                                    value={amount}
                                    type='number'
                                    placeholder='Amount'
                                    variant='outlined'
                                    onChange={(e) => { setAmount(e.target.value); setAmountError() }}
                                    sx={inputSx}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: amount
                                            ? clearButton('amount', () => { setAmount(''); setAmountError(''); })
                                            : null,
                                    }}
                                />
                                {amountError ? <div className='field-error'>{amountError}</div> : <></>}
                            </div>

                            <div className='form-group'>
                                <label>Type<span>*</span></label>
                                <Box sx={{ minWidth: 0 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id='type-select-label' sx={{ display: 'none' }}>Type</InputLabel>
                                        <Select
                                            labelId='type-select-label'
                                            id='type-select'
                                            value={type}
                                            displayEmpty
                                            onChange={handleChange}
                                            sx={selectSx}
                                            IconComponent={CloseIcon}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        backgroundColor: '#151515',
                                                        color: '#ffffff',
                                                        border: '1px solid #343844',
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value={"Income"}>Income</MenuItem>
                                            <MenuItem value={"Expense"}>Expense</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                {typeError ? <div className='field-error'>{typeError}</div> : <></>}
                            </div>
                        </div>

                        <Button className='add-data-btn' variant='contained' type='submit'>
                            Add Data
                        </Button>
                    </form>

                    <nav className='bottom-nav' aria-label='Main actions'>
                        <Link className='bottom-nav-item active' href='/createDetail' aria-label='Create details'>
                            <HomeOutlinedIcon />
                        </Link>
                        {role == "admin" &&
                            <Link className='bottom-nav-item' href='/authorize' aria-label='Google drive'>
                                <ExploreOutlinedIcon />
                            </Link>
                        }
                        <Link className='bottom-nav-item' href='/viewDetails' aria-label='History'>
                            <SearchIcon />
                        </Link>
                        <Link className='bottom-nav-item' href='/settings' aria-label='Settings'>
                            <SettingsIcon />
                        </Link>
                    </nav>
                </main>
            </div>
        </>
    );
}
