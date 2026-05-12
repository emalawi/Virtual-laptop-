import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  ChevronRight, 
  PlayCircle, 
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AuthModal } from "./components/Auth/AuthModal";
import { useAuth } from "./lib/AuthContext";
import { auth } from "./lib/firebase";
import { signOut } from "firebase/auth";
import Workspace from "./components/Workspace/Workspace";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authModalMode, setAuthModalMode] = React.useState<'login' | 'signup'>('login');
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [view, setView] = React.useState<"landing" | "workspace">("landing");
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setIsProfileOpen(false);
    setView("landing");
  };

  if (view === "workspace" && user) {
    return <Workspace onBackToLanding={() => setView("landing")} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setView("landing")}
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Shield className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">VaultFlow</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              <nav className="flex items-center gap-8">
                {["Product", "Solutions", "Pricing", "Support"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt={user.displayName || ''} />
                      ) : (
                        <UserIcon size={18} />
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user.displayName || 'User'}</span>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                      >
                        <button 
                          onClick={() => {
                            if (user?.emailVerified) {
                              setView("workspace");
                            } else {
                              setIsAuthModalOpen(true);
                              setAuthModalMode('login');
                            }
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          <UserIcon size={16} />
                          {user?.emailVerified ? 'Go to Workspace' : 'Verify Email'}
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md shadow-emerald-600/10 active:scale-95"
                >
                  Get Started
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-100 bg-white p-4 space-y-4"
          >
            {["Product", "Solutions", "Pricing", "Support"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-base font-medium text-slate-600 px-4 py-2 hover:bg-slate-50 rounded-lg"
              >
                {item}
              </a>
            ))}
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-full text-base font-bold"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-full text-base font-semibold"
              >
                Get Started
              </button>
            )}
          </motion.div>
        )}
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              SECURE STORAGE • BUILT FOR TEAMS
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.05] mb-8"
          >
            The secure workspace for <span className="text-emerald-600">modern teams</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed mb-12"
          >
            Securely manage assets, control permissions, and scale your organization with enterprise-grade protection and seamless collaboration.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
          >
            {user ? (
              <button 
                onClick={() => {
                  if (user.emailVerified) {
                    setView("workspace");
                  } else {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 group transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
              >
                {user.emailVerified ? 'Go to Workspace' : 'Verify Email to Start'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 group transition-all active:scale-95 shadow-xl shadow-emerald-600/20"
              >
                Get Started Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-3 transition-all active:scale-95">
              <PlayCircle className="w-6 h-6 text-emerald-600" />
              View Demo
            </button>
          </motion.div>

          {/* Interactive Mockup Area */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-64 bottom-0" />
            <div className="relative p-2 rounded-[2.5rem] bg-slate-200/50 backdrop-blur border border-slate-200 shadow-2xl">
              <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 aspect-[16/9] flex flex-col">
                {/* Mockup Toolbar */}
                <div className="h-12 border-b border-slate-100 px-6 flex items-center justify-between bg-slate-50/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="w-48 h-5 bg-slate-100 rounded-full" />
                  <div className="w-12 h-5 bg-slate-100 rounded-full" />
                </div>
                {/* Mockup Content */}
                <div className="flex-1 grid grid-cols-12">
                  <div className="col-span-3 border-r border-slate-100 p-6 space-y-4 bg-slate-50/30">
                    <div className="w-full h-8 bg-emerald-50 rounded-lg border border-emerald-100" />
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-full h-4 bg-slate-100 rounded-full" />
                    ))}
                  </div>
                  <div className="col-span-9 p-8">
                    <div className="grid grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                      ))}
                    </div>
                    <div className="mt-8 space-y-4">
                      <div className="w-full h-32 bg-slate-50 rounded-2xl border border-slate-100" />
                      <div className="w-3/4 h-32 bg-slate-50 rounded-2xl border border-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Element */}
            <div className="absolute -bottom-10 left-10 z-20">
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-100 animate-bounce transition-all duration-[3s]">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-emerald-600 w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-900">Security Verified</p>
                  <p className="text-xs text-slate-500">ISO/IEC 27001 Compliant</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6">
                Engineered for high-performing teams
              </h2>
              <p className="text-lg text-slate-500">
                Thousands of organizations use VaultFlow to protect their most valuable digital assets while keeping productivity at peak levels.
              </p>
            </div>
            <button className="text-emerald-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Explore all features
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Granular Controls",
                desc: "Set deep permissions at the asset level. Nobody sees what they shouldn't.",
                icon: Shield
              },
              {
                title: "Real-time Sync",
                desc: "Collaborate across borders with zero latency. Built for distributed teams.",
                icon: PlayCircle
              },
              {
                title: "Auto-Compliance",
                desc: "We handle the boring stuff. Regulatory standards are met out of the box.",
                icon: Menu
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg mb-6">
                  <feature.icon className="text-emerald-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-12">
            Trusted by visionary teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {["Acme", "Globex", "Initech", "Umbrella", "Soylent"].map((brand) => (
              <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500 w-6 h-6" />
            <span className="font-bold tracking-tight">VaultFlow</span>
          </div>
          <div className="text-slate-400 text-sm">
            © 2024 VaultFlow Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

