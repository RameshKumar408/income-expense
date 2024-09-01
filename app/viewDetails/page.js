"use client"

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useRouter } from "next/navigation";

import constant from '../../constant'
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

import DoughnutChart from '../donughtChart/page'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

export default function Page() {

    function formatIndianNumber(num) {
        if (num) {
            const numString = num?.toString();
            const lastThreeDigits = numString?.slice(-3);
            const otherDigits = numString?.slice(0, -3);
            const formatted = otherDigits?.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits ? "," : "") + lastThreeDigits;
            return formatted;
        }
    }

    function getMonthSortNameAndTwoDigitDate(timestamp) {
        // Create a Date object from the timestamp
        const date = new Date(timestamp);

        // Get the day of the month and format it as a two-digit number
        const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits

        // Get the month name (short format)
        const options = { month: 'short' }; // 'short' gives abbreviated month names
        const monthName = date.toLocaleDateString('en-US', options); // Format the date

        // Combine month name and two-digit day
        return `${monthName} ${day}`; // e.g., "Jan 10" becomes "Jan 10"
    }

    var route = useRouter()
    const [datas, setDatas] = useState()
    const [totalcount, setTotalCount] = useState("")

    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")

    const [fromTimestamp, setFromTimestamp] = useState()
    const [toTimestamp, setToTimestamp] = useState()

    const [searchtext, setsearchtext] = useState("")

    const [totalIncome, setTotalIncome] = useState(0)
    const [totalExpense, setTotalExpense] = useState(0)
    const [balance, setBalance] = useState(0)

    const [users, setusers] = useState([])
    const [selcUsers, setSelecUsers] = useState("")
    // const searchtext = useRef(null)

    const handleDateChange = (date, type) => {
        var year = date?.$y
        var month = date?.$M + 1 >= 10 ? date?.$M + 1 : `0${date?.$M + 1}`
        var dates = date?.$D >= 10 ? date?.$D : `0${date?.$D}`
        if (type == "From") {
            setFrom(`${year}-${month}-${dates}`)
            const dateString = `${year}-${month}-${dates}`;
            const dateObject = new Date(dateString);
            const timestamp = dateObject.getTime();
            setFromTimestamp(timestamp)
        } else {
            setTo(`${year}-${month}-${dates}`)
            const dateString = `${year}-${month}-${dates}`;
            const dateObject = new Date(dateString);
            const timestamp = dateObject.getTime();
            setToTimestamp(timestamp)
        }
    };

    const getDetails = async () => {
        try {
            setDatas([])
            const res = await fetch(`${constant?.Live_url}/api/getDateRange`, {
                method: "POST",
                cache: 'no-store',
                headers: {
                    "Content-type": "application/json",
                    authorization: `${window.localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ From: fromTimestamp, To: toTimestamp }),
            });
            if (res.status == 400) {
                route.push('/')
            } else {
                var top = await res.json()
                setDatas(top?.topics)
                if (top?.totalCount?.length > 0) {
                    setTotalCount(top?.totalCount[0])
                    setTotalIncome(formatIndianNumber(top?.totalCount[0]?.totalIncome))
                    setTotalExpense(formatIndianNumber(top?.totalCount[0]?.totalExpense))
                    setBalance(formatIndianNumber(top?.totalCount[0]?.netIncome))
                } else {
                    setTotalCount("")
                }
            }
        } catch (error) {
            console.log("Error loading topics: ", error);
        }
    };

    const getDetailsAdmin = async () => {
        try {
            setDatas([])
            setTotalCount(0)
            setTotalIncome(0)
            setTotalExpense(0)
            setTotalExpense(0)
            const res = await fetch(`${constant?.Live_url}/api/getDateRange`, {
                method: "POST",
                cache: 'no-store',
                headers: {
                    "Content-type": "application/json",
                    authorization: `${window.localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ From: fromTimestamp, To: toTimestamp, id: selcUsers }),
            });
            if (res.status == 400) {
                route.push('/')
            } else {
                var top = await res.json()
                setDatas(top?.topics)
                if (top?.totalCount?.length > 0) {
                    setTotalCount(top?.totalCount[0])
                    setTotalIncome(formatIndianNumber(top?.totalCount[0]?.totalIncome))
                    setTotalExpense(formatIndianNumber(top?.totalCount[0]?.totalExpense))
                    setTotalExpense(formatIndianNumber(top?.totalCount[0]?.netIncome))
                } else {
                    setTotalCount("")
                }
            }
        } catch (error) {
            console.log("Error loading topics: ", error);
        }
    };

    const Export = async () => {
        try {
            // setDatas([])
            const res = await fetch(`${constant?.Live_url}/api/export`, {
                method: "POST",
                cache: 'no-store',
                headers: {
                    "Content-type": "application/json",
                    authorization: `${window.localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ From: fromTimestamp, To: toTimestamp }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch topics");
            }
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'income_data.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to download data');
            }

        } catch (error) {
            console.log("Error loading topics: ", error);
        }
    };

    const SendEmail = async () => {
        try {
            // setDatas([])
            const res = await fetch(`${constant?.Live_url}/api/sendMail`, {
                method: "POST",
                cache: 'no-store',
                headers: {
                    "Content-type": "application/json",
                    authorization: `${window.localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ From: fromTimestamp, To: toTimestamp }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch topics");
            }
            console.log(res, "res")
            if (res.ok) {
                toast.success("Send Successfully");
                console.log(await res.json())
            } else {
                toast.error("Something Went Wrong");
                console.log(await res.json())
            }
        } catch (error) {
            console.log("Error loading topics: ", error);
        }
    };

    const getTodayTimeStamp = async () => {
        try {
            const currentDate = new Date();

            // Get the first date of the current month
            const firstDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

            // Get the last date of the current month
            const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            // Convert to timestamps

            var fromyear = firstDate?.getFullYear()
            var frommonth = firstDate?.getMonth() + 1 >= 10 ? firstDate?.getMonth() + 1 : `0${firstDate?.getMonth() + 1}`
            var fromdat = firstDate?.getDate() >= 10 ? firstDate?.getDate() : `0${firstDate?.getDate()}`
            setFrom(`${fromyear}-${frommonth}-${fromdat}`)


            var toyear = lastDate?.getFullYear()
            var tomonth = lastDate?.getMonth() + 1 >= 10 ? lastDate?.getMonth() + 1 : `0${lastDate?.getMonth() + 1}`
            var todat = lastDate?.getDate() >= 10 ? lastDate?.getDate() : `0${lastDate?.getDate()}`
            setTo(`${toyear}-${tomonth}-${todat}`)

            const firstDateTimestamp = firstDate.getTime();
            const lastDateTimestamp = lastDate.getTime();
            setFromTimestamp(firstDateTimestamp)
            setToTimestamp(lastDateTimestamp)
        } catch (error) {
            console.log("🚀 ~ getTodayTimeStamp ~ error:", error)
        }
    }

    useEffect(() => {
        getTodayTimeStamp()
    }, []);

    useEffect(() => {
        if (window.localStorage.getItem("roles") === "admin") {
            if (fromTimestamp && toTimestamp) {
                getDetailsAdmin()
            }
        } else {
            if (fromTimestamp && toTimestamp) {
                getDetails()
            }
        }

    }, [fromTimestamp, toTimestamp, selcUsers]);

    const removeTopic = async (id) => {
        const res = await fetch(`${constant?.Live_url}/api/incomes?id=${id}`, {
            method: "DELETE",
            cache: 'no-store',
        });
        if (res?.ok) {
            getDetails()
        }
    };

    const usersLists = async () => {
        try {
            const data = await fetch(`${constant?.Live_url}/api/web/usersList`, {
                method: "GET",
                cache: 'no-store',
                headers: {
                    "Content-type": "application/json",
                    authorization: `${window.localStorage.getItem("token")}`,
                }
            })
            const dts = await data.json()
            if (dts?.result?.length > 0) {
                setusers(dts?.result)
                setSelecUsers(dts?.result[0]?._id)
            }
        } catch (error) {
            console.log("🚀 ~ usersLists ~ error:", error)

        }
    }

    useEffect(() => {
        if (window.localStorage.getItem("roles") == "admin") {
            usersLists()
        }
    }, [])

    const handleChangeAcc = async (type) => {
        setSelecUsers(type?.target.value)
    }

    const searchValues = async () => {
        try {
            if (searchtext) {
                try {
                    setDatas([])
                    const res = await fetch(`${constant?.Live_url}/api/getDateRange`, {
                        method: "POST",
                        cache: 'no-store',
                        headers: {
                            "Content-type": "application/json",
                            authorization: `${window.localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({ From: fromTimestamp, To: toTimestamp, text: searchtext }),
                    });
                    console.log(res, "res")
                    if (res.status == 400) {
                        route.push('/')
                    } else {
                        var top = await res.json()
                        setDatas(top?.topics)
                        if (top?.totalCount?.length > 0) {
                            setTotalCount(top?.totalCount[0])
                        } else {
                            setTotalCount("")
                        }
                    }
                } catch (error) {
                    console.log("Error loading topics: ", error);
                }
            }
        } catch (error) {
            console.log("🚀 ~ searchValues ~ error:", error)
        }
    }

    return (
        <>
            <div className='btns-div'>
                <div style={{ marginTop: "10px" }}>
                    <Link href="/createDetail">
                        <Button variant="outlined">Back</Button>
                    </Link>
                </div>
                <div style={{ marginTop: "10px" }}>
                    <Button variant="outlined" onClick={() => { getTodayTimeStamp() }}>ReSet</Button>
                </div >

                <div style={{ marginTop: "10px" }}>
                    <Button variant="outlined" onClick={() => { Export() }}>Export</Button>
                </div >
            </div>


            {/* <div style={{ marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { SendEmail() }}>SendEmail</Button>
            </div > */}

            <div style={{ marginTop: "10px" }}>
                <div>From</div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                        {
                            from != "" ?
                                <DatePicker label="Basic date picker" value={dayjs(from)} onChange={(e) => { handleDateChange(e, "From") }} />
                                :
                                <DatePicker label="Basic date picker" onChange={(e) => { handleDateChange(e, "From") }} />
                        }

                    </DemoContainer>
                </LocalizationProvider>
            </div>

            <div style={{ marginTop: "10px" }}>
                <div>To</div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                        {
                            to != "" ?
                                <DatePicker label="Basic date picker" value={dayjs(to)} onChange={(e) => { handleDateChange(e, "To") }} />
                                :
                                <DatePicker label="Basic date picker" onChange={(e) => { handleDateChange(e, "To") }} />
                        }

                    </DemoContainer>
                </LocalizationProvider>
            </div>
            <div style={{ marginTop: "10px", color: "black" }}>
                <div>
                    Total Income: {totalIncome}
                </div>
                <div>
                    Total Expense: {totalExpense}
                </div>
                <div>
                    Balance: {balance}
                </div>
            </div>

            {
                totalcount?.totalExpense != undefined && totalcount?.totalIncome != undefined &&
                <div>
                    <DoughnutChart datas={[totalcount?.totalExpense ? totalcount?.totalExpense : 0, totalcount?.totalIncome ? totalcount?.totalIncome : 0]} />
                </div>
            }



            <div style={{ marginTop: "10px" }}>
                <TextField id="outlined-basic" label="Search" variant="outlined" value={searchtext} onChange={(e) => { setsearchtext(e.target.value) }} />
                {/* <TextField id="outlined-basic" label="Search" variant="outlined" inputRef={searchtext} /> */}
            </div>

            <div style={{ marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { searchValues(); }}>Search</Button>
            </div >

            <div style={{ marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { getDetails(); setsearchtext("") }}>Search Reset</Button>
            </div >

            {
                window.localStorage.getItem("roles") == "admin" &&
                <div style={{ marginTop: "10px" }}>
                    <Box sx={{ minWidth: 120 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Account</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selcUsers}
                                label="Age"
                                onChange={handleChangeAcc}
                            >

                                {users?.length > 0 &&
                                    users?.map((row, index) => {
                                        return <MenuItem key={index} value={row?._id}>{row?.Name}</MenuItem>
                                    })
                                }


                            </Select>
                        </FormControl>
                    </Box>
                    {/* {accTypeError ? <div style={{ textAlign: "center", color: "red", fontSize: "18px" }}>{accTypeError}</div> : <></>} */}
                </div>
            }

            <div style={{ marginTop: '20px' }}>
                <TableContainer component={Paper}>
                    <Table aria-label="customized table">
                        {/* <TableHead>
                            <TableRow>
                                <StyledTableCell></StyledTableCell>
                                <StyledTableCell ></StyledTableCell>
                            </TableRow>
                              <Button variant="outlined" onClick={() => { removeTopic(row?._id) }} >Delete</Button>
                                        <Link href={`/editDetails/${row?._id}`}> <Button variant="outlined" >Edit</Button></Link>
                        </TableHead> */}
                        <TableBody>
                            {datas?.length > 0 ? datas?.map((row) => (
                                <StyledTableRow key={row._id} onClick={() => { route.push(`/editDetails/${row?._id}`) }}>
                                    <StyledTableCell >
                                        <p style={{ fontSize: "17px" }}> {row?.Type} </p>
                                        <p style={{ fontSize: "15px" }}>  {row?.Title}</p>
                                    </StyledTableCell>

                                    <StyledTableCell >
                                        {
                                            row?.Type == "Income" ?
                                                // <StyledTableCell >
                                                <>
                                                    <p style={{ color: "green", fontSize: "17px" }}> {formatIndianNumber(row.Amount)}</p>
                                                    {/* <p style={{ fontSize: "15px" }}>  {`${row.Date?.split('-')[1]}-${row.Date?.split('-')[2]}`}</p> */}
                                                    <p style={{ fontSize: "15px" }}>  {getMonthSortNameAndTwoDigitDate(row?.TimeStamp)}</p>
                                                </>
                                                // </StyledTableCell>
                                                :
                                                // <StyledTableCell >
                                                <>
                                                    <p style={{ color: "red", fontSize: "17px" }}> {formatIndianNumber(row.Amount)}</p>
                                                    {/* <p style={{ fontSize: "15px" }}>  {`${row.Date?.split('-')[1]}-${row.Date?.split('-')[2]}`}</p> */}
                                                    <p style={{ fontSize: "15px" }}>   {getMonthSortNameAndTwoDigitDate(row?.TimeStamp)}</p>
                                                </>
                                            // </StyledTableCell>
                                        }
                                    </StyledTableCell>

                                    {/* <StyledTableCell>
                                        <Button variant="outlined" onClick={() => { removeTopic(row?._id) }} >Delete</Button>
                                        <Link href={`/editDetails/${row?._id}`}> <Button variant="outlined" >Edit</Button></Link>
                                    </StyledTableCell> */}
                                </StyledTableRow>
                            ))
                                :
                                <TableRow>
                                    <TableCell colSpan={2} style={{ textAlign: "center" }}>
                                        <p style={{ fontSize: "17px" }}>No data found</p>
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </div >
        </>

    )

}