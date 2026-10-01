'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalculateIcon from '@mui/icons-material/Calculate';
import CloseIcon from '@mui/icons-material/Close';
import { useLoader } from '@/app/context/LoaderContext';

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const displayValueRef = useRef(0);

    useEffect(() => {
        let startTime;
        const duration = 500; // 1.2s animation
        const startValue = displayValueRef.current;
        const endValue = Number(value) || 0;

        if (startValue === endValue) return;

        let animationFrame;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function: easeOutQuart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentVal = startValue + (endValue - startValue) * easeOut;

            setDisplayValue(currentVal);
            displayValueRef.current = currentVal;

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
                displayValueRef.current = endValue;
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);

    return Number(displayValue).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

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
    const [loading, setLoading] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollYRef = useRef(0);
    const isInteracting = useRef(false);

    // Pull-to-refresh state
    const pullStartY = useRef(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { showLoader, hideLoader } = useLoader();

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
        const date = row?.TimeStamp ? dayjs(row.TimeStamp) : null;
        return date?.isValid() ? date.format('DD-MMM-YY hh:mm A') : '';
    };

    const saveCalcHistory = (history) => {
        setCalcHistory(history);
        window.localStorage.setItem('calculatorHistory', JSON.stringify(history));
    };

    const getDetails = useCallback(async ({ text = '', requestRole = '', userId = '' } = {}) => {
        try {
            setLoading(true);
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
                    setLoading(false);
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
        } finally {
            setLoading(false);
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
        const handleScroll = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                if (loading) {
                    if (!showHeader) setShowHeader(true);
                    lastScrollYRef.current = currentScrollY;
                    return;
                }

                // Prevent hiding if user is interacting with the header or has focus inside it (specifically an input)
                const headerEl = document.getElementById('history-sticky-header');
                const isFocused = headerEl && headerEl.contains(document.activeElement) && document.activeElement.tagName === 'INPUT';

                if (isInteracting.current || isFocused) {
                    lastScrollYRef.current = currentScrollY;
                    return;
                }

                if (currentScrollY > lastScrollYRef.current && currentScrollY - lastScrollYRef.current > 15 && currentScrollY > 50) {
                    setShowHeader(false);
                    lastScrollYRef.current = currentScrollY;
                } else if (currentScrollY < lastScrollYRef.current && lastScrollYRef.current - currentScrollY > 15) {
                    setShowHeader(true);
                    lastScrollYRef.current = currentScrollY;
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, showHeader]);

    useEffect(() => {
        if (role == 'admin') {
            usersLists();
        }
    }, [role, usersLists]);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const rect = entry.boundingClientRect;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;

                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    entry.target.classList.remove('out-view-top', 'out-view-bottom');
                } else {
                    entry.target.classList.remove('in-view');
                    // Check if it's above or below viewport
                    if (rect.top < windowHeight / 2) {
                        entry.target.classList.add('out-view-top');
                        entry.target.classList.remove('out-view-bottom');
                    } else {
                        entry.target.classList.add('out-view-bottom');
                        entry.target.classList.remove('out-view-top');
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '-5% 0px -5% 0px'
        });

        const elements = document.querySelectorAll('.scroll-animate');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [filteredDatas]);

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

    const handlePullStart = (e) => {
        if (window.scrollY <= 5 && !loading && !isRefreshing) {
            pullStartY.current = e.touches[0].clientY;
        } else {
            pullStartY.current = null;
        }
    };

    const handlePullMove = (e) => {
        if (pullStartY.current !== null) {
            const currentY = e.touches[0].clientY;
            const diff = currentY - pullStartY.current;
            if (diff > 0) {
                const distance = Math.min(diff * 0.4, 80);
                setPullDistance(distance);
                // Prevent native pull to refresh if possible, though React passive listeners might not let this work entirely
            }
        }
    };

    const handlePullEnd = async () => {
        if (pullDistance >= 60 && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(60);
            if (navigator.vibrate) navigator.vibrate(50);

            await getDetails({ requestRole: role, userId: selectedUser });

            setIsRefreshing(false);
            setPullDistance(0);
        } else {
            setPullDistance(0);
        }
        pullStartY.current = null;
    };

    return (
        <div
            className='history-page'
            onTouchStart={handlePullStart}
            onTouchMove={handlePullMove}
            onTouchEnd={handlePullEnd}
        >
            <style>{`
                @keyframes ptr-spin { 100% { transform: rotate(360deg); } }
                .ptr-spinning { animation: ptr-spin 1s linear infinite; }
            `}</style>

            <div style={{
                height: `${pullDistance}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: isRefreshing || pullDistance === 0 ? 'height 0.3s ease' : 'none',
                color: 'var(--text-secondary)'
            }}>
                {pullDistance > 10 && (
                    <div style={{
                        transform: `rotate(${isRefreshing ? 0 : pullDistance * 4}deg)`,
                    }}>
                        <svg className={isRefreshing ? 'ptr-spinning' : ''} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: Math.min(pullDistance / 60, 1) }}>
                            <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-11.1l5.5 5.5" />
                        </svg>
                    </div>
                )}
            </div>

            <main className='history-shell'>
                <div
                    id='history-sticky-header'
                    className={`history-sticky-wrapper ${showHeader ? '' : 'hidden'}`}
                    onPointerDown={() => {
                        isInteracting.current = true;
                        setTimeout(() => { isInteracting.current = false; }, 800);
                    }}
                >
                    <header className='history-header' style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', width: '100%', alignItems: 'center', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s', opacity: showSearch ? 0 : 1, transform: showSearch ? 'translateX(-20px)' : 'translateX(0)', pointerEvents: showSearch ? 'none' : 'auto' }}>
                            <div className='history-title-wrap'>
                                <span className='history-title-icon'>
                                    <img src="/icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'scale(1.3)' }} />
                                </span>
                                <h1>History</h1>
                            </div>
                            <button
                                className='history-search-toggle'
                                type='button'
                                aria-label='Search history'
                                onClick={() => { setShowSearch(true) }}
                                style={{ marginLeft: 'auto' }}
                            >
                                <SearchIcon />
                            </button>
                        </div>

                        <form className='history-search-form' onSubmit={submitSearch} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s', opacity: showSearch ? 1 : 0, transform: showSearch ? 'translateX(0)' : 'translateX(20px)', pointerEvents: showSearch ? 'auto' : 'none' }}>
                            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', height: '100%' }}>
                                <input
                                    value={searchText}
                                    placeholder='Search title'
                                    type='search'
                                    onChange={(e) => { setSearchText(e.target.value) }}
                                    style={{ width: '100%', height: '100%', paddingRight: '48px' }}
                                    autoFocus={showSearch}
                                />
                                <button
                                    type='submit'
                                    aria-label='Search'
                                    style={{ position: 'absolute', right: '4px', height: '100%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                    <SearchIcon />
                                </button>
                            </div>
                            <button
                                className='history-search-toggle'
                                type='button'
                                aria-label='Close search'
                                onClick={() => {
                                    setShowSearch(false);
                                    setSearchText('');
                                    isInteracting.current = true;
                                    setTimeout(() => { isInteracting.current = false; }, 800);
                                    getDetails({ requestRole: role, userId: selectedUser });
                                }}
                                style={{ color: 'var(--accent-expense)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <CloseIcon />
                            </button>
                        </form>
                    </header>

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
                            <input value={from} type='date' onClick={(e) => { e.target.showPicker && e.target.showPicker() }} onChange={(e) => { setFrom(e.target.value) }} />
                            <em>{formatInputDate(from)}</em>
                        </label>

                        <label>
                            <span>End date<b>*</b></span>
                            <input value={to} type='date' onClick={(e) => { e.target.showPicker && e.target.showPicker() }} onChange={(e) => { setTo(e.target.value) }} />
                            <em>{formatInputDate(to)}</em>
                        </label>
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
                </div>

                <section className='history-list' aria-label='History records'>
                    {loading ? (
                        <div className="skeleton-container">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className='history-skeleton-card'>
                                    <div className="skeleton-text-group">
                                        <div className="skeleton-title" />
                                        <div className="skeleton-date" />
                                    </div>
                                    <div className="skeleton-amount" />
                                </div>
                            ))}
                        </div>
                    ) : filteredDatas?.length > 0 ? filteredDatas.map((row, index) => (
                        <button
                            className={`history-card scroll-animate`}
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
                        <strong>₹<AnimatedNumber value={totalBalance} /></strong>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className='history-round-btn'
                            type='button'
                            aria-label='View Analytics'
                            onClick={() => { router.push(`/details?from=${from}&to=${to}`) }}
                        >
                            <PieChartIcon />
                        </button>
                        <button
                            className='history-round-btn'
                            type='button'
                            aria-label='Open calculator'
                            onClick={() => { setShowCalculator(true) }}
                        >
                            <CalculateIcon />
                        </button>
                    </div>
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
                            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord?.Description || 'No description'}</p>

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
{/* <Link className='bottom-nav-item' href='/details' aria-label='Analytics'>
                        <PieChartIcon />
                    </Link> */}
                    <Link className='bottom-nav-item' href='/settings' aria-label='Settings'>
                        <SettingsIcon />
                    </Link>
                </nav>
            </main>
        </div>
    );
}
