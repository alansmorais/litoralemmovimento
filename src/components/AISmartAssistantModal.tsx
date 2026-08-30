import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Compass, Clock, ShieldCheck } from 'lucide-react';

interface AISmartAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISmartAssistantModal: React.FC<AISmartAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: 'Olá! Sou o Concierge Virtual da Litoral em Movimento. Como posso ajudar com sua rota entre São Paulo e o Litoral Norte? Dúvidas sobre horários da balsa de Ilhabela, melhores saídas na Tamoios ou bagagens na Chevrolet Spin?',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/trip-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: userText,
          origin: 'São Paulo',
          destination: 'Litoral Norte (São Sebastião, Ilhabela, Caraguá)',
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.response || 'Recomendamos agendar seu transfer com antecedência para garantir as melhores condições de descida e balsa.',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Para o Litoral Norte, os melhores horários de saída são pela manhã até às 06h30 ou após as 10h00 pela Rodovia dos Tamoios. Nossa equipe em Chevrolet Spin 7 lugares garante ar-condicionado duplo e conforto!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Qual o melhor horário para descer para Ilhabela na sexta-feira?',
    'Quantas malas cabem na Chevrolet Spin 7 Lugares?',
    'Como funciona a travessia de balsa em Ilhabela no transfer?',
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 text-slate-100 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 border border-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center border border-sky-400 shadow-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-serif-display font-bold text-lg text-white">
              Concierge Virtual Litoral AI
            </h3>
            <p className="text-xs text-slate-400">
              Dicas inteligentes de trânsito, balsa e roteiros
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  m.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-sky-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800 text-white border border-slate-700 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-400 p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Consultando informações de rota e balsa...</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickPrompts.map((q, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => {
                setInputQuery(q);
              }}
              className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            placeholder="Faça uma pergunta sobre a viagem ou rota..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
