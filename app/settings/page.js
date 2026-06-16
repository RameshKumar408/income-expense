"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';

export default function SettingsPage() {
    const [role, setRole] = useState();
    const router = useRouter();

    const clearSession = () => {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("roles");
    };

    const logout = () => {
        clearSession();
        router.push('/');
    };

    const switchAccount = () => {
        clearSession();
        router.push('/');
    };

    useEffect(() => {
        setRole(window.localStorage.getItem("roles"));
    }, []);

    return (
        <div className='create-detail-page'>
            <main className='expense-shell settings-shell'>
                <header className='settings-header'>
                    <span className='settings-title-icon'>
                        <SettingsIcon />
                    </span>
                    <h1>Settings</h1>
                </header>

                <section className='settings-actions' aria-label='Account settings'>
                    <button className='settings-action danger' type='button' onClick={logout}>
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>

                    <button className='settings-action' type='button' onClick={switchAccount}>
                        <SwitchAccountIcon />
                        <span>Switch account</span>
                    </button>
                </section>

                <nav className='bottom-nav' aria-label='Main actions'>
                    <Link className='bottom-nav-item' href='/createDetail' aria-label='Create details'>
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
                    <Link className='bottom-nav-item active' href='/settings' aria-label='Settings'>
                        <SettingsIcon />
                    </Link>
                </nav>
            </main>
        </div>
    );
}
