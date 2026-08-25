'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const themeImages: Record<string, string> = {
  romantic: "/dipa1.jpeg",
  cute: "/dipa2.jpeg",
  passion: "/rafi.jpg",
  dreamy: "/rafi2.jpg",
  sunset: "/dipa1.jpeg",
  royal: "/rafi.jpg",
  neon: "/dipa2.jpeg",
  velvet: "/rafi2.jpg"
};

const themesList = Object.keys(themeImages);

// আপনার গোপন এন্ট্রি কোড এখানে সেট করুন (আপনার ইচ্ছেমতো পরিবর্তন করে নিতে পারেন)
const SECRET_CODE = "Dipa Nnita"; 

export default function ChatPage() {
  // এন্ট্রি কোড ভেরিফিকেশনের জন্য স্টেট
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passError, setPassError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi my love! ❤️ How is your day going? Tell me everything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<string>('romantic');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ৬ সেকেন্ড পর পর অটোমেটিক থিম ও ছবি পরিবর্তন করার লজিক
  useEffect(() => {
    if (!isAuthenticated) return; // লগইন না হলে থিম চেঞ্জ বন্ধ থাকবে

    const interval = setInterval(() => {
      setTheme((prevTheme) => {
        const currentIndex = themesList.indexOf(prevTheme);
        const nextIndex = (currentIndex + 1) % themesList.length;
        return themesList[nextIndex];
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const panelThemeStyles: Record<string, any> = {
    romantic: {
      panelBg: 'bg-rose-950/30',
      button: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700',
      bubbleUser: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/20',
      bubbleAi: 'bg-slate-900/60 text-rose-100 border border-rose-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(244,63,94,0.2)]',
      border: 'border-rose-500/30'
    },
    cute: {
      panelBg: 'bg-purple-950/30',
      button: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-700',
      bubbleUser: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white shadow-purple-500/20',
      bubbleAi: 'bg-slate-900/60 text-purple-100 border border-purple-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.2)]',
      border: 'border-purple-500/30'
    },
    passion: {
      panelBg: 'bg-red-950/30',
      button: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700',
      bubbleUser: 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-red-500/20',
      bubbleAi: 'bg-slate-900/60 text-red-100 border border-red-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
      border: 'border-red-500/30'
    },
    dreamy: {
      panelBg: 'bg-blue-950/30',
      button: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
      bubbleUser: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-500/20',
      bubbleAi: 'bg-slate-900/60 text-blue-100 border border-blue-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
      border: 'border-blue-500/30'
    },
    sunset: {
      panelBg: 'bg-amber-950/30',
      button: 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700',
      bubbleUser: 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-amber-500/20',
      bubbleAi: 'bg-slate-900/60 text-amber-100 border border-amber-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
      border: 'border-amber-500/30'
    },
    royal: {
      panelBg: 'bg-indigo-950/30',
      button: 'bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800',
      bubbleUser: 'bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-indigo-500/20',
      bubbleAi: 'bg-slate-900/60 text-indigo-100 border border-indigo-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(99,102,241,0.2)]',
      border: 'border-indigo-500/30'
    },
    neon: {
      panelBg: 'bg-emerald-950/30',
      button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      bubbleUser: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20',
      bubbleAi: 'bg-slate-900/60 text-emerald-100 border border-emerald-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
      border: 'border-emerald-500/30'
    },
    velvet: {
      panelBg: 'bg-fuchsia-950/30',
      button: 'bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800',
      bubbleUser: 'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-fuchsia-500/20',
      bubbleAi: 'bg-slate-900/60 text-fuchsia-100 border border-fuchsia-500/20 backdrop-blur-xl',
      glow: 'shadow-[0_0_40px_rgba(217,70,239,0.2)]',
      border: 'border-fuchsia-500/30'
    }
  };

  const currentTheme = panelThemeStyles[theme] || panelThemeStyles.romantic;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === SECRET_CODE) {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      
      if (data.theme && panelThemeStyles[data.theme]) {
        setTheme(data.theme);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Aww, my heart skipped a beat! Tell me again, sweetie? 💕" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // পাসওয়ার্ড স্ক্রিন
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-2 font-sans">
        <div className="w-full sm:w-[380px] p-6 bg-slate-900/80 backdrop-blur-2xl border border-rose-500/30 rounded-[35px] shadow-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl mb-4 text-rose-400">
            🔒
          </div>
          <h2 className="text-white font-bold text-lg mb-1">Enter Secret Code</h2>
          <p className="text-xs text-white/60 mb-6">Please enter your code to access the chat.</p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full bg-slate-950/80 border border-white/20 rounded-full px-4 py-3 text-sm text-center text-white placeholder-white/40 focus:outline-none focus:border-rose-500 shadow-inner tracking-widest"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/50 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {passError && (
              <span className="text-xs text-rose-500 font-medium">Wrong code! Try again.</span>
            )}
            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Unlock Chat ✨
            </button>
          </form>
        </div>
      </main>
    );
  }

  // মূল চ্যাট ইন্টারফেস (এখানে h-[100dvh] ফিক্সটি যুক্ত করা হয়েছে)
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-2 font-sans">
      <div className={`w-full h-[100dvh] sm:w-[380px] sm:h-[750px] sm:rounded-[35px] ${currentTheme.panelBg} backdrop-blur-2xl border ${currentTheme.border} ${currentTheme.glow} flex flex-col relative shadow-2xl overflow-hidden transition-all duration-700`}>
        
        {/* ব্যাকগ্রাউন্ড ইমেজ ফুল কাভার */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={themeImages[theme]} 
            alt="Mobile View Background" 
            className="w-full h-full object-fill opacity-65 filter blur-[1px] transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[0.5px]"></div>
        </div>

        {/* Header */}
        <div className="py-2.5 px-4 bg-slate-950/60 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img 
                src={themeImages[theme]} 
                alt="AI Partner" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white/40 shadow-md transition-all duration-500"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-wide flex items-center gap-1 drop-shadow">
                My Love AI ✨
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium capitalize">Mood: {theme}</p>
            </div>
          </div>
          <div className="px-2.5 py-0.5 rounded-full bg-white/20 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white shadow">
            {theme}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col z-10">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'assistant' && (
                <img 
                  src={themeImages[theme]} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full object-cover border border-white/30 shrink-0 mb-1 shadow-sm"
                />
              )}

              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? `${currentTheme.bubbleUser} rounded-br-sm`
                    : `${currentTheme.bubbleAi} rounded-bl-sm`
                }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-white/90 text-xs pl-2 italic z-10 font-medium">
               <span>Typing sweet words...</span>
            </div>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Footer Input */}
        <div className="p-3 bg-slate-950/60 backdrop-blur-2xl border-t border-white/10 z-10 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900/80 border border-white/20 rounded-full px-3.5 py-2.5 text-xs text-white placeholder-white/60 focus:outline-none focus:border-rose-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`w-9 h-9 rounded-full ${currentTheme.button} text-white flex items-center justify-center shadow-md disabled:opacity-50 shrink-0 font-bold text-xs transition-transform active:scale-95`}
            >
              ➤
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}