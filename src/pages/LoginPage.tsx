import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@roasist.com');
    setPassword('RoasistAdmin2026!');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.15), transparent 60%), #0b0f19',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Background Decor Elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25), transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2), transparent 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.5rem 2rem',
        border: '1px solid var(--border-accent)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.15)',
        position: 'relative',
        zIndex: 1,
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(124, 58, 237, 0.5)',
            marginBottom: '1rem',
          }}>
            <Sparkles size={30} color="white" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.35rem' }} className="gradient-text">
            Roasist AI Suite
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Kurumsal Pazarlama & Reklam İstihbarat Platformu
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              E-posta Adresi
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="ornek@roasist.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Şifre
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              justifyContent: 'center',
              marginTop: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Giriş Yapılıyor...
              </>
            ) : (
              <>
                Güvenli Giriş Yap <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

        {/* Demo Fast Login Box */}
        <div style={{
          marginTop: '1.75rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>Yönetici Girişi: <strong>admin@roasist.com</strong></div>
            <div>Şifre: <strong>RoasistAdmin2026!</strong></div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoFill}
            style={{
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              color: '#c084fc',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Doldur
          </button>
        </div>

        {/* Footer Security Badge */}
        <div style={{
          marginTop: '1.75rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
        }}>
          <ShieldCheck size={14} color="#34d399" />
          <span>256-Bit SSL Şifreli • Roasist Güvenli Oturum</span>
        </div>

      </div>

    </div>
  );
};
