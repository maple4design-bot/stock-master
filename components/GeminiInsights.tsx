
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { InventoryItem, Transaction } from '../types';

interface GeminiInsightsProps {
  inventory: InventoryItem[];
  transactions: Transaction[];
}

const GeminiInsights: React.FC<GeminiInsightsProps> = ({ inventory, transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeInventory = async () => {
    if (!process.env.API_KEY) return;
    setLoading(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As an expert supply chain analyst for SR StockMaster, analyze this stock maintenance data and provide 3 actionable insights:
        Inventory (Stock on Hand): ${JSON.stringify(inventory)}
        Recent Movement Logs: ${JSON.stringify(transactions.slice(0, 10))}
        
        Format your response in concise bullet points. Focus STRICTLY on:
        1. Stock movement patterns (Which items move the most/least)
        2. Low remaining stock alerts
        3. Carry value (unit rate) fluctuations across recent stock-in logs
        
        IMPORTANT: Do not mention total financial valuations or total stock money value. Focus only on Quantities and Carry Rates.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      setInsight(response.text || "Could not generate insights at this moment.");
    } catch (error) {
      console.error(error);
      setInsight("Error connecting to Gemini AI for analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <BrainCircuit size={18} />
        </div>
        <h3 className="font-bold text-indigo-900">AI Stock Analysis</h3>
      </div>
      
      <p className="text-sm text-indigo-700/80 mb-6">
        Let Gemini analyze your stock movement patterns and carry rates to optimize maintenance.
      </p>

      {insight ? (
        <div className="flex-1 bg-white/50 rounded-xl p-4 text-sm text-indigo-900 space-y-3 border border-white/60 shadow-inner overflow-y-auto">
          {insight.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <button 
            onClick={() => setInsight(null)}
            className="mt-4 text-xs font-bold text-indigo-600 hover:underline"
          >
            Clear and Re-analyze
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <Sparkles className="text-indigo-300 mb-4" size={40} />
          <button
            onClick={analyzeInventory}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing Logs...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Insights
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-indigo-100 flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
        <span>Powered by Gemini 3</span>
        <span>Quantity Analytics</span>
      </div>
    </div>
  );
};

export default GeminiInsights;
