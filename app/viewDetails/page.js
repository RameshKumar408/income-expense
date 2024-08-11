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

    const [datas, setDatas] = useState()

    const router = useRouter();

    const getDetails = async () => {
        try {
            setDatas([])
            const res = await fetch(`${constant?.Live_url}/api/incomes`, {
                cache: "no-store",
            });

            if (!res.ok) {
                throw new Error("Failed to fetch topics");
            }
            var top = await res.json()
            setDatas(top?.topics)
        } catch (error) {
            console.log("Error loading topics: ", error);
        }
    }

    useEffect(() => {
        getDetails()
    }, [])

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
                <div>From</div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                        <DatePicker label="Basic date picker" />
                    </DemoContainer>
                </LocalizationProvider>
            </div>

            <div style={{ marginTop: "10px" }}>
                <div>To</div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                        <DatePicker label="Basic date picker" />
                    </DemoContainer>
                </LocalizationProvider>
            </div>
            <div style={{ marginTop: '20px' }}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 700 }} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Date</StyledTableCell>
                                <StyledTableCell >Income</StyledTableCell>
                                <StyledTableCell >Expense</StyledTableCell>
                                <StyledTableCell >Action</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {datas?.length > 0 && datas?.map((row) => (
                                <StyledTableRow key={row._id}>
                                    <StyledTableCell>
                                        {row.Date}
                                    </StyledTableCell>
                                    {
                                        row?.Type == "Income" ?
                                            <StyledTableCell >
                                                <div>  {row?.Title}</div>
                                                <div> {row.Amount}</div>
                                            </StyledTableCell>
                                            :
                                            <StyledTableCell >
                                            </StyledTableCell>
                                    }
                                    <StyledTableCell >
                                        {
                                            row?.Type != "Income" ?
                                                <StyledTableCell >
                                                    <div>  {row?.Title}</div>
                                                    <div> {row.Amount}</div>
                                                </StyledTableCell>
                                                :
                                                <StyledTableCell >
                                                </StyledTableCell>
                                        }
                                    </StyledTableCell>

                                    <StyledTableCell>
                                        <Button variant="outlined" onClick={() => { removeTopic(row?._id) }} >Delete</Button>
                                        <Link href={`/editDetails/${row?._id}`}> <Button variant="outlined" >Edit</Button></Link>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

        </>

    )

}