'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, AlertTriangle, Clock, Trash2, Sun, Moon, 
  Eye, AlertCircle, Activity, Zap, FileText, 
  RefreshCw, Globe, MessageCircle, Send, X,
  TrendingUp, Sparkles, Database, Lock, Cpu, 
  Minimize2, Maximize2, ChevronRight, Flame, 
  CheckCircle2, XCircle, Siren, IndianRupee,
  ArrowRight, Loader2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TransactionAnalysis {
  risk_score: number;
  is_suspicious: boolean;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  recommended_action: string;
  reasoning: string;
  red_flags: string[];
  confidence: number;
}

interface Transaction extends TransactionAnalysis {
  id: string;
  timestamp: string;
  description: string;
  amount?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
}

interface Confetti {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_ANALYZE_URL = '/api/fraud/analyze';
const API_CHAT_URL = '/api/fraud/chat';

const translations = {
  en: {
    title: 'Financial Risk Agent',
    subtitle: 'AI-Powered Fraud Detection',
    poweredBy: 'Powered by Python Pydantic',
    enterTransaction: 'Enter Transaction',
    descriptionLabel: 'Transaction Description',
    descriptionPlaceholder: 'e.g., Transferred ₹4,50,000 at 3:30 AM to crypto wallet',
    amountLabel: 'Amount (₹ INR)',
    amountPlaceholder: 'Enter amount',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    quickStart: 'Quick Samples',
    history: 'History',
    noHistory: 'No transactions yet',
    riskScore: 'Risk Score',
    riskLevel: 'Risk Level',
    suspicious: 'Suspicious',
    safe: 'Safe',
    recommendedAction: 'Action',
    reasoning: 'Reasoning',
    redFlags: 'Red Flags',
    confidence: 'Confidence',
    timestamp: 'Time',
    viewDetails: 'Details',
    delete: 'Delete',
    clearAll: 'Clear All',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    chatbot: 'AI Assistant',
    chatPlaceholder: 'Ask about fraud...',
    totalAnalyzed: 'Total',
    suspiciousCount: 'Suspicious',
    avgRisk: 'Avg Risk',
    footerText: 'Secure Transaction Analysis',
  },
  hi: {
    title: 'वित्तीय जोखिम एजेंट',
    subtitle: 'AI-धोखाधड़ी पहचान',
    poweredBy: 'Python Pydantic सत्यापन',
    enterTransaction: 'लेनदेन दर्ज करें',
    descriptionLabel: 'विवरण',
    descriptionPlaceholder: 'जैसे, सुबह 3 बजे क्रिप्टो में ₹4,50,000 ट्रांसफर',
    amountLabel: 'राशि (₹)',
    amountPlaceholder: 'राशि दर्ज करें',
    analyze: 'विश्लेषण',
    analyzing: 'विश्लेषण...',
    quickStart: 'नमूने',
    history: 'इतिहास',
    noHistory: 'कोई लेनदेन नहीं',
    riskScore: 'जोखिम',
    riskLevel: 'स्तर',
    suspicious: 'संदिग्ध',
    safe: 'सुरक्षित',
    recommendedAction: 'कार्रवाई',
    reasoning: 'तर्क',
    redFlags: 'चेतावनी',
    confidence: 'विश्वास',
    timestamp: 'समय',
    viewDetails: 'विवरण',
    delete: 'हटाएं',
    clearAll: 'सभी मिटाएं',
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    critical: 'गंभीर',
    chatbot: 'AI सहायक',
    chatPlaceholder: 'धोखाधड़ी के बारे में पूछें...',
    totalAnalyzed: 'कुल',
    suspiciousCount: 'संदिग्ध',
    avgRisk: 'औसत',
    footerText: 'सुरक्षित लेनदेन विश्लेषण',
  },
  ml: {
    title: 'റിസ്ക്ക് ഏജന്റ്',
    subtitle: 'AI-തട്ടിപ്പ് കണ്ടെത്തൽ',
    poweredBy: 'Python Pydantic',
    enterTransaction: 'ഇടപാട് നൽകുക',
    descriptionLabel: 'വിവരണം',
    descriptionPlaceholder: 'ഉദാ: 3 മണിക്ക് ക്രിപ്റ്റോയിലേക്ക് ₹4,50,000',
    amountLabel: 'തുക (₹)',
    amountPlaceholder: 'തുക നൽകുക',
    analyze: 'വിശകലനം',
    analyzing: 'വിശകലനം...',
    quickStart: 'ഉദാഹരണങ്ങൾ',
    history: 'ചരിത്രം',
    noHistory: 'ഇടപാടുകൾ ഇല്ല',
    riskScore: 'റിസ്ക്ക്',
    riskLevel: 'ലെവൽ',
    suspicious: 'സംശയം',
    safe: 'സുരക്ഷിതം',
    recommendedAction: 'നടപടി',
    reasoning: 'കാരണം',
    redFlags: 'മുന്നറിയിപ്പ്',
    confidence: 'വിശ്വാസ്യത',
    timestamp: 'സമയം',
    viewDetails: 'വിശദാംശം',
    delete: 'ഇല്ലാതാക്കുക',
    clearAll: 'എല്ലാം മായ്ക്കുക',
    low: 'കുറഞ്ഞ',
    medium: 'ഇടത്തരം',
    high: 'ഉയർന്ന',
    critical: 'ഗുരുതരം',
    chatbot: 'AI സഹായി',
    chatPlaceholder: 'തട്ടിപ്പിനെ പറ്റി ചോദിക്കുക...',
    totalAnalyzed: 'ആകെ',
    suspiciousCount: 'സംശയം',
    avgRisk: 'ശരാശരി',
    footerText: 'സുരക്ഷിത ഇടപാട് വിശകലനം',
  },
};

type Language = 'en' | 'hi' | 'ml';

const sampleTransactions = [
  { description: 'Ramesh transferred ₹4,50,000 at 3:30 AM to crypto wallet', amount: 450000, risk: 'critical', icon: '🚨', gradient: 'from-rose-500 via-pink-500 to-red-500' },
  { description: 'Regular monthly salary credit from TechCorp India', amount: 85000, risk: 'low', icon: '✅', gradient: 'from-emerald-400 via-teal-500 to-cyan-500' },
  { description: 'Urgent international wire transfer to Nigeria for investment', amount: 2500000, risk: 'critical', icon: '⚠️', gradient: 'from-red-500 via-orange-500 to-amber-500' },
  { description: 'Electricity bill payment to BESCOM via UPI', amount: 2500, risk: 'low', icon: '💡', gradient: 'from-cyan-400 via-blue-500 to-indigo-500' },
  { description: 'Multiple rapid transfers: ₹10,000 x 15 in 30 minutes', amount: 150000, risk: 'high', icon: '⚡', gradient: 'from-orange-400 via-amber-500 to-yellow-500' },
  { description: 'Fixed deposit maturity credit from SBI Bank', amount: 500000, risk: 'low', icon: '🏦', gradient: 'from-violet-400 via-purple-500 to-fuchsia-500' },
];

// ============================================================================
// ANIMATED BACKGROUND COMPONENT
// ============================================================================

function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Morphing blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40"
        style={{ 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #f43f5e 100%)', 
          filter: 'blur(80px)' 
        }}
        animate={{ 
          scale: [1, 1.3, 1.1, 1.2, 1],
          x: [0, 80, 40, 60, 0],
          y: [0, 40, 80, 20, 0],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-60 -left-60 w-[700px] h-[700px] rounded-full opacity-30"
        style={{ 
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)', 
          filter: 'blur(100px)' 
        }}
        animate={{ 
          scale: [1.2, 1, 1.3, 1.1, 1.2],
          x: [0, -60, -30, -80, 0],
          y: [0, 80, 40, 60, 0],
          rotate: [360, 270, 180, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-25"
        style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)', 
          filter: 'blur(80px)' 
        }}
        animate={{ 
          scale: [1, 1.4, 1.2, 1.3, 1],
          rotate: [0, 180, 360, 540, 720]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            background: ['#8b5cf6', '#d946ef', '#f43f5e', '#06b6d4', '#10b981', '#f59e0b'][i % 6],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            filter: 'blur(1px)',
          }}
          animate={{ 
            y: [0, -100 - Math.random() * 100, 0],
            x: [0, Math.random() * 60 - 30, 0],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8 + Math.random() * 8, 
            repeat: Infinity, 
            delay: Math.random() * 5, 
            ease: 'easeInOut' 
          }}
        />
      ))}
      
      {/* Glowing orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: 100 + Math.random() * 100,
            height: 100 + Math.random() * 100,
            background: `radial-gradient(circle, ${['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b'][i]} 0%, transparent 70%)`,
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            opacity: 0.15,
          }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4 + Math.random() * 4, 
            repeat: Infinity, 
            delay: Math.random() * 2,
            ease: 'easeInOut' 
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

function ConfettiEffect({ show }: { show: boolean }) {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 6)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.x}%`,
            top: -20,
            background: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: 0,
            rotate: piece.rotation + 720,
            x: [0, Math.random() * 100 - 50, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// WARNING ANIMATION COMPONENT
// ============================================================================

function WarningEffect({ show, riskLevel }: { show: boolean; riskLevel: string }) {
  if (!show || riskLevel === 'Low') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Pulsing border */}
      <motion.div
        className="absolute inset-0 border-4"
        style={{
          borderColor: riskLevel === 'Critical' ? '#ef4444' : riskLevel === 'High' ? '#f97316' : '#eab308',
        }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.001, 1]
        }}
        transition={{ duration: 1, repeat: 3 }}
      />
      
      {/* Warning icons */}
      {riskLevel === 'Critical' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl"
              style={{
                left: `${15 + i * 15}%`,
                top: '50%',
              }}
              initial={{ opacity: 0, scale: 0, y: -100 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 2],
                y: [-100, 0, 100]
              }}
              transition={{ 
                duration: 1.5,
                delay: i * 0.1,
                repeat: 2
              }}
            >
              🚨
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// 3D CARD COMPONENT
// ============================================================================

