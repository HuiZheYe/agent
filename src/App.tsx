/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Bot, 
  BookOpen, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ChevronRight,
  Brain,
  Wrench,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Analytics } from '@vercel/analytics/react';

// Types
interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  capabilities: string[];
  lastModified: number;
}

const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-pro-preview'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'learn' | 'design' | 'my-agents'>('learn');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [editingAgent, setEditingAgent] = useState<Partial<Agent>>({
    name: '',
    systemPrompt: '',
    model: MODELS[0],
    capabilities: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_agents');
    if (saved) {
      try {
        setAgents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse agents", e);
      }
    }
  }, []);

  // Save to localStorage
  const saveAgents = (newAgents: Agent[]) => {
    setAgents(newAgents);
    localStorage.setItem('ai_agents', JSON.stringify(newAgents));
  };

  const handleSave = () => {
    if (!editingAgent.name || !editingAgent.systemPrompt) return;

    const newAgent: Agent = {
      id: editingAgent.id || Math.random().toString(36).substr(2, 9),
      name: editingAgent.name,
      systemPrompt: editingAgent.systemPrompt,
      model: editingAgent.model || MODELS[0],
      capabilities: editingAgent.capabilities || [],
      lastModified: Date.now()
    };

    let updatedAgents;
    if (editingAgent.id) {
      updatedAgents = agents.map(a => a.id === editingAgent.id ? newAgent : a);
    } else {
      updatedAgents = [newAgent, ...agents];
    }

    saveAgents(updatedAgents);
    setEditingAgent({ name: '', systemPrompt: '', model: MODELS[0], capabilities: [] });
    setActiveTab('my-agents');
  };

  const handleDelete = (id: string) => {
    const updated = agents.filter(a => a.id !== id);
    saveAgents(updated);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setActiveTab('design');
  };

  const refinePrompt = async () => {
    if (!editingAgent.systemPrompt) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一个 AI 提示词专家。请帮我优化以下 AI 智能体的系统提示词，使其更精准、更有逻辑。只返回优化后的结果：\n\n${editingAgent.systemPrompt}`,
      });
      if (response.text) {
        setEditingAgent(prev => ({ ...prev, systemPrompt: response.text }));
      }
    } catch (error) {
      console.error("AI refinement failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Analytics />
      <div className="min-h-screen flex text-[#111827]">
      {/* Sidebar */}
      <nav className="w-64 border-r border-slate-200 bg-slate-100 flex flex-col p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white shadow-sm">
            <Bot size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">AgentAcademy <span className="text-indigo-600 font-light">Pro</span></span>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="caps-label mb-3 block">Teaching Modules</label>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('learn')}
                className={activeTab === 'learn' ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'learn' ? 'bg-indigo-600' : 'border border-slate-400'}`}></div>
                <span>Core Architecture</span>
              </button>
              <button 
                onClick={() => setActiveTab('design')}
                className={activeTab === 'design' ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'design' ? 'bg-indigo-600' : 'border border-slate-400'}`}></div>
                <span>Agent Definition</span>
              </button>
            </div>
          </div>

          <div>
            <label className="caps-label mb-3 block">Management</label>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('my-agents')}
                className={activeTab === 'my-agents' ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <MessageSquare size={16} />
                <span>My Projects</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Local Sync Active
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">V1.0.4 • Browser Safe</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div 
              key="learn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">欢迎来到智能实验室</h1>
                <p className="text-lg text-slate-500">学习定义智能体的性格、约束与逻辑，并在本地持久化存储。</p>
              </header>

              <div className="grid grid-cols-3 gap-6">
                <div className="glass-card p-6 space-y-4 hover:border-indigo-300 transition-colors group">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Brain size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">感知与记忆</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    智能体如何理解上下文？学习短期记忆（Prompt）与长期记忆（RAG）的区别。
                  </p>
                </div>
                <div className="glass-card p-6 space-y-4 hover:border-indigo-300 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Edit3 size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">角色定义</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    精细化角色（System Prompt）是智能体的灵魂。学习如何赋予其性格与专业度。
                  </p>
                </div>
                <div className="glass-card p-6 space-y-4 hover:border-indigo-300 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Wrench size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">工具调用</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    打破模型限制。让智能体能够搜索网页、运行代码或分析本地文件。
                  </p>
                </div>
              </div>

              <section className="bg-indigo-600 rounded-2xl p-8 text-white flex items-center justify-between shadow-lg shadow-indigo-100">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">开始设计你的第一个智能体</h2>
                  <p className="text-indigo-100 opacity-80">所有的配置都将保存在 IndexedDB 中，即使刷新页面也不会丢失。</p>
                </div>
                <button 
                  onClick={() => setActiveTab('design')}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center space-x-2 shadow-sm"
                >
                  <span>定义智能体</span>
                  <ChevronRight size={20} />
                </button>
              </section>
            </motion.div>
          )}

          {activeTab === 'design' && (
            <motion.div 
              key="design"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-end">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-left">Agent Definition</h1>
                  <p className="text-slate-500 text-sm italic">定义你的本地智能体的个性、约束和运行逻辑。</p>
                </div>
                <button 
                  onClick={handleSave}
                  className="btn-primary"
                >
                  <Save size={16} />
                  <span>{editingAgent.id ? 'Save Configuration' : 'Create Agent'}</span>
                </button>
              </header>

              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-7 space-y-6 text-left">
                  <div className="glass-card p-6 space-y-6 text-left">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Agent Name</label>
                      <input 
                        type="text" 
                        placeholder="智能教学助手..."
                        value={editingAgent.name}
                        onChange={(e) => setEditingAgent({...editingAgent, name: e.target.value})}
                        className="input-field text-base"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">System Prompt (Instruction)</label>
                        <button 
                          onClick={refinePrompt}
                          disabled={isGenerating || !editingAgent.systemPrompt}
                          className="text-indigo-600 text-[10px] font-bold flex items-center space-x-1 hover:bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          <Sparkles size={10} />
                          <span>{isGenerating ? 'AI OPTIMIZING...' : 'AI ASSISTANT'}</span>
                        </button>
                      </div>
                      <textarea 
                        placeholder="You are a helpful teaching assistant..."
                        rows={12}
                        value={editingAgent.systemPrompt}
                        onChange={(e) => setEditingAgent({...editingAgent, systemPrompt: e.target.value})}
                        className="input-field font-mono text-xs leading-relaxed h-[320px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 space-y-6 text-left">
                  <div className="glass-card p-6 space-y-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Base Architecture</label>
                      <select 
                        value={editingAgent.model}
                        onChange={(e) => setEditingAgent({...editingAgent, model: e.target.value})}
                        className="input-field"
                      >
                        {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block text-left">Capabilities (Tools)</label>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {['实时搜索', '代码执行', '文件分析', '图表生成'].map(tool => (
                          <label key={tool} className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border transition-all ${editingAgent.capabilities?.includes(tool) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={editingAgent.capabilities?.includes(tool)}
                              onChange={(e) => {
                                const caps = editingAgent.capabilities || [];
                                const newCaps = e.target.checked 
                                  ? [...caps, tool]
                                  : caps.filter(c => c !== tool);
                                setEditingAgent({...editingAgent, capabilities: newCaps});
                              }}
                            />
                            <Wrench size={14} className={editingAgent.capabilities?.includes(tool) ? 'text-indigo-600' : 'text-slate-400'} />
                            <span className="text-xs font-semibold">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-6 font-mono text-[10px] text-indigo-300 shadow-inner space-y-4">
                    <div className="space-y-1 text-left">
                      <p className="text-slate-500 font-bold mb-2 uppercase tracking-widest">// Local Storage Mirror</p>
                      <div className="opacity-80 leading-loose">
                        {`{`}
                        <br />&nbsp;&nbsp;"id": "{editingAgent.id || 'draft_temp'}",
                        <br />&nbsp;&nbsp;"name": "{editingAgent.name || 'Untitled'}",
                        <br />&nbsp;&nbsp;"config": {`{`}
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;"tools": {editingAgent.capabilities?.length || 0},
                        <br />&nbsp;&nbsp;&nbsp;&nbsp;"sync": true
                        <br />&nbsp;&nbsp;{`}`},
                        <br />&nbsp;&nbsp;"status": "PROTOTYPE"
                        <br />{`}`}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-left">
                      <span className="text-slate-500 font-bold">STATE: INDEXED_DB</span>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    </div>
                  </div>

                  <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-4 flex gap-3 text-left">
                    <div className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5">
                      <Brain size={18} />
                    </div>
                    <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                      <strong>Persistence Guard:</strong> 所有的更改都在本地安全加密并同步，确保您可以随时找回您的核心逻辑。
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'my-agents' && (
            <motion.div 
              key="my-agents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <header className="flex justify-between items-center text-left">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Local Agent Drafts</h1>
                  <p className="text-slate-500 text-sm">您所有已保存的项目和智能体定义。</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingAgent({ name: '', systemPrompt: '', model: MODELS[0], capabilities: [] });
                    setActiveTab('design');
                  }}
                  className="btn-primary"
                >
                  <Plus size={16} />
                  <span>Create New Draft</span>
                </button>
              </header>

              {agents.length === 0 ? (
                <div className="glass-card p-16 text-center flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Bot size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-center">No Drafts Found</p>
                    <p className="text-sm text-slate-400 text-center">开始您的第一个智能体设计项目。</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agents.map(agent => (
                    <div key={agent.id} className="glass-card hover:border-indigo-400 transition-all p-6 space-y-6 group text-left">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-slate-800">{agent.name}</h3>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">{agent.model}</span>
                             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded tracking-widest uppercase">Verified</span>
                          </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(agent)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(agent.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="h-20 overflow-hidden relative border-l-2 border-slate-100 pl-4">
                        <div className="text-xs text-slate-500 font-mono leading-relaxed line-clamp-3">
                          {agent.systemPrompt}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <div className="flex gap-1">
                          {agent.capabilities.slice(0, 2).map(cap => (
                            <span key={cap} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded">
                              {cap}
                            </span>
                          ))}
                          {agent.capabilities.length > 2 && <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 text-slate-400 rounded">+{agent.capabilities.length - 2}</span>}
                        </div>
                        <button 
                          onClick={() => handleEdit(agent)}
                          className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                        >
                          Modify Logic →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
    </>
  );
}
