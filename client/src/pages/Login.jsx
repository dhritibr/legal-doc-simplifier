import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.data.user, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed — check your credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
  <div className="auth-left-top">
    <div className="auth-left-logo">
      <span>⚖</span>
      <span>LegalSimplify</span>
    </div>
    <div className="auth-headline">30 seconds to understand 30 pages.</div>
    <div className="auth-tagline">
      AI-powered legal document analysis in your language.<br/>
      Know your rights before you sign.
    </div>
  </div>
  <div className="auth-left-bottom">
    <div className="auth-stats">
      <div className="auth-stat">
        <div className="auth-stat-num">8+</div>
        <div className="auth-stat-label">Languages</div>
      </div>
      <div className="auth-stat">
        <div className="auth-stat-num">&lt;30s</div>
        <div className="auth-stat-label">Analysis time</div>
      </div>
      <div className="auth-stat">
        <div className="auth-stat-num">AI</div>
        <div className="auth-stat-label">Powered</div>
      </div>
      <div className="auth-stat">
        <div className="auth-stat-num">Free</div>
        <div className="auth-stat-label">Always</div>
      </div>
    </div>
  </div>
</div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-form-title">Sign in</div>
          <div className="auth-form-sub">Welcome back — enter your details below</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;