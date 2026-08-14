import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem',
      position: 'relative',
    }}>
      
      {/* Top Right Theme Toggle */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Açık Moda Geç' : 'Karanlık Moda Geç'}
          className="btn-ghost"
          style={{
            padding: '0.4rem 0.65rem',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Açık Mod</span>
            </>
          ) : (
            <>
              <Moon size={15} color="var(--text-secondary)" />
              <span>Karanlık Mod</span>
            </>
          )}
        </button>
      </div>

      {/* Container */}
      <div style={{
        maxWidth: '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--bg-app)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            R
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Roasist Marketing Suite
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Kurumsal pazarlama hesabınıza giriş yapın
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{
          padding: '2rem',
        }}>
          
          {/* Error Alert */}
          {error && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                E-posta Adresi
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="admin@roasist.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.25rem',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '2.25rem',
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
                padding: '0.7rem',
                justifyContent: 'center',
                marginTop: '0.4rem',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Doğrulanıyor...
                </>
              ) : (
                <>
                  Giriş Yap <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Fill Box */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div>Yönetici: <strong style={{ color: 'var(--text-secondary)' }}>admin@roasist.com</strong></div>
            </div>

            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
              }}
            >
              Bilgileri Doldur
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          Roasist Marketing Intelligence OS • v1.2 Enterprise
        </div>

      </div>

    </div>
  );
};
