import { useState } from 'react';
import { api } from '../api';

const AuthForm = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await api.auth.login(email, password)
          : await api.auth.register(email, password, username);
      localStorage.setItem('token', data.access_token);
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); };

  return (
    <div className="auth-form">
      <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
      <div className="gold-divider" />

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your display name" required />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="auth-switch">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button type="button" onClick={switchMode}>
          {mode === 'login' ? 'Register' : 'Sign in'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
