import React, { useState } from 'react';

export function AuthModal({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0B]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F0F12] border border-slate-800 rounded-xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tighter animate-pulse text-center">
              INSIDER <span className="text-blue-500 font-normal">TRADER</span> <span className="text-blue-500 font-normal ml-1 text-[10px] tracking-normal opacity-70">PRO</span>
            </h2>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-center mt-4">Connecting to core...</div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white tracking-tighter mb-8 text-center">
              INSIDER <span className="text-blue-500 font-normal">TRADER</span> <span className="text-blue-500 font-normal ml-1 text-[10px] tracking-normal opacity-70">PRO</span>
            </h2>
            <h3 className="text-lg font-bold text-white mb-2">{isLogin ? 'Sign In' : 'Create Account'}</h3>
            <p className="text-slate-400 text-xs mb-6 text-center">Access institutional-grade AI models</p>
            
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                  placeholder="name@institution.com"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white transition-colors py-2 rounded font-bold text-sm"
              >
                {isLogin ? 'Enter Platform' : 'Initialize Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800 pt-4 w-full">
              {isLogin ? "Don't have access? " : "Already initialized? "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-500 hover:text-blue-400 font-semibold"
              >
                {isLogin ? 'Request Access' : 'Sign In'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
