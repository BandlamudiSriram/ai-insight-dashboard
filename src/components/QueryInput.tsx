import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SendIcon, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  isProcessing: boolean;
  suggestedQueries?: string[];
}

const QueryInput = ({ onSubmit, isProcessing, suggestedQueries = [] }: QueryInputProps) => {
  const [query, setQuery] = useState<string>('');
  const [isTypingEffect, setIsTypingEffect] = useState<boolean>(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<string>('');
  const [suggestionIndex, setSuggestionIndex] = useState<number>(0);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSubmit(suggestion);
  };

  useEffect(() => {
    if (suggestedQueries.length === 0 || isProcessing) return;
    
    const interval = setInterval(() => {
      setSuggestionIndex((prevIndex) => 
        prevIndex >= suggestedQueries.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [suggestedQueries, isProcessing]);

  useEffect(() => {
    if (suggestedQueries.length === 0) return;
    
    const currentQuery = suggestedQueries[suggestionIndex];
    let charIndex = 0;
    setCurrentSuggestion('');
    setIsTypingEffect(true);
    
    const typingInterval = setInterval(() => {
      if (charIndex < currentQuery.length) {
        setCurrentSuggestion(prev => prev + currentQuery.charAt(charIndex));
        charIndex++;
      } else {
        setIsTypingEffect(false);
        clearInterval(typingInterval);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, [suggestionIndex, suggestedQueries]);

  return (
    <motion.div 
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-400" />
        </motion.div>
        <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Ask Your Data</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <AnimatePresence>
            {isInputFocused && !isProcessing && (
              <motion.div 
                className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-lg border-2 border-purple-500/50 dark:border-purple-400/50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          
          <motion.div 
            className={`absolute left-3 top-3 transition-colors ${isInputFocused ? 'text-purple-500 dark:text-purple-400' : 'text-muted-foreground'}`}
            animate={{ scale: isInputFocused ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="h-4 w-4" />
          </motion.div>

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder={isTypingEffect ? currentSuggestion : "Type your business question..."}
            className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-2 focus:border-purple-500/50 dark:focus:border-purple-400/50 transition-all duration-300 rounded-lg shadow-sm"
            disabled={isProcessing}
          />
          
          {query && (
            <motion.button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              ×
            </motion.button>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 hover:from-blue-500 hover:via-purple-400 hover:to-pink-400 text-white font-medium transition-all duration-500 shadow-md hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-400/20" 
          disabled={isProcessing || !query.trim()}
        >
          <motion.span 
            className="absolute inset-0 w-0 bg-white/20"
            animate={{ width: isProcessing ? '100%' : '0%' }}
            transition={{ duration: isProcessing ? 1.5 : 0.3, ease: "easeInOut" }}
          ></motion.span>
          <span className="relative flex items-center justify-center">
            {isProcessing ? (
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Zap className="h-4 w-4" />
                </motion.div>
                Processing...
              </motion.div>
            ) : (
              <>
                Submit Query 
                <SendIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </form>

      {suggestedQueries.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
            <Zap className="h-3 w-3 mr-1 text-purple-500 dark:text-purple-400" />
            Dataset Overview
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Your CSV or Excel file can contain various data types like sales, customer info, 
            financial records, or product details. Analyze trends, generate insights, 
            and explore your data through natural language queries.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default QueryInput;
