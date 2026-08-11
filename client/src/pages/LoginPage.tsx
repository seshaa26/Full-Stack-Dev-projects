import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Terminal, Zap, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import OracleLoginButton from '../components/auth/OracleLoginButton';

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
      {/* Background Enhancements (Global Network Grid shows underneath) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs (Brighter for Light Mode) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-700/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Floating Code Decorations */}
      <div className="absolute top-16 left-12 glass-card p-3 rounded-xl animate-float opacity-90 hidden lg:block">
        <code className="text-xs font-mono text-emerald-600 font-bold">
          const devxgen = new Community();
        </code>
      </div>
      <div className="absolute bottom-24 right-16 glass-card p-3 rounded-xl animate-float opacity-90 hidden lg:block" style={{ animationDelay: '3s' }}>
        <code className="text-xs font-mono text-primary-600 font-bold">
          await connect.developers();
        </code>
      </div>
      <div className="absolute top-1/3 right-12 glass-card p-3 rounded-xl animate-float opacity-80 hidden xl:block" style={{ animationDelay: '1.5s' }}>
        <code className="text-xs font-mono text-violet-600 font-bold">
          {'{ innovation: true }'}
        </code>
      </div>
      <div className="absolute top-2/3 left-16 glass-card p-3 rounded-xl animate-float opacity-85 hidden xl:block" style={{ animationDelay: '2.5s' }}>
        <code className="text-xs font-mono text-amber-600 font-bold">
          git commit -m "build together"
        </code>
      </div>
      <div className="absolute top-12 right-[25%] glass-card p-3 rounded-xl animate-float opacity-75 hidden 2xl:block" style={{ animationDelay: '5s' }}>
        <code className="text-xs font-mono text-rose-600 font-bold">
          npm run start
        </code>
      </div>
      <div className="absolute bottom-16 left-[30%] glass-card p-3 rounded-xl animate-float opacity-80 hidden 2xl:block" style={{ animationDelay: '4s' }}>
        <code className="text-xs font-mono text-cyan-600 font-bold">
          console.log("Hello World");
        </code>
      </div>
      <div className="absolute top-1/2 left-8 glass-card p-3 rounded-xl animate-float opacity-70 hidden xl:block" style={{ animationDelay: '6s' }}>
        <code className="text-xs font-mono text-teal-600 font-bold">
          import {'{ magic }'} from 'devxgen';
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
          <h1 className="text-4xl font-extrabold gradient-text mb-2">DevXgen</h1>
          <p className="text-surface-400 text-lg">
            Where Developers Interact, Share & Grow
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 mb-8">
          <h2 className="text-lg font-bold text-surface-100 text-center mb-6">
            Join the Community
          </h2>

          {/* Google Sign-In */}
          <GoogleLoginButton />

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-surface-700/50" />
            <span className="text-xs text-surface-500 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-surface-700/50" />
          </div>

          {/* Oracle Sign-In */}
          <OracleLoginButton />

          <p className="text-xs text-surface-500 text-center mt-5">
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
