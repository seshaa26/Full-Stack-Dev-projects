import React, { useState } from 'react';
import { getOracleLoginUrl } from '../../services/authService';

/**
 * OracleLoginButton
 * Fetches the Oracle IDCS authorization URL from the backend,
 * saves the CSRF state token to sessionStorage, then redirects
 * the user's browser to Oracle's login page.
 */
const OracleLoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOracleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { url, state } = await getOracleLoginUrl();

      // Persist state for CSRF validation on callback
      sessionStorage.setItem('oracle_oauth_state', state);

      // Redirect to Oracle IDCS login page
      window.location.href = url;
    } catch (err: any) {
      console.error('Oracle login error:', err);
      setError('Oracle sign-on is not configured. Please contact the administrator.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2" id="oracle-login-btn">
      <button
        onClick={handleOracleLogin}
        disabled={loading}
        className={`
          w-80 h-10 flex items-center justify-center gap-3 
          rounded-full font-medium text-sm transition-all duration-200
          border border-surface-600/60
          bg-surface-800/80 hover:bg-surface-700/80
          text-surface-200 hover:text-white
          hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]
          active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
          backdrop-blur-sm
        `}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Redirecting to Oracle…</span>
          </>
        ) : (
          <>
            {/* Oracle "O" logo */}
            <OracleLogo />
            <span>Sign in with Oracle</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center max-w-xs">{error}</p>
      )}
    </div>
  );
};

/** Oracle-branded SVG icon */
const OracleLogo: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Oracle"
  >
    {/* Oracle red ellipse */}
    <ellipse cx="12" cy="12" rx="11" ry="7.5" fill="#C74634" />
    <ellipse cx="12" cy="12" rx="7" ry="4.5" fill="#1A1A2E" />
  </svg>
);

export default OracleLoginButton;
