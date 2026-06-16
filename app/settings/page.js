"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function SettingsPage() {
    const [role, setRole] = useState();
    const [accounts, setAccounts] = useState([]);
    const router = useRouter();

    const logout = () => {
        var activeEmail = window.localStorage.getItem('activeAccount')
        var list = JSON.parse(window.localStorage.getItem('accounts') || '[]')
        if (list.length > 1) {
            var remaining = list.filter(a => a.email != activeEmail)
            window.localStorage.setItem('accounts', JSON.stringify(remaining))
            var next = remaining[0]
            window.localStorage.setItem('token', next.token)
            window.localStorage.setItem('roles', next.role)
            window.localStorage.setItem('activeAccount', next.email)
            toast.success(`Removed account. Switched to ${next.email}`)
            setTimeout(() => window.location.reload(), 600)
        } else {
            window.localStorage.setItem('accounts', JSON.stringify([]))
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("roles");
            window.localStorage.removeItem("activeAccount");
            router.push('/');
        }
    };

    const addAccount = () => {
        router.push('/?add=1');
    };

    useEffect(() => {
        setRole(window.localStorage.getItem("roles"));
        setAccounts(JSON.parse(window.localStorage.getItem('accounts') || '[]'));
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
                        <span>{accounts.length > 1 ? 'Remove account' : 'Logout'}</span>
                    </button>

                    <button className='settings-action' type='button' onClick={addAccount}>
                        <PersonAddIcon />
                        <span>Add account</span>
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