function Card3D({ children, className, glowColor }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-200, 200], [20, -20]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-20, 20]), { stiffness: 300, damping: 30 });
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div 
      className={className} 
      style={{ perspective: 1200 }} 
      onMouseMove={handleMouseMove} 
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div 
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d',
        }} 
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative"
      >
        {/* Glow effect */}
        {glowColor && (
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
            whileHover={{ opacity: 0.3 }}
          />
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// RISK METER COMPONENT
// ============================================================================

function RiskMeter({ score, size = 'large', animated = true }: { score: number; size?: 'small' | 'medium' | 'large'; animated?: boolean }) {
  const sizes = { 
    small: { container: 'w-16 h-16', text: 'text-lg', ring: 28, strokeWidth: 4 }, 
    medium: { container: 'w-32 h-32', text: 'text-4xl', ring: 55, strokeWidth: 5 }, 
    large: { container: 'w-44 h-44', text: 'text-5xl', ring: 75, strokeWidth: 6 } 
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.ring;
  const progress = (score / 10) * circumference;

  const getColors = (score: number) => {
    if (score <= 3) return { 
      primary: '#10b981', 
      secondary: '#14b8a6',
      text: 'text-emerald-500',
      glow: 'rgba(16, 185, 129, 0.5)',
      bg: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20'
    };
    if (score <= 5) return { 
      primary: '#f59e0b', 
      secondary: '#eab308',
      text: 'text-amber-500',
      glow: 'rgba(245, 158, 11, 0.5)',
      bg: 'from-amber-500/20 via-yellow-500/20 to-orange-500/20'
    };
    if (score <= 7) return { 
      primary: '#f97316', 
      secondary: '#ef4444',
      text: 'text-orange-500',
      glow: 'rgba(249, 115, 22, 0.5)',
      bg: 'from-orange-500/20 via-red-500/20 to-rose-500/20'
    };
    return { 
      primary: '#ef4444', 
      secondary: '#dc2626',
      text: 'text-red-500',
      glow: 'rgba(239, 68, 68, 0.6)',
      bg: 'from-red-500/20 via-rose-500/20 to-pink-500/20'
    };
  };

  const colors = getColors(score);

  return (
    <motion.div 
      className={cn('relative', s.container)} 
      initial={animated ? { scale: 0, rotate: -180 } : false} 
      animate={{ scale: 1, rotate: 0 }} 
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(15px)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background circle */}
        <circle 
          cx="80" 
          cy="80" 
          r={s.ring} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={s.strokeWidth} 
          className="text-slate-200 dark:text-slate-700 opacity-20" 
        />
        
        {/* Animated gradient definition */}
        <defs>
          <linearGradient id={`riskGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
        
        {/* Progress circle */}
        <motion.circle 
          cx="80" 
          cy="80" 
          r={s.ring} 
          fill="none" 
          stroke={`url(#riskGradient-${score})`}
          strokeWidth={s.strokeWidth} 
          strokeLinecap="round" 
          strokeDasharray={circumference} 
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: circumference - progress }} 
          transition={{ duration: 1.5, ease: 'easeOut' }} 
          style={{ 
            filter: `drop-shadow(0 0 10px ${colors.primary}) drop-shadow(0 0 20px ${colors.glow})` 
          }} 
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.span 
            className={cn('font-black', s.text, colors.text)} 
            initial={animated ? { opacity: 0 } : false}
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-slate-400 font-bold">/10</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ icon: Icon, value, label, gradient, delay = 0, accent }: { 
  icon: React.ElementType; 
  value: number | string; 
  label: string; 
  gradient: string; 
  delay?: number;
  accent: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.8 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <Card3D>
        <Card className={cn(
          'relative overflow-hidden border-0 bg-gradient-to-br shadow-xl transition-all duration-500', 
          gradient
        )}>
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            animate={{ translateX: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          
          <CardContent className="p-4 text-center relative z-10">
            <motion.div 
              initial={{ scale: 0, rotate: -90 }} 
              animate={{ scale: 1, rotate: 0 }} 
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 300 }} 
              className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-white/25 dark:bg-black/20 flex items-center justify-center backdrop-blur-sm border border-white/20"
            >
              <Icon className="w-6 h-6 text-white drop-shadow-lg" />
            </motion.div>
            <motion.p 
              className="text-3xl font-black text-white drop-shadow-lg" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: delay + 0.3 }}
            >
              {value}
            </motion.p>
            <p className="text-xs text-white/80 mt-1 font-semibold tracking-wide">{label}</p>
          </CardContent>
          
          {/* Decorative elements */}
          <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30", accent)} />
          <div className={cn("absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20", accent)} />
        </Card>
      </Card3D>
    </motion.div>
  );
}

