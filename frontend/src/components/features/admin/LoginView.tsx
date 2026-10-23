'use client';

// Admin panelga kirish: brauzerda parol, Telegram ichida — avtomatik (AdminShell'da)
import { useState, type FormEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/Field';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useAdmin } from '@/store/adminStore';

export function LoginView({ notAdmin }: { notAdmin?: boolean }) {
  const login = useAdmin((s) => s.login);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      const res = await adminApi.login(password);
      login(res.token, res.name);
    } catch (err) {
      if (err instanceof AdminApiError && err.code === 'wrong_password') {
        const left = Number(err.data.left ?? 0);
        setError(left > 0 ? `Parol noto‘g‘ri. Yana ${left} ta urinish qoldi` : 'Parol noto‘g‘ri');
      } else if (err instanceof AdminApiError && err.code === 'blocked') {
        setError(`Juda ko‘p xato urinish. ${String(err.data.minutes)} daqiqadan keyin qayta urining`);
      } else {
        setError('Server javob bermayapti. Birozdan keyin qayta urining');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <div className="brand">
          <img className="brand__logo" src="/images/icon-192.png" alt="" width={38} height={38} />
          <span className="brand__name">
            KROSS
            <br />
            <span>KOREA</span>
          </span>
        </div>
        <h1 className="login__title">Admin panel</h1>
        <p className="login__sub">Buyurtmalar, mahsulotlar va sozlamalarni boshqarish uchun kiring.</p>

        {notAdmin && (
          <p className="alert alert--warn">
            <Icon name="info" size={18} /> Siz hali admin emassiz. Botga <b>/admin PAROL</b> yozing yoki parol bilan kiring.
          </p>
        )}

        <TextField
          label="Parol"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          autoFocus
        />
        <button type="submit" className="btn btn--primary btn--block" disabled={busy || !password}>
          {busy ? '…' : 'Kirish'} <Icon name="arrowRight" size={18} />
        </button>
      </form>
    </main>
  );
}
