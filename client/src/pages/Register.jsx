import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const LANGUAGES = [
  { value: 'english',   label: 'English' },
  { value: 'hindi',     label: 'Hindi — हिंदी' },
  { value: 'kannada',   label: 'Kannada — ಕನ್ನಡ' },
  { value: 'tamil',     label: 'Tamil — தமிழ்' },
  { value: 'telugu',    label: 'Telugu — తెలుగు' },
  { value: 'malayalam', label: 'Malayalam — മലയാളം' },
  { value: 'marathi',   label: 'Marathi — मराठी' },
  { value: 'bengali',   label: 'Bengali — বাংলা' }
];

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', preferredLanguage: 'english' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.data.user, res.data.data.token);
      navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <div className="auth-form-title">Create account</div>
          <div className="auth-form-sub">Start understanding your legal documents today</div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Full name</label><input name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" required /></div>
            <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ravi@example.com" required /></div>
            <div className="field"><label>Password</label><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required /></div>
            <div className="field">
              <label>Preferred language</label>
              <select name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;