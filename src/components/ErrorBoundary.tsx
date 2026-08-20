import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-default, #e2e8f0)',
          margin: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: '0.5rem' }}>
            Arayüz Yüklenirken Bir Sorun Oluştu
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #64748b)', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Tarayıcı eklentisi (çeviri/reklam engelleyici) veya anlık veri güncellemesi nedeniyle bir hata meydana geldi. Sayfayı yenileyerek çalışmaya devam edebilirsiniz.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-default, #cbd5e1)',
                backgroundColor: 'var(--bg-surface-elevated, #f8fafc)',
                color: 'var(--text-primary, #1e293b)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Yeniden Dene
            </button>
            <button
              onClick={this.handleReload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--brand-primary, #2563eb)',
                color: '#ffffff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Sayfayı Yenile
            </button>
          </div>

          {this.state.error && (
            <details style={{ marginTop: '0.5rem', maxWidth: '600px', width: '100%', textAlign: 'left' }}>
              <summary style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', textAlign: 'center' }}>
                Hata Teknik Detayı
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-elevated, #0f172a)',
                color: '#ef4444',
                fontSize: '0.72rem',
                borderRadius: '6px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace'
              }}>
                {this.state.error.toString()}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
