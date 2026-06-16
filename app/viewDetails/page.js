'use client'

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalculateIcon from '@mui/icons-material/Calculate';

export default function Page() {
    const router = useRouter();
    const [datas, setDatas] = useState([]);
    const [totalCount, setTotalCount] = useState(null);
    const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchText, setSearchText] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [role, setRole] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [sortKey, setSortKey] = useState('date');
    const [showCalculator, setShowCalculator] = useState(false);
    const [calcValue, setCalcValue] = useState('0');
    const [calcHistory, setCalcHistory] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [touchStartX, setTouchStartX] = useState(null);

    const formatIndianNumber = (num) => {
        const value = Number(num || 0);
        return value.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const dateToStart = (value) => dayjs(value).startOf('day').valueOf();
    const dateToEnd = (value) => dayjs(value).endOf('day').valueOf();

    const formatInputDate = (value) => dayjs(value).format('DD MMMM YYYY');

    const formatHistoryDate = (row) => {
        const date = row?.createdAt ? dayjs(row.createdAt) : dayjs(row?.TimeStamp);
        return date.isValid() ? date.format('DD-MMM-YY hh:mm A') : '';
    };

    const saveCalcHistory = (history) => {
        setCalcHistory(history);
        window.localStorage.setItem('calculatorHistory', JSON.stringify(history));
    };

    const getDetails = useCallback(async ({ text = '', requestRole = '', userId = '' } = {}) => {
        try {
            const fromTimestamp = dateToStart(from);
            const toTimestamp = dateToEnd(to);
            const body = {
                From: fromTimestamp,
                To: toTimestamp,
            };

            if (text?.trim()) {
                body.text = text.trim();
            }

            if (requestRole == 'admin') {
                if (!userId) {
                    return;
                }
                body.id = userId;
            }

            const res = await fetch(`/api/getDateRange`, {
                method: 'POST',
                cache: 'no-store',
                headers: {
                    'Content-type': 'application/json',
                    authorization: `${window?.localStorage?.getItem('token')}`,
                },
                body: JSON.stringify(body),
            });

            if (res.status == 400) {
                router.push('/');
                return;
            }

            const response = await res.json();
            setDatas(response?.topics || []);
            setTotalCount(response?.totalCount?.[0] || null);
        } catch (error) {
            console.log('Error loading topics: ', error);
        }
    }, [from, to, router]);

    const usersLists = useCallback(async (currentText = '') => {
        try {
            const data = await fetch(`/api/web/usersList`, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Content-type': 'application/json',
                    authorization: `${window?.localStorage?.getItem('token')}`,
                },
            });
            const dts = await data.json();
            if (dts?.result?.length > 0) {
                setUsers(dts.result);
                setSelectedUser(dts.result[0]?._id);
                getDetails({ text: currentText, requestRole: 'admin', userId: dts.result[0]?._id });
            }
        } catch (error) {
            console.log('usersLists error: ', error);
        }
    }, [getDetails]);

    const filteredDatas = useMemo(() => {
        const list = [...(datas || [])];
        if (sortKey == 'title') {
            return list.sort((a, b) => `${a?.Title || ''}`.localeCompare(`${b?.Title || ''}`));
        }
        if (sortKey == 'amount') {
            return list.sort((a, b) => Number(b?.Amount || 0) - Number(a?.Amount || 0));
        }
        return list.sort((a, b) => Number(b?.TimeStamp || 0) - Number(a?.TimeStamp || 0));
    }, [datas, sortKey]);

    const totalBalance = totalCount?.netIncome || 0;

    useEffect(() => {
        const currentRole = window?.localStorage?.getItem('roles') || '';
        setRole(currentRole);
        const storedHistory = window?.localStorage?.getItem('calculatorHistory');
        if (storedHistory) {
            try {
                setCalcHistory(JSON.parse(storedHistory) || []);
            } catch (error) {
                setCalcHistory([]);
            }
        }
    }, []);

    useEffect(() => {
        if (role == 'admin') {
            usersLists();
        }
    }, [role, usersLists]);

    useEffect(() => {
        if (role == 'admin' && !selectedUser) {
            return;
        }
        getDetails({ requestRole: role, userId: selectedUser });
    }, [from, to, selectedUser, role, getDetails]);

    const submitSearch = (e) => {
        e?.preventDefault();
        getDetails({ text: searchText, requestRole: role, userId: selectedUser });
    };

    const pressCalculator = (value) => {
        if (value == 'C') {
            setCalcValue('0');
            return;
        }
        if (value == 'DEL') {
            setCalcValue((current) => current.length > 1 ? current.slice(0, -1) : '0');
            return;
        }
        if (value == '=') {
            try {
                const expression = calcValue.replaceAll('×', '*').replaceAll('÷', '/');
                if (!/^[0-9+\-*/.()%\s]+$/.test(expression)) {
                    return;
                }
                const result = Function(`"use strict"; return (${expression})`)();
                if (!Number.isFinite(result)) {
                    return;
                }
                const formatted = `${Number(result.toFixed(8))}`;
                const nextHistory = [{ expression: calcValue, result: formatted }, ...calcHistory].slice(0, 8);
                saveCalcHistory(nextHistory);
                setCalcValue(formatted);
            } catch (error) {
                setCalcValue('0');
            }
            return;
        }
        setCalcValue((current) => current == '0' ? value : `${current}${value}`);
    };

    const clearCalculatorHistory = () => {
        saveCalcHistory([]);
        window.localStorage.removeItem('calculatorHistory');
    };

    const handleRecordTouchEnd = (row, event) => {
        if (touchStartX == null) {
            return;
        }
        const endX = event.changedTouches?.[0]?.clientX || touchStartX;
        if (touchStartX - endX > 70) {
            router.push(`/editDetails/${row?._id}`);
        }
        setTouchStartX(null);
    };

    return (
        <div className='history-page'>
            <main className='history-shell'>
                <header className='history-header'>
                    <div className='history-title-wrap'>
                        <span className='history-title-icon'>
                            <AccountBalanceWalletIcon />
                        </span>
                        <h1>History</h1>
                    </div>
                    <button
                        className='history-search-toggle'
                        type='button'
                        aria-label='Search history'
                        onClick={() => { setShowSearch(!showSearch) }}
                    >
                        <SearchIcon />
                    </button>
                </header>

                {showSearch &&
                    <form className='history-search-form' onSubmit={submitSearch}>
                        <input
                            value={searchText}
                            placeholder='Search title'
                            type='search'
                            onChange={(e) => { setSearchText(e.target.value) }}
                        />
                        <button type='submit' aria-label='Search'>
                            <SearchIcon />
                        </button>
                    </form>
                }

                {role == 'admin' &&
                    <select
                        className='history-account-select'
                        value={selectedUser}
                        onChange={(e) => { setSelectedUser(e.target.value) }}
                        aria-label='Select account'
                    >
                        {users?.map((user) => (
                            <option key={user?._id} value={user?._id}>{user?.Name}</option>
                        ))}
                    </select>
                }

                <form className='history-date-form' onSubmit={submitSearch}>
                    <label>
                        <span>Start date<b>*</b></span>
                        <input value={from} type='date' onChange={(e) => { setFrom(e.target.value) }} />
                        <em>{formatInputDate(from)}</em>
                    </label>

                    <label>
                        <span>End date<b>*</b></span>
                        <input value={to} type='date' onChange={(e) => { setTo(e.target.value) }} />
                        <em>{formatInputDate(to)}</em>
                    </label>

                    <button className='history-date-submit' type='submit' aria-label='Apply date search'>
                        <ArrowForwardIcon />
                    </button>
                </form>

                <div className='history-sort-row' aria-label='Sort history'>
                    <button type='button' onClick={() => { setSortKey('title') }}>
                        Title <span className={sortKey == 'title' ? 'active' : ''}></span>
                    </button>
                    <button type='button' onClick={() => { setSortKey('date') }}>
                        Date <span className={sortKey == 'date' ? 'active' : ''}></span>
                    </button>
                    <button type='button' onClick={() => { setSortKey('amount') }}>
                        Amount <span className={sortKey == 'amount' ? 'active' : ''}></span>
                    </button>
                </div>

                <section className='history-list' aria-label='History records'>
                    {filteredDatas?.length > 0 ? filteredDatas.map((row, index) => (
                        <button
                            className={`history-card ${index % 2 == 0 ? 'muted' : ''}`}
                            key={row?._id}
                            type='button'
                            onClick={() => { setSelectedRecord(row) }}
                            onDoubleClick={() => { router.push(`/editDetails/${row?._id}`) }}
                            onTouchStart={(event) => { setTouchStartX(event.touches?.[0]?.clientX) }}
                            onTouchEnd={(event) => { handleRecordTouchEnd(row, event) }}
                        >
                            <span>
                                <strong>{row?.Title}</strong>
                                <small>{formatHistoryDate(row)}</small>
                            </span>
                            <b className={row?.Type == 'Income' ? 'income' : 'expense'}>
                                ₹{formatIndianNumber(row?.Amount)}
                            </b>
                        </button>
                    )) : (
                        <div className='history-empty'>No data found</div>
                    )}
                </section>

                <div className='history-floating-actions'>
                    <div className='history-balance'>
                        <span>Total balance</span>
                        <strong>₹{formatIndianNumber(totalBalance)}</strong>
                    </div>
                    <button
                        className='history-round-btn'
                        type='button'
                        aria-label='Open calculator'
                        onClick={() => { setShowCalculator(true) }}
                    >
                        <CalculateIcon />
                    </button>
                </div>

                {showCalculator &&
                    <div className='calculator-overlay' role='dialog' aria-modal='true' aria-label='Calculator'>
                        <div className='calculator-popup'>
                            <div className='calculator-header'>
                                <h2>Calculator</h2>
                                <button type='button' onClick={() => { setShowCalculator(false) }}>Close</button>
                            </div>

                            <output className='calculator-display'>{calcValue}</output>

                            <div className='calculator-grid'>
                                {['C', 'DEL', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map((item) => (
                                    <button
                                        className={item == '=' ? 'equals' : ''}
                                        key={item}
                                        type='button'
                                        onClick={() => { pressCalculator(item) }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>

                            <section className='calculator-history' aria-label='Calculation history'>
                                <div className='calculator-history-head'>
                                    <h3>History</h3>
                                    {calcHistory.length > 0 &&
                                        <button type='button' onClick={clearCalculatorHistory}>
                                            Clear
                                        </button>
                                    }
                                </div>
                                {calcHistory.length > 0 ? calcHistory.map((item, index) => (
                                    <button className='calculator-history-item' key={`${item.expression}-${index}`} type='button' onClick={() => { setCalcValue(item.result) }}>
                                        <span>{item.expression}</span>
                                        <strong>{item.result}</strong>
                                    </button>
                                )) : (
                                    <p>No calculations yet</p>
                                )}
                            </section>
                        </div>
                    </div>
                }

                {selectedRecord &&
                    <div className='record-detail-overlay' role='dialog' aria-modal='true' aria-label='History details' onClick={() => { setSelectedRecord(null) }}>
                        <section className='record-detail-sheet' onClick={(event) => { event.stopPropagation() }}>
                            <div className='record-detail-head'>
                                <div>
                                    <h2>{selectedRecord?.Title}</h2>
                                    <span>{formatHistoryDate(selectedRecord)}</span>
                                </div>
                                <button type='button' onClick={() => { setSelectedRecord(null) }}>Close</button>
                            </div>

                            <div className='record-detail-amount'>
                                <span>{selectedRecord?.Type}</span>
                                <strong className={selectedRecord?.Type == 'Income' ? 'income' : 'expense'}>
                                    ₹{formatIndianNumber(selectedRecord?.Amount)}
                                </strong>
                            </div>

                            <p>{selectedRecord?.Description || 'No description'}</p>

                            <button className='record-detail-edit' type='button' onClick={() => { router.push(`/editDetails/${selectedRecord?._id}`) }}>
                                Edit
                            </button>
                        </section>
                    </div>
                }

                <nav className='bottom-nav history-bottom-nav' aria-label='Main actions'>
                    <Link className='bottom-nav-item' href='/createDetail' aria-label='Create details'>
                        <HomeOutlinedIcon />
                    </Link>
                    {role == 'admin' &&
                        <Link className='bottom-nav-item' href='/authorize' aria-label='Google drive'>
                            <ExploreOutlinedIcon />
                        </Link>
                    }
                    <Link className='bottom-nav-item active history-center-nav' href='/viewDetails' aria-label='History'>
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
