import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field, Spinner } from '../components/ui.jsx';
import { fmtDate, initials } from '../utils/helpers.js';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [nameErr, setNameErr] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setNameErr('Name cannot be empty');
    setNameErr(''); setSavingName(true);
    try { const { data } = await api.patch('/users/me', { name: name.trim() }); setUser(data.user); toast.success('Name updated'); }
    catch (err) { toast.error(errMsg(err)); } finally { setSavingName(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.currentPassword) errs.currentPassword = 'Enter your current password';
    if (pw.newPassword.length < 8 || !/[A-Za-z]/.test(pw.newPassword) || !/\d/.test(pw.newPassword)) errs.newPassword = 'Use 8+ characters with a letter and a number';
    if (pw.confirm !== pw.newPassword) errs.confirm = 'Passwords do not match';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setSavingPw(true);
    try {
      await api.patch('/users/me', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      toast.success('Password changed'); setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(errMsg(err)); } finally { setSavingPw(false); }
  };

  return (
    <div className="page narrow">
      <div className="page-head"><div><h1>Profile & settings</h1><p className="muted">Manage your account details.</p></div></div>

      <div className="card profile-head">
        <div className="avatar lg">{initials(user.name)}</div>
        <div><h2>{user.name}</h2><p className="muted">{user.email}</p><p className="muted small">Member since {fmtDate(user.createdAt)}</p></div>
      </div>

      <form className="card" onSubmit={saveName} noValidate>
        <h2>Display name</h2>
        <Field label="Name" htmlFor="pname" error={nameErr}><input id="pname" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email" htmlFor="pemail"><input id="pemail" value={user.email} disabled /></Field>
        <button className="btn btn-primary" disabled={savingName || name.trim() === user.name}>{savingName ? <Spinner /> : 'Save name'}</button>
      </form>

      <form className="card" onSubmit={savePassword} noValidate>
        <h2>Change password</h2>
        <Field label="Current password" htmlFor="cp" error={pwErrors.currentPassword}><input id="cp" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
        <Field label="New password" htmlFor="np" error={pwErrors.newPassword}><input id="np" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
        <Field label="Confirm new password" htmlFor="cnp" error={pwErrors.confirm}><input id="cnp" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
        <button className="btn btn-primary" disabled={savingPw}>{savingPw ? <Spinner /> : 'Update password'}</button>
      </form>

      <div className="card between wrap">
        <div><h2>Log out</h2><p className="muted">End your session on this device.</p></div>
        <button className="btn btn-danger-ghost" onClick={async () => { await logout(); toast.success('Logged out'); navigate('/login'); }}><LogOut size={16} /> Log out</button>
      </div>
    </div>
  );
}
