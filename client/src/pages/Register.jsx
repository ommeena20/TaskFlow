import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Logo, Field, Spinner } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../api.js';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) e.password = 'Use 8+ characters with at least one letter and one number';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true); setServerError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Welcome to TaskFlow!');
      navigate('/dashboard');
    } catch (err) { setServerError(errMsg(err)); } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/"><Logo /></Link>
        <h1>Create your account</h1>
        <p className="muted">Start organizing your work in under a minute.</p>
        {serverError && <div className="alert" role="alert">{serverError}</div>}
        <form onSubmit={submit} noValidate>
          <Field label="Name" htmlFor="name" error={errors.name}><input id="name" autoComplete="name" value={form.name} onChange={set('name')} /></Field>
          <Field label="Email" htmlFor="email" error={errors.email}><input id="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} /></Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <div className="input-icon">
              <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={errors.confirm}>
            <input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          </Field>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? <Spinner /> : 'Create account'}</button>
        </form>
        <p className="auth-alt">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
