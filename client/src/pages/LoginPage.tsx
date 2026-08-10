import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Terminal, Zap, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" id="login-page">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-surface-950">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDgsMTYzLDE4NCwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60" />
      </div>

      {/* Floating Code Decorations */}
      <div className="absolute top-20 left-10 glass-card p-3 rounded-xl animate-float opacity-40 hidden lg:block">
        <code className="text-xs font-mono text-emerald-400">
          const devxgen = new Community();
        </code>
      </div>
      <div className="absolute bottom-32 right-16 glass-card p-3 rounded-xl animate-float opacity-30 hidden lg:block" style={{ animationDelay: '3s' }}>
        <code className="text-xs font-mono text-cyan-400">
          await connect.developers();
        </code>
      </div>
      <div className="absolute top-1/3 right-20 glass-card p-3 rounded-xl animate-float opacity-25 hidden xl:block" style={{ animationDelay: '1.5s' }}>
        <code className="text-xs font-mono text-violet-400">
          {'{ innovation: true }'}
        </code>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 
                        shadow-neon mb-6 animate-pulse-glow">
            <Code2 size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold gradient-text mb-2">DevXGen</h1>
          <p className="text-surface-400 text-lg">
            Where developers connect, share & grow
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-lg font-bold text-surface-100 text-center mb-6">
            Join the Community
          </h2>
          <GoogleLoginButton />
          <p className="text-xs text-surface-500 text-center mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Terminal, label: 'Code Sharing' },
            { icon: Users, label: 'Community' },
            { icon: Zap, label: 'Real-time' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="text-center p-3 rounded-xl bg-surface-800/30 border border-surface-700/20"
            >
              <feature.icon size={20} className="mx-auto mb-1.5 text-primary-400" />
              <p className="text-[11px] text-surface-400 font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
