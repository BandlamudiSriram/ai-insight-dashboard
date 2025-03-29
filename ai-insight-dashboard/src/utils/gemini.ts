
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface GeminiResponse {
  chartType: 'bar' | 'line' | 'pie' | 'area';
  chartData: { name: string; value: number }[];
  insight: string;
}

// Function to extract meaningful data points from the dataset based on the query
function extractDataFromDataset(data: any[], query: string, maxDataPoints = 8): { name: string; value: number }[] {
  if (!data || data.length === 0) return [];
  
  // Get the most relevant column(s) for the query
  const columns = Object.keys(data[0]);
  
  // Look for numeric columns (potential values)
  const numericColumns = columns.filter(col => {
    return typeof data[0][col] === 'number' || !isNaN(parseFloat(data[0][col]));
  });
  
  // Look for categorical columns (potential categories)
  const categoricalColumns = columns.filter(col => {
    return typeof data[0][col] === 'string' && !numericColumns.includes(col);
  });
  
  // If no suitable columns found, return empty array
  if (numericColumns.length === 0) return [];
  
  let valueColumn = numericColumns[0]; // Default to first numeric column
  let categoryColumn: string | null = categoricalColumns.length > 0 ? categoricalColumns[0] : null;
  
  // Try to find most relevant columns based on query terms
  const queryLower = query.toLowerCase();
  
  // Check for numeric column mentions in query
  for (const col of numericColumns) {
    if (queryLower.includes(col.toLowerCase())) {
      valueColumn = col;
      break;
    }
  }
  
  // Check for categorical column mentions in query
  for (const col of categoricalColumns) {
    if (queryLower.includes(col.toLowerCase())) {
      categoryColumn = col;
      break;
    }
  }
  
  // If we have both category and value columns
  if (categoryColumn) {
    // Group by category and sum values
    const aggregated: Map<string, number> = new Map();
    
    data.forEach(row => {
      const category = String(row[categoryColumn as string]);
      const value = parseFloat(row[valueColumn]);
      
      if (!isNaN(value)) {
        aggregated.set(category, (aggregated.get(category) || 0) + value);
      }
    });
    
    // Convert to chart data format
    const chartData = Array.from(aggregated.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, maxDataPoints);
    
    return chartData;
  } else {
    // Just use the value column directly
    return data
      .slice(0, maxDataPoints)
      .map((row, index) => ({
        name: `Item ${index + 1}`,
        value: parseFloat(row[valueColumn])
      }))
      .filter(item => !isNaN(item.value));
  }
}

export const generateDataInsight = async (query: string, data: any[] = []): Promise<GeminiResponse | null> => {
  try {
    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'provide_API_key' || apiKey === 'upload_API_key') {
      console.error('Gemini API key is missing. Please provide your API key and set VITE_GEMINI_API_KEY in your environment variables.');
      
      // Return fallback data
      return generateFallbackResponse(query, data);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const generationConfig = {
      temperature: 0.2,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Extract chart data from the dataset
    const chartData = extractDataFromDataset(data, query);
    
    if (chartData.length === 0) {
      throw new Error("Unable to extract meaningful data points from the dataset");
    }

    // Create a sample of the data to include in the prompt
    const dataSample = JSON.stringify(data.slice(0, 5));
    const columns = data.length > 0 ? Object.keys(data[0]).join(", ") : "";
    const totalRows = data.length;
    
    // Create a JSON string representation of the chart data to send to Gemini
    const chartDataString = JSON.stringify(chartData);

    const prompt = `
    You are an assistant for a business analytics dashboard. Analyze this data and provide insights.
    
    Dataset Info:
    - Total rows: ${totalRows}
    - Columns: ${columns}
    - Sample data: ${dataSample}
    
    User Query: "${query}"
    
    Chart data that has been extracted: ${chartDataString}
    
    Please provide:
    1. The most suitable chart type for this data (choose one: bar, line, pie, area)
    2. A brief insight about what this data shows. Focus on trends, patterns, and notable findings visible in the data. Be concise and business-focused.
    
    Format your response as a valid JSON object with these fields:
    {
      "chartType": "bar OR line OR pie OR area",
      "insight": "Brief analysis focusing on what the data shows and key business insights"
    }
    `;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });
      
      const response = result.response;
      const text = response.text();
      
      // Extract the JSON from the response text - Gemini sometimes wraps it with markdown code blocks
      const jsonMatch = text.match(/```(?:json)?(.*?)```/s) || text.match(/({.*})/s);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonText);
      } catch (err) {
        console.error("Failed to parse Gemini response as JSON:", err);
        console.log("Response text:", text);
        throw new Error("Failed to parse AI response");
      }
      
      return {
        chartType: parsedResponse.chartType || 'bar',
        chartData: chartData,
        insight: parsedResponse.insight || 'No insights available'
      };
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return generateFallbackResponse(query, data, chartData);
    }
  } catch (error) {
    console.error('Error in generateDataInsight:', error);
    return generateFallbackResponse(query, data);
  }
};

function generateFallbackResponse(query: string, data: any[], chartData?: any[]): GeminiResponse {
  // Use extracted data if available, otherwise create sample data
  const dataForChart = chartData && chartData.length > 0 
    ? chartData 
    : [
        { name: 'Sample Data 1', value: 120 },
        { name: 'Sample Data 2', value: 150 },
        { name: 'Sample Data 3', value: 200 },
        { name: 'Sample Data 4', value: 80 }
      ];
  
  let chartType: 'bar' | 'line' | 'pie' | 'area' = 'bar';
  
  // Try to pick an appropriate chart type based on the query
  const queryLower = query.toLowerCase();
  if (queryLower.includes('trend') || queryLower.includes('over time') || queryLower.includes('growth')) {
    chartType = 'line';
  } else if (queryLower.includes('compare') || queryLower.includes('percentage') || queryLower.includes('distribution')) {
    chartType = 'pie';
  } else if (queryLower.includes('cumulative') || queryLower.includes('total')) {
    chartType = 'area';
  }
  
  return {
    chartType,
    chartData: dataForChart,
    insight: "The data shows variation among different categories, with some showing higher values than others. For more detailed insights, please check your Gemini API configuration or upload data that better matches your query."
  };
}
