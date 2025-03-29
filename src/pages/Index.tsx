
import { useState, useEffect } from 'react';
import QueryInput from '@/components/QueryInput';
import QueryHistory from '@/components/QueryHistory';
import ResultsDisplay from '@/components/ResultsDisplay';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateDataInsight } from '@/utils/gemini';
import { saveQuery, getQueries, clearQueries, QueryData } from '@/utils/localStorageDb';

type ChartData = {
  name: string;
  value: number;
}[];

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [queryHistory, setQueryHistory] = useState<QueryData[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [insight, setInsight] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const { toast } = useToast();
  const [apiKeyWarningShown, setApiKeyWarningShown] = useState<boolean>(false);

  // Define the loadQueryHistory function
  const loadQueryHistory = async () => {
    try {
      const queries = await getQueries();
      setQueryHistory(queries);
    } catch (error) {
      console.error("Failed to load query history:", error);
    }
  };

  useEffect(() => {
    loadQueryHistory();
    
    // Check if API key is set
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'provide_API_key' || apiKey === 'upload_API_key') {
      if (!apiKeyWarningShown) {
        toast({
          title: "API Key Required",
          description: "Please provide your Gemini API key in environment variables to enable AI features.",
          variant: "destructive",
          duration: 6000,
        });
        setApiKeyWarningShown(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const generateSuggestedQueries = () => {
    if (!data || data.length === 0) {
      return [
        "Upload a file to generate insights",
        "Import your data to begin analysis",
      ];
    }

    const columns = Object.keys(data[0]);
    
    const suggestions = [];
    
    if (columns.some(col => /sales|revenue|income/i.test(col))) {
      suggestions.push("Show me revenue trends");
      suggestions.push("Compare sales by category");
    }
    
    if (columns.some(col => /user|customer|client/i.test(col))) {
      suggestions.push("How many customers do we have?");
      suggestions.push("Show customer distribution");
    }
    
    if (columns.some(col => /region|country|location|city/i.test(col))) {
      suggestions.push("Compare data by region");
      suggestions.push("Show top performing regions");
    }
    
    if (columns.some(col => /date|month|year|quarter/i.test(col))) {
      suggestions.push("Show monthly growth trends");
      suggestions.push("What's our year-over-year performance?");
    }
    
    if (columns.some(col => /product|item|sku/i.test(col))) {
      suggestions.push("What are our top products?");
      suggestions.push("Compare product performance");
    }
    
    while (suggestions.length < 4) {
      const genericQueries = [
        "Summarize the data",
        "Show key insights from data",
        "What are the main trends?",
        "Compare top values"
      ];
      
      for (const query of genericQueries) {
        if (!suggestions.includes(query)) {
          suggestions.push(query);
          break;
        }
      }
    }
    
    return suggestions.slice(0, 4);
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a query to process",
        variant: "destructive",
      });
      return;
    }

    if (!data || data.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please upload a CSV or Excel file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentQuery(query);

    const newQuery = {
      id: Date.now().toString(),
      text: query,
      timestamp: new Date(),
    };

    try {
      const response = await generateDataInsight(query, data);
      
      if (response) {
        setChartData(response.chartData);
        setInsight(response.insight);
        
        await saveQuery(newQuery);
        
        await loadQueryHistory();
        
        toast({
          title: "Query processed",
          description: "Generated insights are ready to view",
        });
      } else {
        throw new Error("Failed to generate insights");
      }
    } catch (error) {
      console.error("Error processing query:", error);
      toast({
        title: "Processing error",
        description: "There was a problem processing your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearQueries();
      setQueryHistory([]);
      toast({
        title: "History cleared",
        description: "Your query history has been cleared",
      });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({
        title: "Error clearing history",
        description: "There was a problem clearing your history",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleDataLoad = (loadedData: any[]) => {
    setData(loadedData);
    setChartData(null);
    setInsight('');
    setCurrentQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-white/20 dark:border-gray-700/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">DataQuery Dashboard</h1>
          </div>
          <div className="flex space-x-2 items-center">
            <button
              onClick={handleClearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Clear History
            </button>
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Data-Driven Insights</h2>
          <p className="text-xl text-muted-foreground">
            Upload your data and ask questions in natural language
          </p>
          
          {/* API Key Warning */}
          {(import.meta.env.VITE_GEMINI_API_KEY === 'provide_API_key' || import.meta.env.VITE_GEMINI_API_KEY === 'upload_API_key') && (
            <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg flex items-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">Please provide your Gemini API key in environment variables for AI features.</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onDataLoad={handleDataLoad} />
            
            <QueryInput 
              onSubmit={processQuery} 
              isProcessing={isProcessing}
              suggestedQueries={generateSuggestedQueries()}
            />
            
            <QueryHistory 
              queries={queryHistory} 
              onSelectQuery={(query) => setCurrentQuery(query.text)}
              onClearHistory={handleClearHistory}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {data && data.length > 0 && (
              <DataTable data={data} />
            )}
            
            <ResultsDisplay 
              query={currentQuery}
              isProcessing={isProcessing}
              chartData={chartData}
              insight={insight}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
