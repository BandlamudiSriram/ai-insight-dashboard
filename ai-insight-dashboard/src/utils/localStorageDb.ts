
// Types for our data
export interface QueryData {
  id: string;
  text: string;
  timestamp: Date;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

const STORAGE_KEY = 'dataquery-ai-history';

// Get stored queries from localStorage
const getStoredQueries = (): QueryData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    // Parse JSON and convert string dates back to Date objects
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Error parsing stored queries:', error);
    return [];
  }
};

// Save queries to localStorage
const saveStoredQueries = (queries: QueryData[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
};

export const saveQuery = async (query: QueryData): Promise<boolean> => {
  try {
    const queries = getStoredQueries();
    queries.unshift(query); // Add new query to the beginning
    saveStoredQueries(queries);
    return true;
  } catch (error) {
    console.error('Failed to save query:', error);
    return false;
  }
};

export const getQueries = async (): Promise<QueryData[]> => {
  try {
    return getStoredQueries();
  } catch (error) {
    console.error('Failed to get queries:', error);
    return [];
  }
};

export const clearQueries = async (): Promise<boolean> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear queries:', error);
    return false;
  }
};
