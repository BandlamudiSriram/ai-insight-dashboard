
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Trash2, Plus, HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Query = {
  id: string;
  text: string;
  timestamp: Date;
};

interface QueryHistoryProps {
  queries: Query[];
  onSelectQuery: (query: Query) => void;
  onClearHistory: () => void;
}

const QueryHistory = ({ queries, onSelectQuery, onClearHistory }: QueryHistoryProps) => {
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (queries.length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/30 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Recent Queries</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <motion.div 
            className="rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/10 dark:to-purple-400/10 p-3 mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Plus className="h-6 w-6 text-purple-500 dark:text-purple-400" />
          </motion.div>
          <p className="text-sm text-muted-foreground mb-1">
            Your recent queries will appear here
          </p>
          <p className="text-xs text-muted-foreground">
            Start by asking a question about your data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-white/20 dark:border-gray-700/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </motion.div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Recent Queries</span>
        </CardTitle>
        <motion.button 
          onClick={onClearHistory}
          className="text-xs text-muted-foreground hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-full hover:bg-red-500/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear all</span>
        </motion.button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          <motion.div 
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {queries.map((query) => (
              <motion.div
                key={query.id}
                variants={itemVariants}
                onClick={() => onSelectQuery(query)}
                className="p-3 text-sm border border-white/10 dark:border-gray-700/30 rounded-md cursor-pointer hover:bg-blue-500/5 dark:hover:bg-blue-400/5 transition-all duration-300 hover:shadow-md group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 20px rgba(122, 90, 248, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                layout
              >
                <p className="truncate font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{query.text}</p>
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <HistoryIcon className="h-3 w-3 mr-1 opacity-70" />
                    {formatDistanceToNow(query.timestamp, { addSuffix: true })}
                  </div>
                  <motion.button 
                    className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuery(query);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Use again
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default QueryHistory;
