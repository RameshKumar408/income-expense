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
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title as ChartTitle } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle);

export default function Analytics() {
    const router = useRouter();
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

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
            const fromTimestamp = dayjs().startOf('month').valueOf();
            const toTimestamp = dayjs().endOf('month').valueOf();
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

    datas.forEach(item => {
        const amt = Number(item.Amount) || 0;
        if (item.Type === 'Income') {
            totalIncome += amt;
        } else {
            totalExpense += amt;
            const title = item.Title || 'Other';
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

    return (
        <div className='create-detail-page'>
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
                        <div className='history-card' style={{ flexDirection: 'column', alignItems: 'flex-start', minHeight: 'auto', gap: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>This Month Overview</h2>
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
                        </div>

                        <div className='history-card' style={{ flexDirection: 'column', alignItems: 'flex-start', minHeight: '300px', cursor: 'default' }}>
                            <h2 style={{ fontSize: '18px', margin: '0 0 20px', color: 'rgba(255,255,255,0.8)' }}>Expense Breakdown</h2>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                                {Object.keys(categoryTotals).length > 0 ? (
                                    <>
                                        <div style={{ width: '100%', maxWidth: '240px' }}>
                                            <Pie data={pieData} options={pieOptions} />
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', width: '100%' }}>
                                            {Object.keys(categoryTotals).map((key, i) => (
                                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: pieColors[i % pieColors.length] }}></span>
                                                    {key} (₹{categoryTotals[key].toLocaleString('en-IN')})
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ color: 'rgba(255,255,255,0.5)' }}>No expenses recorded this month.</p>
                                )}
                            </div>
                        </div>

                        <div className='history-card' style={{ flexDirection: 'column', alignItems: 'flex-start', minHeight: '300px', cursor: 'default' }}>
                            <h2 style={{ fontSize: '18px', margin: '0 0 20px', color: 'rgba(255,255,255,0.8)' }}>Cash Flow</h2>
                            <div style={{ width: '100%', flex: 1, minHeight: '200px' }}>
                                <Bar data={barData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                            </div>
                        </div>
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
