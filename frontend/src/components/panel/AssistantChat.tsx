import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Sparkles, AlertTriangle, ArrowRight, Activity, 
  Search, Maximize2, Minimize2, Trash2, Cpu, ShieldCheck, Network
} from 'lucide-react';
import { investigateQuery } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  loading?: boolean;
}

const QUICK_PROMPTS = [
  'explain FIR-1024',
  'explain FIR-1098',
  'who is Priya Sharma',
  'How is Ravi Kumar connected to Priya Sharma?',
  'Who are the bridge nodes?'
];

const InvestigationLoadingTracker: React.FC = () => {
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = 45;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => (prev < totalSeconds ? prev + 1 : totalSeconds));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min(100, Math.round((elapsed / totalSeconds) * 100));

  const steps = [
    { threshold: 0, title: 'Natural Language & Target Entity Resolution', desc: 'Parsing query intent, resolving aliases, and binding target Case Dockets & Suspect IDs...', icon: '🔍' },
    { threshold: 9, title: 'Neo4j Knowledge Graph Multi-Hop Traversal', desc: 'Executing Cypher queries, traversing communications, shared locations, and vehicles...', icon: '⚡' },
    { threshold: 18, title: 'Databricks Medallion Lakehouse Query', desc: 'Scanning Gold/Silver parquet tables, narrative FIR dockets, and evidence registries...', icon: '🏛️' },
    { threshold: 27, title: 'NVIDIA NIM LLM Reasoning & Synthesis', desc: 'Prompting meta/llama-3.2-11b-vision-instruct with retrieved ground-truth database facts...', icon: '🤖' },
    { threshold: 37, title: 'Corroborating Evidence & Assembling Dockets', desc: 'Calculating confidence scores, verifying cross-case conduits, and formatting output...', icon: '🛡️' }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-xl space-y-4 my-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Activity className="w-4 h-4 animate-spin text-blue-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Deep Graph RAG Investigation in Progress</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Multi-Tier RAG
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Querying Neo4j Graph + Databricks Lakehouse + NVIDIA NIM LLM</p>
          </div>
        </div>
        <div className="text-right flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>Analyzing</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div 
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out shadow-xs"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepper list */}
      <div className="space-y-2 pt-1">
        {steps.map((step, idx) => {
          const isDone = elapsed >= (idx < steps.length - 1 ? steps[idx + 1].threshold : totalSeconds);
          const isActive = elapsed >= step.threshold && !isDone;
          
          return (
            <div 
              key={idx} 
              className={`p-2.5 rounded-lg border transition-all flex items-start space-x-3 text-xs ${
                isActive 
                  ? 'bg-blue-950/50 border-blue-500/50 text-blue-200' 
                  : isDone 
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400' 
                    : 'opacity-40 border-transparent text-slate-500'
              }`}
            >
              <span className="text-base shrink-0 mt-0.5">{step.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${isActive ? 'text-blue-300' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                  {isDone ? (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  ) : isActive ? (
                    <span className="text-[10px] text-blue-400 font-mono animate-pulse font-bold">
                      Processing...
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-mono">Queued</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface AssistantChatProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onOpenPath?: (nodes: string[], caseId?: string, edgeIds?: string[]) => void;
  pendingQuery?: string | null;
  onClearPendingQuery?: () => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({ 
  isOpen: externalIsOpen,
  onOpen: externalOnOpen,
  onClose: externalOnClose,
  onOpenPath,
  pendingQuery,
  onClearPendingQuery
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (open) {
      if (externalOnOpen) externalOnOpen();
      else setInternalIsOpen(true);
    } else {
      if (externalOnClose) externalOnClose();
      else setInternalIsOpen(false);
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'I am the CrimeGraph AI Investigator. Ask me questions about registered cases, suspects, vehicles, phone records, or hidden multi-hop connections in plain English.'
    }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingQuery) {
      setIsOpen(true);
      setIsFullScreen(true);
      handleSend(pendingQuery);
      if (onClearPendingQuery) onClearPendingQuery();
    }
  }, [pendingQuery]);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isFullScreen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();
    if (!query) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: query };
    const loadingMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', loading: true };
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    if (textToSend === undefined) setInput('');

    const MIN_LOADING_TIME_MS = 45000;

    try {
      const resultPromise = investigateQuery(query);
      const timerPromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS));

      const [result] = await Promise.all([resultPromise, timerPromise]);
      
      setMessages(prev => prev.map(m => m.id === loadingMessage.id ? {
        ...m,
        content: '',
        loading: false,
        data: result
      } : m));
    } catch (error) {
      setMessages(prev => prev.map(m => m.id === loadingMessage.id ? {
        ...m,
        content: 'Failed to securely connect to the graph engine.',
        loading: false
      } : m));
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Conversation history cleared. Ready for your next investigation query.'
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl shadow-blue-500/40 transition-all transform hover:scale-105 z-50 flex items-center space-x-2.5 font-bold border border-white/20"
      >
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        <span className="tracking-wide">AI Investigator</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop when fullscreen */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
          onClick={() => setIsFullScreen(false)}
        />
      )}

      <div 
        className={`fixed z-50 bg-white shadow-2xl flex flex-col border border-slate-200 transition-all duration-300 ease-out overflow-hidden ${
          isFullScreen 
            ? 'inset-3 md:inset-6 lg:inset-8 rounded-2xl' 
            : 'bottom-6 right-6 w-[480px] h-[680px] max-h-[85vh] rounded-2xl animate-in fade-in slide-in-from-bottom-4'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base tracking-tight text-white">AI Investigator Assistant</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold flex items-center space-x-1">
                  <Cpu className="w-3 h-3" />
                  <span>Llama 3.2 Vision • NVIDIA NIM</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Neo4j Graph Linked</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Lakehouse Medallion Gold RAG</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button 
              onClick={handleClear}
              title="Clear Chat History"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? "Minimize Window" : "Full Screen"}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              title="Close Assistant"
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200/80 flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-500 font-semibold flex items-center space-x-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Suggested:</span>
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium transition-colors shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <div className={`${isFullScreen ? 'max-w-4xl mx-auto space-y-6' : 'space-y-4'}`}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`rounded-2xl p-4 text-sm transition-all shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs max-w-[85%] md:max-w-[70%]' 
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs w-full shadow-md'
                  }`}
                >
                  {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                  
                  {msg.loading && (
                    <InvestigationLoadingTracker />
                  )}

                  {msg.data && (
                    <div className="space-y-4 mt-2">
                      {/* Key Finding / Profile Banner */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 rounded-xl border border-blue-200/80 shadow-xs">
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                          <Search className="w-3.5 h-3.5" />
                          <span>{msg.data.is_profile ? 'Subject Personal Details & Profile' : 'Key Finding'}</span>
                        </div>
                        <p className="font-semibold text-slate-900 text-base leading-snug">{msg.data.key_finding}</p>
                      </div>
                      
                      {/* Connection Path or Profile Badges */}
                      {msg.data.connection_path && msg.data.connection_path.length > 0 && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                            {msg.data.is_profile ? (
                              <>
                                <Bot className="w-3.5 h-3.5 text-blue-600" />
                                <span>Subject Profile Badges</span>
                              </>
                            ) : (
                              <>
                                <Network className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Connection Path & Graph Conduits</span>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.data.connection_path.map((p: string, i: number) => (
                              <div key={i} className="text-xs text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono shadow-2xs flex items-center space-x-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${msg.data.is_profile ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Relationship or Profile Summary */}
                      {msg.data.relationship_summary && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            {msg.data.is_profile ? 'Personal Profile Dossier Summary' : 'Investigative Relationship Summary'}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{msg.data.relationship_summary}</p>
                        </div>
                      )}

                      {/* Supporting Evidence */}
                      {msg.data.supporting_evidence && msg.data.supporting_evidence.length > 0 && (
                        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                            Corroborating Evidence & Source Records
                          </div>
                          <ul className="text-xs text-slate-700 space-y-1.5 pl-1">
                            {msg.data.supporting_evidence.map((e: string, i: number) => (
                              <li key={i} className="flex items-start space-x-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <span className="font-medium">{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Live Telemetry & Graph RAG Pipeline Trace */}
                      {msg.data.telemetry && (
                        <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold text-slate-100">Live Graph RAG Pipeline Trace</span>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[10px]">
                              <span>Graph: <b className="text-emerald-400">{msg.data.telemetry.graph_latency_ms}ms</b></span>
                              {msg.data.telemetry.llm_latency_ms > 0 && (
                                <span>LLM: <b className="text-blue-400">{msg.data.telemetry.llm_latency_ms}ms</b></span>
                              )}
                              <span>Total: <b className="text-white">{msg.data.telemetry.total_latency_ms}ms</b></span>
                            </div>
                          </div>
                          
                          {msg.data.telemetry.pipeline_steps && msg.data.telemetry.pipeline_steps.length > 0 && (
                            <div className="mt-2.5 space-y-1 font-mono text-[11px] text-slate-300">
                              {msg.data.telemetry.pipeline_steps.map((step: string, sIdx: number) => (
                                <div key={sIdx} className="flex items-center space-x-1.5">
                                  <span className="text-slate-500">›</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action & Metadata Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            Confidence: {msg.data.confidence}
                          </span>
                          {msg.data.human_review_required && (
                            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-bold flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Human Review Recommended</span>
                            </span>
                          )}
                        </div>
                        {msg.data.highlight_nodes && msg.data.highlight_nodes.length > 0 && onOpenPath && (
                          <button 
                            onClick={() => {
                              onOpenPath(
                                msg.data.highlight_nodes,
                                msg.data.case_id,
                                msg.data.highlight_edges
                              );
                              setIsFullScreen(false);
                              setIsOpen(false);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md hover:shadow-blue-500/25"
                          >
                            <span>Open Network Path ({msg.data.highlight_nodes.length} Nodes)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shadow-inner">
          <div className={`${isFullScreen ? 'max-w-4xl mx-auto' : ''}`}>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask in plain English: 'explain FIR-1024', 'who is Priya Sharma', 'explain connections between P001 and P017'..."
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm rounded-xl py-3.5 pl-4 pr-14 text-slate-800 transition-all font-medium placeholder:text-slate-400 shadow-2xs"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-2 px-1">
              <span>CrimeGraph AI Assistant • Powered by Graph RAG & Neo4j</span>
              <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] text-slate-600 font-mono">Enter</kbd> to submit</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
