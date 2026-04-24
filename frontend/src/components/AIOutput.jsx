import { Sparkles, Cpu, Clock, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIOutput({ result, loading }) {
  if (loading) {
    return (
      <div className="ai-output rounded-2xl p-6 mt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-300">AI is thinking...</h3>
            <p className="text-xs text-slate-400">Generating response with Claude</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-700/50 rounded animate-pulse w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="ai-output rounded-2xl p-6 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-purple-300">AI Response</h3>
            <p className="text-xs text-slate-400">Powered by {result.model || 'Claude'}</p>
          </div>
        </div>
      </div>

      <div className="text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown>{result.content}</ReactMarkdown>
      </div>

      {result.usage && (
        <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {result.model}</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {result.usage.total_tokens} tokens</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {result.finishReason}</span>
        </div>
      )}
    </div>
  );
}
