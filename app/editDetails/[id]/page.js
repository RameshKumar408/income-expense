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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import constant from '@/constant';
import { toast } from 'react-toastify';
import { useLoader } from '@/app/context/LoaderContext';

export default function Home({ params }) {
    const isMobile = useMediaQuery('(max-width:520px)', { noSsr: true });
    const isShortMobile = useMediaQuery('(max-width:520px) and (max-height:700px)', { noSsr: true });
    const [dateValue, setDateValue] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('Expense');
    const [TimeStamp, setTimeStamp] = useState('');
    const [role, setRole] = useState();

    const [selectedDateError, setSelectedDateError] = useState('');
    const [topicError, setTopicError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [amountError, setAmountError] = useState('');
    const [typeError, setTypeError] = useState('');

    const router = useRouter();
    const { showLoader, hideLoader } = useLoader();

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
    };

    const selectSx = {
        color: type == 'Expense' ? '#ff3b3f' : '#2fd06f',
        backgroundColor: '#050505',
        borderRadius: { xs: '12px', sm: '14px' },
        fontSize: { xs: '16px', sm: '20px' },
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

    const handleChange = (event) => {
        setType(event.target.value);
        setTypeError('');
    };

    const handleDateChange = (date) => {
        if (!date || !date.isValid()) {
            setDateValue(null);
            setSelectedDate('');
            setTimeStamp('');
            setSelectedDateError('Please Select Date');
            return;
        }

        setDateValue(date);
        const formattedDate = date.format('YYYY-MM-DD');
        setSelectedDate(formattedDate);
        setTimeStamp(date.valueOf());
        setSelectedDateError('');
    };

    const getPickerDateFromRecord = useCallback((item) => {
        const datePart = item?.Date ? dayjs(item.Date) : null;
        const timestampValue = Number(item?.TimeStamp);
        const timePart = Number.isFinite(timestampValue) ? dayjs(timestampValue) : null;

        if (datePart?.isValid()) {
            if (timePart?.isValid()) {
                return datePart
                    .hour(timePart.hour())
                    .minute(timePart.minute())
                    .second(timePart.second())
                    .millisecond(timePart.millisecond());
            }
            return datePart;
        }

        if (timePart?.isValid()) {
            return timePart;
        }

        return dayjs();
    }, []);

    const getDetails = useCallback(async (id) => {
        try {
            showLoader()
            const res = await fetch(`${constant?.Live_url}/api/getelementid`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "authorization": window.localStorage.getItem("token")
                },
                body: JSON.stringify({ Id: id }),
            });

            if (res.status == 400) {
                hideLoader()
                router.push('/');
                return;
            }

            const resp = await res?.json();
            if (resp?.topics) {
                const item = resp.topics;
                setTopic(item?.Title || '');
                setDescription(item?.Description || '');
                setAmount(item?.Amount || '');
                setType(item?.Type || 'Expense');
                const loadedDate = getPickerDateFromRecord(item);
                setDateValue(loadedDate);
                setSelectedDate(loadedDate.format('YYYY-MM-DD'));
                setTimeStamp(loadedDate.valueOf());
            }
        } catch (error) {
            console.log("getDetails error:", error);
        } finally {
            hideLoader()
        }
    }, [router, getPickerDateFromRecord, showLoader, hideLoader]);

    useEffect(() => {
        setRole(window.localStorage.getItem("roles"));
        if (params?.id) {
            getDetails(params.id);
        }
    }, [params?.id, getDetails]);

    const handleSubmit = async (e) => {
        try {
            e?.preventDefault();
            if (!selectedDate) {
                setSelectedDateError("Please Select Date");
            } else if (topic == "") {
                setTopicError("Please Enter Topic");
            } else if (description == "") {
                setDescriptionError("Please Enter Description");
            } else if ((amount == "") || (amount == 0)) {
                setAmountError("Please Enter Amount");
            } else if (type == "") {
                setTypeError("Please Select Type");
            } else {
                showLoader()
                const res = await fetch(`${constant?.Live_url}/api/getelementid`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                    body: JSON.stringify({
                        Id: params?.id,
                        Title: topic,
                        Amount: Number(amount),
                        Type: type,
                        Description: description,
                        Date: selectedDate,
                        TimeStamp,
                    }),
                });
                if (res?.ok) {
                    hideLoader()
                    toast.success("Updated Successfully");
                    router.push("/viewDetails");

                } else {
                    hideLoader()
                    toast.error("Something Went Wrong");
                }
            }
        } catch (error) {
            hideLoader()
            console.log("handleSubmit error:", error);
        }
    };

    const handleDelete = async () => {
        try {
            if (params?.id) {
                showLoader()
                const res = await fetch(`${constant?.Live_url}/api/incomes?id=${params.id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json",
                        "authorization": window.localStorage.getItem("token")
                    },
                });
                if (res?.ok) {
                    hideLoader()
                    toast.success("Deleted Successfully");
                    router.push("/viewDetails");
                } else {
                    hideLoader()
                    toast.error("Something Went Wrong");
                }
            }
        } catch (error) {
            hideLoader()
            console.log("handleDelete error:", error);
        }
    };

    return (
        <div className='create-detail-page'>
            <main className='expense-shell edit-shell'>
                <header className='expense-header'>
                    <div className='expense-title-wrap'>
                        <button className='expense-back-btn' type='button' aria-label='Go back' onClick={() => router.back()}>
                            <ArrowBackIcon />
                        </button>
                        <span className='expense-title-icon'>
                            <EditNoteIcon fontSize='small' />
                        </span>
                        <h1>Edit</h1>
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
                        />
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
                                onChange={(e) => { setAmount(e.target.value); setAmountError("") }}
                                sx={inputSx}
                                fullWidth
                            />
                            {amountError ? <div className='field-error'>{amountError}</div> : <></>}
                        </div>

                        <div className='form-group'>
                            <label>Type<span>*</span></label>
                            <Box sx={{ minWidth: 0 }}>
                                <FormControl fullWidth>
                                    <InputLabel id='edit-type-select-label' sx={{ display: 'none' }}>Type</InputLabel>
                                    <Select
                                        labelId='edit-type-select-label'
                                        id='edit-type-select'
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

                    <div className='edit-action-row'>
                        <Button className='add-data-btn edit-update-btn' variant='contained' type='submit'>
                            Update
                        </Button>
                        <Button className='delete-data-btn' variant='contained' type='button' onClick={handleDelete}>
                            <DeleteOutlineIcon />
                            Delete
                        </Button>
                    </div>
                </form>

                <nav className='bottom-nav' aria-label='Main actions'>
                    <Link className='bottom-nav-item' href='/createDetail' aria-label='Create details'>
                        <HomeOutlinedIcon />
                    </Link>
                    {role == "admin" &&
                        <Link className='bottom-nav-item' href='/authorize' aria-label='Google drive'>
                            <ExploreOutlinedIcon />
                        </Link>
                    }
                    <Link className='bottom-nav-item active' href='/viewDetails' aria-label='History'>
                        <SearchIcon />
                    </Link>
                    <Link className='bottom-nav-item' href='/settings' aria-label='Settings'>
                        <SettingsIcon />
                    </Link>
                </nav>
            </main>
        </div>
    );
}
