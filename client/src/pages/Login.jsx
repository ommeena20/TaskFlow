import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../api.js';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  if (user) return <Navigate to={redirectTo} replace />;

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Enter your password';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true); setServerError('');
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) { setServerError(errMsg(err)); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/"><Logo /></Link>
        <h1>Welcome back</h1>
        <p className="muted">Log in to continue to your dashboard.</p>
        {serverError && <div className="alert" role="alert">{serverError}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="Email" htmlFor="email" error={errors.email}><input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <div className="input-icon">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </Field>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Spinner /> : 'Log in'}</button>
        </form>
        <p className="auth-alt">New to TaskFlow? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
