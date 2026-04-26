import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="brand-icon">⚖</span>
          <span className="brand-name">LegalSimplify</span>
        </Link>
      </div>
      <div className="nav-right">
        <button
  className="theme-toggle"
  onClick={() => setDark(d => !d)}
  title={dark ? 'Switch to light' : 'Switch to dark'}
>
  {dark ? '○' : '●'}
</button>
        {user && (
          <>
            <span className="nav-user">{user.name.split(' ')[0]}</span>
            <Link to="/dashboard" className="nav-link">My Docs</Link>
            <Link to="/upload" className="nav-btn">+ Upload</Link>
            <button onClick={handleLogout} className="nav-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;