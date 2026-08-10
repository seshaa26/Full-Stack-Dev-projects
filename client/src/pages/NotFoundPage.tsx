import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Code2 } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden" id="not-found-page">
      {/* Background Effects */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 text-center px-6 animate-scale-in">
        {/* Animated 404 */}
        <div className="mb-6">
          <span className="text-8xl font-extrabold gradient-text">404</span>
        </div>

        {/* Icon */}
        <div className="inline-flex p-4 rounded-2xl bg-surface-800/50 border border-surface-700/30 mb-6">
          <Code2 size={40} className="text-primary-400 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-surface-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-surface-400 mb-8 max-w-md mx-auto">
          Looks like this page got lost in the codebase. Let's get you back to familiar territory.
        </p>

        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
          id="go-home-btn"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
