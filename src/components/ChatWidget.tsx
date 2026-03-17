"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Stethoscope, 
  ShieldAlert, 
  Info, 
  Sparkles,
  ChevronDown,
  User,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { chatAssistant } from '@/ai/flows/chat-assistant-flow';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const QUICK_PROMPTS = [
  { label: "Check Symptoms", query: "What are the early symptoms of sunstroke?" },
  { label: "Prevention Tips", query: "How can I prevent heat exhaustion while working outside?" },
  { label: "Emergency Help", query: "What should I do if someone is showing signs of heat stroke?" }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Protocol Synchronized. I am your SunCare AI Assistant. How can I assist with your thermal safety today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatAssistant({
        history: messages,
        message: text
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Communication link unstable. Please ensure you are in a cool environment and retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-body">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-110 transition-all border-4 border-background"
            >
              <MessageCircle className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="rounded-[2.5rem] border-none shadow-3xl bg-white overflow-hidden flex flex-col h-[550px]">
              {/* Header */}
              <div className="bg-primary p-6 text-white flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black uppercase tracking-tight">Health Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Neural Link Active</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-white relative z-10"
                >
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Content */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'model' && <Bot className="h-3 w-3 text-primary" />}
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                        {msg.role === 'user' ? 'Telemetry Node' : 'AI Assistant'}
                      </span>
                      {msg.role === 'user' && <User className="h-3 w-3 text-slate-400" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white border border-border text-slate-700 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="h-3 w-3 text-primary" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">AI Thinking</span>
                    </div>
                    <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1 w-1 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1 w-1 bg-primary rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1 w-1 bg-primary rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {messages.length < 4 && !isLoading && (
                <div className="px-6 py-2 flex flex-wrap gap-2 bg-slate-50/50">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt.query)}
                      className="text-[9px] font-black uppercase tracking-tight px-3 py-1.5 rounded-full bg-white border border-border text-primary hover:border-primary transition-colors shadow-sm"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer / Input */}
              <div className="p-6 bg-white border-t border-border">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                  className="flex items-center gap-3"
                >
                  <div className="relative flex-1">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask health assistant..."
                      disabled={isLoading}
                      className="h-12 bg-slate-100 border-transparent rounded-xl px-4 text-xs font-bold focus:bg-white focus:border-primary transition-all pr-10"
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-30" />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="h-12 w-12 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-center transition-all active:scale-95 shrink-0"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest text-center mt-4">
                  AI Medical Assistant Protocol v1.4
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
