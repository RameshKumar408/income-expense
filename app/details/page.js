'use client'

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import PieChartIcon from '@mui/icons-material/PieChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dynamic from 'next/dynamic';
import GlowingBubbles from '@/components/GlowingBubbles';

const Pie = dynamic(() => import('../../components/Charts').then((mod) => mod.Pie), { ssr: false });
const Bar = dynamic(() => import('../../components/Charts').then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import('../../components/Charts').then((mod) => mod.Line), { ssr: false });

export default function Analytics() {
    const router = useRouter();
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const token = window?.localStorage?.getItem('token');
        if (!token) {
            router.push('/');
        }
        setRole(window?.localStorage?.getItem("roles"));
    }, [router]);

    const getData = useCallback(async () => {
        try {
            setLoading(true);
            let queryFrom = null;
            let queryTo = null;
            
            if (typeof window !== 'undefined') {
                const searchParams = new URLSearchParams(window.location.search);
                queryFrom = searchParams.get('from');
                queryTo = searchParams.get('to');
            }
            
            const fromTimestamp = queryFrom 
                ? dayjs(queryFrom).startOf('day').valueOf() 
                : dayjs().startOf('month').valueOf();
            const toTimestamp = queryTo 
                ? dayjs(queryTo).endOf('day').valueOf() 
                : dayjs().endOf('month').valueOf();

            const body = { 
                From: fromTimestamp, 
                To: toTimestamp 
            };
            
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
        } catch (error) {
            console.log('Error loading topics: ', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        getData();
    }, [getData]);

    // Compute metrics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};

    const normalizeTitle = (title) => {
        let t = (title || 'Other').trim();
        if (!t) return 'Other';
        return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    };

    datas.forEach(item => {
        const amt = Number(item.Amount) || 0;
        if (item.Type === 'Income') {
            totalIncome += amt;
        } else {
            totalExpense += amt;
            const title = normalizeTitle(item.Title);
            categoryTotals[title] = (categoryTotals[title] || 0) + amt;
        }
    });

    const pieOptions = {
        plugins: {
            legend: { display: false },
        },
    };

    const pieColors = [
        '#ff3053', '#ffad35', '#1d64ff', '#598cff', '#ff6b81', '#2ed573', '#a6c4ff', '#ff9f43', '#10ac84', '#5f27cd'
    ];

    const pieData = {
        labels: Object.keys(categoryTotals),
        datasets: [
            {
                label: 'Expenses',
                data: Object.values(categoryTotals),
                backgroundColor: pieColors.slice(0, Object.keys(categoryTotals).length),
                borderWidth: 0,
            },
        ],
    };

    const barData = {
        labels: ['Income', 'Expense'],
        datasets: [
            {
                label: 'Amount (₹)',
                data: [totalIncome, totalExpense],
                backgroundColor: ['#2ed573', '#ff3053'],
                borderRadius: 8,
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } }
        }
    };

    // Compute Daily Spend Trend
    const dailySpends = {};
    datas.forEach(item => {
        if (item.Type === 'Expense') {
            const dateKey = dayjs(item.TimeStamp).format('MMM DD');
            const amt = Number(item.Amount) || 0;
            dailySpends[dateKey] = (dailySpends[dateKey] || 0) + amt;
        }
    });

    const sortedDailyKeys = Object.keys(dailySpends).sort((a, b) => dayjs(a, 'MMM DD').valueOf() - dayjs(b, 'MMM DD').valueOf());
    
    const lineData = {
        labels: sortedDailyKeys,
        datasets: [
            {
                label: 'Daily Spend (₹)',
                data: sortedDailyKeys.map(k => dailySpends[k]),
                borderColor: '#ff3053',
                backgroundColor: 'rgba(255, 48, 83, 0.2)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#ff3053',
                tension: 0.3
            }
        ]
    };

    // Compute Daily Average Spend
    let daysDiff = 1;
    if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const queryFrom = searchParams.get('from');
        const queryTo = searchParams.get('to');
        const dFrom = queryFrom ? dayjs(queryFrom) : dayjs().startOf('month');
        const dTo = queryTo ? dayjs(queryTo) : dayjs().endOf('month');
        daysDiff = Math.max(1, dTo.diff(dFrom, 'day') + 1);
    }
    const dailyAvg = totalExpense / daysDiff;

    const glassStyle = {
        background: 'rgba(35, 35, 40, 0.4)', /* Slightly lighter base so it stands out from pitch black */
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
    };

    return (
        <div className='create-detail-page'>
            <GlowingBubbles />
            <main className='history-shell'>
                <header className='history-header' style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{ justifySelf: 'start', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </button>
                    <div className='history-title-wrap' style={{ margin: 0, justifySelf: 'center' }}>
                        <span className='history-title-icon'>
                            <img src="/icon.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'screen', transform: 'scale(1.3)' }} />
                        </span>
                        <h1>Analytics</h1>
                    </div>
                    <div />
                </header>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className='history-skeleton-card' style={{ height: '110px', borderRadius: '16px' }} />
                        <div className='history-skeleton-card' style={{ height: '300px', borderRadius: '16px' }} />
                        <div className='history-skeleton-card' style={{ height: '300px', borderRadius: '16px' }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
                        <div className='analytics-card' style={{ ...glassStyle, flexDirection: 'column', alignItems: 'flex-start', minHeight: 'auto', gap: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Overview</h2>
                            <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Total Income</p>
                                    <strong style={{ fontSize: '22px', color: '#2ed573' }}>₹{totalIncome.toLocaleString('en-IN')}</strong>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Total Expense</p>
                                    <strong style={{ fontSize: '22px', color: '#ff3053' }}>₹{totalExpense.toLocaleString('en-IN')}</strong>
                                </div>
                            </div>
                            <div style={{ width: '100%', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Daily Average Spend</p>
                                <strong style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)' }}>₹{dailyAvg.toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>/ day</span></strong>
                            </div>
                        </div>

                        <div className='analytics-card' style={{ ...glassStyle, flexDirection: 'column', alignItems: 'flex-start', minHeight: '300px', cursor: 'default' }}>
                            <h2 style={{ fontSize: '18px', margin: '0 0 20px', color: 'rgba(255,255,255,0.8)' }}>Expense Breakdown</h2>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                                {Object.keys(categoryTotals).length > 0 ? (
                                    <>
                                        <div style={{ width: '100%', maxWidth: '240px' }}>
                                            <Pie data={pieData} options={pieOptions} />
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', width: '100%' }}>
                                            {Object.keys(categoryTotals).map((key, i) => (
                                                <button 
                                                    key={key} 
                                                    type="button"
                                                    onClick={() => setSelectedCategory(key)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', border: 'none', borderRadius: '16px', cursor: 'pointer' }}
                                                >
                                                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: pieColors[i % pieColors.length] }}></span>
                                                    {key} (₹{categoryTotals[key].toLocaleString('en-IN')})
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>No expenses recorded this month.</p>
                                )}
                            </div>
                        </div>

                        <div className='analytics-card' style={{ ...glassStyle, flexDirection: 'column', alignItems: 'flex-start', minHeight: '300px', cursor: 'default' }}>
                            <h2 style={{ fontSize: '18px', margin: '0 0 20px', color: 'rgba(255,255,255,0.8)' }}>Cash Flow</h2>
                            <div style={{ width: '100%', flex: 1, minHeight: '200px' }}>
                                <Bar data={barData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                            </div>
                        </div>

                        <div className='analytics-card' style={{ ...glassStyle, flexDirection: 'column', alignItems: 'flex-start', minHeight: '300px', cursor: 'default' }}>
                            <h2 style={{ fontSize: '18px', margin: '0 0 20px', color: 'rgba(255,255,255,0.8)' }}>Daily Spend Trend</h2>
                            <div style={{ width: '100%', flex: 1, minHeight: '200px' }}>
                                {sortedDailyKeys.length > 0 ? (
                                    <Line data={lineData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.5)' }}>No expenses recorded to trend.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedCategory && (
                    <div className='record-detail-overlay' role='dialog' aria-modal='true' aria-label={`${selectedCategory} details`} onClick={() => setSelectedCategory(null)} style={{ zIndex: 100000 }}>
                        <section className='record-detail-sheet' onClick={(event) => event.stopPropagation()} style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div className='record-detail-head' style={{ flexShrink: 0 }}>
                                <div>
                                    <h2>{selectedCategory}</h2>
                                    <span>₹{categoryTotals[selectedCategory]?.toLocaleString('en-IN')} Total</span>
                                </div>
                                <button type='button' onClick={() => setSelectedCategory(null)}>Close</button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0', marginTop: '16px', paddingBottom: '30px', paddingRight: '4px' }}>
                                {datas.filter(item => item.Type === 'Expense' && normalizeTitle(item.Title) === selectedCategory).map(item => (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>{dayjs(item.TimeStamp).format('DD MMM YYYY, hh:mm A')}</span>
                                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{item.Description || 'No description'}</span>
                                        </div>
                                        <strong style={{ fontSize: '15px', color: '#ff3053' }}>₹{Number(item.Amount || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                <nav className='bottom-nav history-bottom-nav' aria-label='Main actions'>
                    <Link className='bottom-nav-item' href='/createDetail' aria-label='Create details'>
                        <HomeOutlinedIcon />
                    </Link>
                    {role == 'admin' &&
                        <Link className='bottom-nav-item' href='/authorize' aria-label='Google drive'>
                            <ExploreOutlinedIcon />
                        </Link>
                    }
                    <Link className='bottom-nav-item' href='/viewDetails' aria-label='History'>
                        <SearchIcon />
                    </Link>
{/* <Link className='bottom-nav-item active history-center-nav' href='/details' aria-label='Analytics'>
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
