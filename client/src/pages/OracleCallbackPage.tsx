import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageLoader } from '../components/ui/Loader';

/**
 * OracleCallbackPage
 *
 * Oracle IDCS redirects here after the user authenticates:
 *   /auth/oracle/callback?code=<authCode>&state=<state>
 *
 * This page:
 *  1. Validates the CSRF state token
 *  2. Exchanges the auth code for a DevXGen JWT via AuthContext.loginOracle
 *  3. Navigates to the home page on success, or shows an error
 */
const OracleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { loginOracle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const processed = useRef(false); // Prevent double-execution in StrictMode

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const savedState = sessionStorage.getItem('oracle_oauth_state');

    // Clean up state from sessionStorage
    sessionStorage.removeItem('oracle_oauth_state');

    // Validate CSRF state
    if (!returnedState || returnedState !== savedState) {
      setError('Invalid or mismatched state parameter. This may be a CSRF attempt. Please try signing in again.');
      return;
    }

    if (!code) {
      setError('No authorization code received from Oracle. Please try again.');
      return;
    }

    // Exchange code for JWT
    loginOracle(code)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => {
        console.error('Oracle callback error:', err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Oracle authentication failed. Please try again.';
        setError(msg);
      });
  }, [loginOracle, navigate, searchParams]);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-surface-950 px-6"
        id="oracle-callback-error"
      >
        <div className="glass-card p-8 max-w-md w-full text-center">
          {/* Oracle icon */}
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <svg
              className="h-10 w-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-surface-100 mb-2">Oracle Sign-On Failed</h1>
          <p className="text-surface-400 text-sm mb-6">{error}</p>

          <button
            id="oracle-retry-btn"
            onClick={() => navigate('/login', { replace: true })}
            className="btn-primary text-sm px-6 py-2.5"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-surface-950 gap-4"
      id="oracle-callback-loading"
    >
      <PageLoader />
      <p className="text-surface-400 text-sm animate-pulse">
        Completing Oracle sign-on…
      </p>
    </div>
  );
};

export default OracleCallbackPage;
