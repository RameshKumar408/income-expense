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

import Button from '@mui/material/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

import constant from '../../constant'
import dayjs from 'dayjs';

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

    const [datas, setDatas] = useState()
    const [totalcount, setTotalCount] = useState("")

    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")

    const [fromTimestamp, setFromTimestamp] = useState()
    const [toTimestamp, setToTimestamp] = useState()

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
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ From: fromTimestamp, To: toTimestamp }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch topics");
            }
            var top = await res.json()
            setDatas(top?.topics)
            if (top?.totalCount?.length > 0) {
                setTotalCount(top?.totalCount[0])
            } else {
                setTotalCount("")
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
                headers: {
                    "Content-type": "application/json",
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
        if (fromTimestamp && toTimestamp) {
            getDetails()
        }
    }, [fromTimestamp, toTimestamp]);

    const removeTopic = async (id) => {
        const res = await fetch(`${constant?.Live_url}/api/incomes?id=${id}`, {
            method: "DELETE",
        });
        if (res?.ok) {
            getDetails()
        }
    };

    return (
        <>
            <Link href="/">
                <Button variant="outlined">Back</Button>
            </Link>
            <div style={{ marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { getTodayTimeStamp() }}>ReSet</Button>
            </div >

            <div style={{ marginTop: "10px" }}>
                <Button variant="outlined" onClick={() => { Export() }}>Export</Button>
            </div >
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
            <div style={{ marginTop: "10px" }}>
                <div>
                    Total Income: {formatIndianNumber(totalcount?.totalIncome)}
                </div>
                <div>
                    Total Expense: {formatIndianNumber(totalcount?.totalExpense)}
                </div>
                <div>
                    Balance: {formatIndianNumber(totalcount?.netIncome)}
                </div>
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableContainer component={Paper}>
                    <Table aria-label="customized table">
                        {/* <TableHead>
                            <TableRow>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell >Income</StyledTableCell>
                                <StyledTableCell >Expense</StyledTableCell>
                                <StyledTableCell >Action</StyledTableCell>
                            </TableRow>
                        </TableHead> */}
                        <TableBody>
                            {datas?.length > 0 && datas?.map((row) => (
                                <StyledTableRow key={row._id}>


                                    <StyledTableCell >
                                        <div style={{ fontSize: "17px" }}>{row?.Type}</div>
                                        <div style={{ fontSize: "15px" }}>  {row?.Title}</div>
                                    </StyledTableCell>

                                    <StyledTableCell >
                                        {
                                            row?.Type == "Income" ?
                                                <StyledTableCell >
                                                    <div style={{ color: "green", fontSize: "17px" }}> +{formatIndianNumber(row.Amount)}</div>
                                                    <div style={{ fontSize: "15px" }}>  {row.Date}</div>
                                                </StyledTableCell>
                                                :
                                                <StyledTableCell >
                                                    <div style={{ color: "red", fontSize: "17px" }}> -{formatIndianNumber(row.Amount)}</div>
                                                    <div style={{ fontSize: "15px" }}>  {row.Date}</div>
                                                </StyledTableCell>
                                        }
                                    </StyledTableCell>

                                    {/* <StyledTableCell>
                                        <Button variant="outlined" onClick={() => { removeTopic(row?._id) }} >Delete</Button>
                                        <Link href={`/editDetails/${row?._id}`}> <Button variant="outlined" >Edit</Button></Link>
                                    </StyledTableCell> */}
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

        </>

    )

}