// ============================================================================
// SAMPLE BUTTON COMPONENT
// ============================================================================

function SampleButton({ sample, onClick, index }: { sample: typeof sampleTransactions[0]; onClick: () => void; index: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick} 
      className={cn(
        'relative w-full p-4 rounded-2xl text-left overflow-hidden group bg-gradient-to-br shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10',
        sample.gradient
      )}
    >
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      <div className="relative z-10 flex items-start gap-3">
        <motion.span 
          className="text-2xl"
          whileHover={{ scale: 1.2, rotate: 10 }}
        >
          {sample.icon}
        </motion.span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium line-clamp-2 leading-relaxed">{sample.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <IndianRupee className="w-3.5 h-3.5 text-white/70" />
            <p className="text-xs text-white/80 font-bold">{sample.amount.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      />
    </motion.button>
  );
}

// ============================================================================
// TRANSACTION CARD COMPONENT
// ============================================================================

function TransactionCard({ transaction, onView, onDelete, t, index }: { 
  transaction: Transaction; 
  onView: () => void; 
  onDelete: () => void; 
  t: typeof translations.en;
  index: number;
}) {
  const getRiskStyles = (score: number) => {
    if (score <= 3) return { 
      gradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10', 
      border: 'border-emerald-500/30 hover:border-emerald-400/50',
      glow: 'hover:shadow-emerald-500/10'
    };
    if (score <= 5) return { 
      gradient: 'from-amber-500/10 via-yellow-500/5 to-orange-500/10', 
      border: 'border-amber-500/30 hover:border-amber-400/50',
      glow: 'hover:shadow-amber-500/10'
    };
    if (score <= 7) return { 
      gradient: 'from-orange-500/10 via-red-500/5 to-rose-500/10', 
      border: 'border-orange-500/30 hover:border-orange-400/50',
      glow: 'hover:shadow-orange-500/10'
    };
    return { 
      gradient: 'from-red-500/10 via-rose-500/5 to-pink-500/10', 
      border: 'border-red-500/30 hover:border-red-400/50',
      glow: 'hover:shadow-red-500/10'
    };
  };

  const styles = getRiskStyles(transaction.risk_score);

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, x: -30, scale: 0.95 }} 
      animate={{ opacity: 1, x: 0, scale: 1 }} 
      exit={{ opacity: 0, x: 30, scale: 0.95 }} 
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className={cn(
        'border backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl',
        styles.border,
        styles.glow,
        'bg-gradient-to-r',
        styles.gradient
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <RiskMeter score={transaction.risk_score} size="small" animated={false} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Badge 
                    variant={transaction.is_suspicious ? 'destructive' : 'default'} 
                    className={cn(
                      'text-xs font-bold border-0', 
                      !transaction.is_suspicious && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                    )}
                  >
                    {transaction.is_suspicious ? (
                      <><XCircle className="w-3 h-3 mr-1" />{t.suspicious}</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3 mr-1" />{t.safe}</>
                    )}
                  </Badge>
                </motion.div>
                <Badge 
                  variant="outline" 
                  className={cn('text-xs font-semibold', styles.border)}
                >
                  {t[transaction.risk_level.toLowerCase() as keyof typeof t]}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 font-medium">
                {transaction.description}
              </p>
              
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {transaction.amount && (
                  <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-400">
                    <IndianRupee className="w-3 h-3" />
                    {transaction.amount.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {transaction.timestamp}
                </span>
              </div>
            </div>
            
            <div className="flex gap-1.5">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onView} 
                  className="h-9 w-9 p-0 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onDelete} 
                  className="h-9 w-9 p-0 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// FLOATING CHAT BUBBLE
// ============================================================================

function FloatingChatBubble({ show, onClick, t }: { show: boolean; onClick: () => void; t: typeof translations.en }) {
  return (
    <AnimatePresence>
      {!show && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 shadow-lg shadow-violet-500/30 flex items-center justify-center group"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-violet-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-purple-500"
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t.chatbot}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function RiskAgentPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TransactionAnalysis | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('analyze');
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => { setMounted(true); fetchHistory(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchHistory = () => {
    try {
      const stored = localStorage.getItem('transactionHistory');
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  };

  const saveHistory = (newHistory: Transaction[]) => {
    localStorage.setItem('transactionHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleAnalyze = async () => {
    if (!description.trim()) { 
      toast.error('Please enter a description', { 
        style: { background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white' }
      }); 
      return; 
    }
    
    setIsAnalyzing(true); 
    setResult(null); 
    setError(null);
    setShowConfetti(false);
    setShowWarning(false);
    
    try {
      const response = await fetch(API_ANALYZE_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ description: description.trim(), amount: amount ? parseFloat(amount) : null }) 
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setResult(data.data);
        const newTransaction: Transaction = { 
          id: Date.now().toString(), 
          timestamp: new Date().toLocaleString(), 
          description: description.trim(), 
          amount: amount ? parseFloat(amount) : undefined, 
          ...data.data 
        };
        saveHistory([newTransaction, ...history]);
        
        // Show animations based on risk
        if (data.data.risk_score <= 3 && !data.data.is_suspicious) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          toast.success('Transaction is safe!', { 
            icon: '🎉',
            style: { background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white' }
          });
        } else if (data.data.risk_score >= 7 || data.data.is_suspicious) {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 2500);
          toast.error('Suspicious transaction detected!', { 
            icon: '🚨',
            style: { background: 'linear-gradient(135deg, #ef4444, #f97316)', color: 'white' }
          });
        } else {
          toast.success('Analysis complete!', { 
            icon: data.data.risk_score <= 5 ? '✅' : '⚠️',
            style: { background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white' }
          });
        }
      } else { 
        setError(data.error || 'Analysis failed'); 
        toast.error(data.error || 'Analysis failed'); 
      }
    } catch { 
      setError('Connection error'); 
      toast.error('Connection error'); 
    }
    finally { 
      setIsAnalyzing(false); 
    }
  };

  const handleDelete = (id: string) => { 
    saveHistory(history.filter(t => t.id !== id)); 
    toast.success('Transaction deleted', { 
      style: { background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white' }
    }); 
  };
  
  const handleClearAll = () => { 
    localStorage.removeItem('transactionHistory'); 
    setHistory([]); 
    toast.success('History cleared', { 
      style: { background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white' }
    }); 
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);
    
    try {
      const response = await fetch(API_CHAT_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ message: userMessage }) 
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || 'Sorry, I could not process that.' }]);
    } catch { 
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Temporarily unavailable.' }]); 
    }
    finally { 
      setIsChatLoading(false); 
    }
  };

  const loadSample = (sample: typeof sampleTransactions[0]) => { 
    setDescription(sample.description); 
    setAmount(sample.amount.toString()); 
    toast.success('Sample loaded!', { 
      icon: '📋',
      style: { background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: 'white' }
    }); 
  };
  
  const stats = { 
    total: history.length, 
    suspicious: history.filter(t => t.is_suspicious || t.risk_score >= 6).length, 
    avgRisk: history.length ? (history.reduce((a, t) => a + (t.risk_score || 0), 0) / history.length).toFixed(1) : 0 
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-x-hidden">
      <AnimatedBackground />
      <ConfettiEffect show={showConfetti} />
      <WarningEffect show={showWarning} riskLevel={result?.risk_level || ''} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/30 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3" 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div 
              whileHover={{ rotate: 360, scale: 1.1 }} 
              transition={{ duration: 0.6, type: 'spring' }} 
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-xl opacity-60" />
              <div className="relative p-2.5 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                {t.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-fuchsia-500" />
                {t.subtitle}
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-1.5 sm:gap-2" 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl px-3 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{language.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl overflow-hidden shadow-xl border-slate-200/50 dark:border-slate-700/50">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={cn("gap-3 rounded-none px-4 py-2.5", language === 'en' && 'bg-violet-100 dark:bg-violet-900/30')}>🇬🇧 English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className={cn("gap-3 rounded-none px-4 py-2.5", language === 'hi' && 'bg-violet-100 dark:bg-violet-900/30')}>🇮🇳 हिंदी</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('ml')} className={cn("gap-3 rounded-none px-4 py-2.5", language === 'ml' && 'bg-violet-100 dark:bg-violet-900/30')}>🇮🇳 മലയാളം</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="rounded-xl w-9 h-9 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            >
              <motion.div animate={{ rotate: theme === 'dark' ? 180 : 0, scale: 1 }} transition={{ duration: 0.4, type: 'spring' }}>
                {theme === 'dark' ? <Moon className="w-5 h-5 text-violet-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
            <StatCard 
              icon={Database} 
              value={stats.total} 
              label={t.totalAnalyzed} 
              gradient="from-violet-500 via-purple-500 to-fuchsia-500" 
              accent="bg-violet-400"
              delay={0.1} 
            />
            <StatCard 
              icon={AlertTriangle} 
              value={stats.suspicious} 
              label={t.suspiciousCount} 
              gradient="from-rose-500 via-pink-500 to-red-500" 
              accent="bg-rose-400"
              delay={0.2} 
            />
            <StatCard 
              icon={TrendingUp} 
              value={stats.avgRisk} 
              label={t.avgRisk} 
              gradient="from-emerald-500 via-teal-500 to-cyan-500" 
              accent="bg-emerald-400"
              delay={0.3} 
            />
          </div>
          
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
              >
                <Alert 
                  variant="destructive" 
                  className="mb-6 rounded-2xl border-0 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 shadow-lg"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="font-semibold">Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
            >
              <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-6 sm:mb-8 h-12 sm:h-14 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 border border-slate-200/30 dark:border-slate-700/30">
                <TabsTrigger 
                  value="analyze" 
                  className="gap-2 rounded-xl text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:via-purple-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Activity className="w-4 h-4" />
                  {t.analyze}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="gap-2 rounded-xl text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:via-purple-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Clock className="w-4 h-4" />
                  {t.history}
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            {/* Analyze Tab */}
            <TabsContent value="analyze" className="space-y-6 sm:space-y-8">
              <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
                {/* Input Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.5 }}
                >
                  <Card3D glowColor="rgba(139, 92, 246, 0.3)">
                    <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
                      {/* Card Header Gradient */}
                      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                          <motion.div 
                            className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg"
                            whileHover={{ rotate: 5, scale: 1.05 }}
                          >
                            <FileText className="w-5 h-5" />
                          </motion.div>
                          {t.enterTransaction}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-5">
                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.descriptionLabel}</Label>
                          <Textarea 
                            placeholder={t.descriptionPlaceholder} 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="min-h-[120px] resize-none rounded-2xl border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-violet-400/20 transition-all text-sm" 
                          />
                        </div>
                        
                        <div className="space-y-2.5">
                          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.amountLabel}</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 dark:text-violet-400 font-bold">
                              <IndianRupee className="w-5 h-5" />
                            </span>
                            <Input 
                              type="number" 
                              placeholder={t.amountPlaceholder} 
                              value={amount} 
                              onChange={(e) => setAmount(e.target.value)} 
                              className="pl-12 h-12 sm:h-14 rounded-2xl border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-violet-400/20 transition-all text-base font-medium" 
                            />
                          </div>
                        </div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }} 
                          className="pt-2"
                        >
                          <Button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing || !description.trim()} 
                            className={cn(
                              "w-full h-14 sm:h-16 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                            )}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t.analyzing}
                              </>
                            ) : (
                              <>
                                <Shield className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                {t.analyze}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                          <Lock className="w-3 h-3" />
                          <span>{t.poweredBy}</span>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-2 py-0.5 rounded-full border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400 font-semibold"
                          >
                            Pydantic
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
                
                {/* Result Card */}
                <motion.div 
                  initial={{ opacity: 0, x: 30 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: 0.6 }}
                >
                  <Card3D glowColor={result ? (result.risk_score <= 3 ? 'rgba(16, 185, 129, 0.3)' : result.risk_score <= 5 ? 'rgba(245, 158, 11, 0.3)' : result.risk_score <= 7 ? 'rgba(249, 115, 22, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'rgba(139, 92, 246, 0.3)'}>
                    <Card className="h-full border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                          <motion.div 
                            className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg"
                            whileHover={{ rotate: -5, scale: 1.05 }}
                          >
                            <TrendingUp className="w-5 h-5" />
                          </motion.div>
                          Analysis Result
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <AnimatePresence mode="wait">
                          {result ? (
                            <motion.div 
                              key="result" 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              exit={{ opacity: 0, y: -20 }} 
                              className="space-y-5"
                            >
                              {/* Risk Meter */}
                              <motion.div 
                                className={cn(
                                  "p-6 rounded-3xl border-2 flex justify-center bg-gradient-to-br",
                                  result.risk_score <= 3 && "from-emerald-500/20 via-teal-500/10 to-cyan-500/20 border-emerald-400/50",
                                  result.risk_score > 3 && result.risk_score <= 5 && "from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-amber-400/50",
                                  result.risk_score > 5 && result.risk_score <= 7 && "from-orange-500/20 via-red-500/10 to-rose-500/20 border-orange-400/50",
                                  result.risk_score > 7 && "from-red-500/20 via-rose-500/10 to-pink-500/20 border-red-400/50"
                                )} 
                                initial={{ scale: 0.8 }} 
                                animate={{ scale: 1 }} 
                                transition={{ type: 'spring', stiffness: 200 }}
                              >
                                <RiskMeter score={result.risk_score} />
                              </motion.div>
                              
                              {/* Status Badges */}
                              <motion.div 
                                className="flex justify-center gap-2 flex-wrap" 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ delay: 0.3 }}
                              >
                                <Badge 
                                  variant={result.is_suspicious ? 'destructive' : 'default'} 
                                  className={cn(
                                    'text-sm px-4 py-1.5 rounded-full font-semibold border-0',
                                    !result.is_suspicious && 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                                  )}
                                >
                                  {result.is_suspicious ? (
                                    <><XCircle className="w-4 h-4 mr-1.5" />{t.suspicious}</>
                                  ) : (
                                    <><CheckCircle2 className="w-4 h-4 mr-1.5" />{t.safe}</>
                                  )}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    'text-sm px-4 py-1.5 rounded-full font-semibold',
                                    result.risk_level === 'Low' && 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                                    result.risk_level === 'Medium' && 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20',
                                    result.risk_level === 'High' && 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20',
                                    result.risk_level === 'Critical' && 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20'
                                  )}
                                >
                                  {result.risk_level === 'Critical' && <Siren className="w-4 h-4 mr-1.5" />}
                                  {result.risk_level === 'High' && <Flame className="w-4 h-4 mr-1.5" />}
                                  {t[result.risk_level.toLowerCase() as keyof typeof t]} {t.riskLevel}
                                </Badge>
                              </motion.div>
                              
                              {/* Recommended Action */}
                              <motion.div 
                                className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-700/50" 
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: 0.4 }}
                              >
                                <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                                  <AlertCircle className="w-4 h-4 text-violet-500" />
                                  {t.recommendedAction}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                  {result.recommended_action}
                                </p>
                              </motion.div>
                              
                              {/* Red Flags */}
                              {result.red_flags && result.red_flags.length > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }} 
                                  animate={{ opacity: 1, x: 0 }} 
                                  transition={{ delay: 0.5 }}
                                >
                                  <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    {t.redFlags}
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {result.red_flags.map((flag, i) => (
                                      <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0.8 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                      >
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-full px-3 font-medium border-0"
                                        >
                                          {flag}
                                        </Badge>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                              
                              {/* Confidence */}
                              <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                transition={{ delay: 0.7 }}
                              >
                                <h4 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                                  <Cpu className="w-4 h-4 text-violet-500" />
                                  {t.confidence}: {Math.round(result.confidence * 100)}%
                                </h4>
                                <div className="relative h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                                  <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.confidence * 100}%` }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                  />
                                </div>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="empty" 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              className="flex flex-col items-center justify-center py-16"
                            >
                              <motion.div 
                                animate={{ 
                                  rotate: [0, 10, -10, 0], 
                                  scale: [1, 1.1, 1],
                                  y: [0, -10, 0]
                                }} 
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} 
                                className="mb-6"
                              >
                                <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900/30 dark:via-purple-900/30 dark:to-fuchsia-900/30">
                                  <Shield className="w-16 h-16 text-violet-400 dark:text-violet-500" />
                                </div>
                              </motion.div>
                              <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-medium">
                                Enter a transaction to begin analysis
                              </p>
                              <p className="text-slate-400 dark:text-slate-500 text-center text-xs mt-1">
                                Your AI-powered security guardian
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </Card3D>
                </motion.div>
              </div>
              
              {/* Quick Samples */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.7 }}
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                      <motion.div 
                        className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"
                        whileHover={{ rotate: 5, scale: 1.05 }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      {t.quickStart}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sampleTransactions.map((sample, i) => (
                        <SampleButton key={i} sample={sample} onClick={() => loadSample(sample)} index={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="space-y-5">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center justify-between"
              >
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {t.history}
                </h2>
                {history.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleClearAll} 
                    className="rounded-xl px-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.clearAll}
                  </Button>
                )}
              </motion.div>
              
              {history.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden">
                    <CardContent className="py-20 text-center">
                      <motion.div 
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} 
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 mb-6">
                          <Clock className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                        </div>
                      </motion.div>
                      <p className="text-slate-500 font-medium">{t.noHistory}</p>
                      <p className="text-slate-400 text-sm mt-1">Analyzed transactions will appear here</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <ScrollArea className="h-[400px] sm:h-[500px]">
                  <div className="space-y-3 pr-2">
                    <AnimatePresence>
                      {history.map((transaction, i) => (
                        <TransactionCard 
                          key={transaction.id} 
                          transaction={transaction} 
                          onView={() => { setSelectedTransaction(transaction); setShowDetails(true); }} 
                          onDelete={() => handleDelete(transaction.id)} 
                          t={t}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Sticky Footer */}
      <footer className="sticky bottom-0 z-30 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border-t border-slate-200/30 dark:border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-violet-500" />
            <span>{t.footerText}</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex items-center gap-1 text-xs text-slate-400"
              whileHover={{ scale: 1.05 }}
            >
              <Heart className="w-3 h-3 text-pink-500" />
              <span>Built with care</span>
            </motion.div>
          </div>
        </div>
      </footer>
      
      {/* Chat Dialog */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 100, scale: 0.8 }} 
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={cn(
              "fixed z-50", 
              chatExpanded ? "inset-4 sm:inset-8" : "bottom-4 right-4 w-[calc(100%-2rem)] sm:w-96 h-[450px] sm:h-[500px]"
            )}
          >
            <Card className="h-full border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-white">{t.chatbot}</h3>
                    <p className="text-xs text-white/70">Keyword-based</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setChatExpanded(!chatExpanded)} 
                    className="h-9 w-9 rounded-xl hover:bg-white/20 text-white"
                  >
                    {chatExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowChat(false)} 
                    className="h-9 w-9 rounded-xl hover:bg-white/20 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 h-[calc(100%-140px)]">
                <div className="space-y-4">
                  {chatMessages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="text-center py-10"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }} 
                        transition={{ duration: 2, repeat: Infinity }} 
                        className="inline-block p-5 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 mb-4"
                      >
                        <Sparkles className="w-10 h-10 text-violet-500" />
                      </motion.div>
                      <p className="text-sm text-slate-500 font-medium">Ask about fraud detection!</p>
                    </motion.div>
                  )}
                  
                  {chatMessages.map((msg, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-br-md shadow-lg shadow-violet-500/20" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-md border border-slate-200/50 dark:border-slate-700/50"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isChatLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="flex justify-start"
                    >
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div 
                              key={i} 
                              className="w-2 h-2 bg-violet-400 rounded-full" 
                              animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} 
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} 
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Input
                    placeholder={t.chatPlaceholder}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 focus:border-violet-400 focus:ring-violet-400/20"
                    disabled={isChatLoading}
                  />
                  <Button 
                    onClick={handleChat} 
                    disabled={isChatLoading || !chatInput.trim()}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating Chat Bubble */}
      <FloatingChatBubble show={showChat} onClick={() => setShowChat(true)} t={t} />
      
      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg rounded-3xl border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                <Eye className="w-5 h-5" />
              </div>
              {t.viewDetails}
            </DialogTitle>
            <DialogDescription className="sr-only">Transaction analysis details</DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <RiskMeter score={selectedTransaction.risk_score} size="medium" />
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {selectedTransaction.description}
                </p>
                {selectedTransaction.amount && (
                  <p className="text-lg font-bold text-violet-600 dark:text-violet-400 mt-2 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    {selectedTransaction.amount.toLocaleString('en-IN')}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">{t.riskLevel}</p>
                  <p className="font-bold text-sm">{selectedTransaction.risk_level}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">{t.confidence}</p>
                  <p className="font-bold text-sm">{Math.round(selectedTransaction.confidence * 100)}%</p>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <h4 className="font-semibold text-sm mb-2">{t.recommendedAction}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">{selectedTransaction.recommended_action}</p>
              </div>
              
              {selectedTransaction.red_flags && selectedTransaction.red_flags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">{t.redFlags}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.red_flags.map((flag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-0">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
