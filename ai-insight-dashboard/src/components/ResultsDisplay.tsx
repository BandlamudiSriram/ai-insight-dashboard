
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowUpRight, BarChart3, PieChart as PieChartIcon, LineChart as LineIcon, LoaderCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ChartData = {
  name: string;
  value: number;
}[];

interface ResultsDisplayProps {
  query: string;
  isProcessing: boolean;
  chartData: ChartData | null;
  insight?: string;
}

type ChartType = 'bar' | 'line' | 'pie' | 'area';

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#14b8a6', '#84cc16'];

const chartConfig = {
  revenue: { 
    label: 'Revenue',
    theme: { light: '#6366f1', dark: '#818cf8' }
  },
  users: { 
    label: 'Users',
    theme: { light: '#8b5cf6', dark: '#a78bfa' }
  },
  growth: { 
    label: 'Growth',
    theme: { light: '#d946ef', dark: '#e879f9' }
  },
};

const ResultsDisplay = ({ query, isProcessing, chartData, insight }: ResultsDisplayProps) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  
  const getDefaultChartType = (): ChartType => {
    if (!query) return 'bar';
    
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('compare') || queryLower.includes('breakdown')) {
      return 'pie';
    } else if (queryLower.includes('growth') || queryLower.includes('trend') || queryLower.includes('over time')) {
      return 'line';
    } else if (queryLower.includes('cumulative') || queryLower.includes('total')) {
      return 'area';
    } else {
      return 'bar';
    }
  };
  
  useEffect(() => {
    if (query) {
      setChartType(getDefaultChartType());
    }
  }, [query]);

  const renderChart = () => {
    if (!chartData) return null;
    
    switch (chartType) {
      case 'line':
        return (
          <motion.div 
            className="h-[400px] w-full"
            key="line-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer 
              config={chartConfig}
              className="h-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  width={40}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-revenue)" 
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: "var(--color-revenue)" }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ChartContainer>
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <LineIcon className="h-4 w-4 mr-2" />
              Trend Analysis
            </div>
          </motion.div>
        );
        
      case 'pie':
        return (
          <motion.div 
            className="h-[400px] w-full"
            key="pie-chart"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer 
              config={chartConfig}
              className="h-full"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  animationDuration={1000}
                  animationBegin={200}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Comparative Analysis
            </div>
          </motion.div>
        );
        
      case 'area':
        return (
          <motion.div 
            className="h-[400px] w-full"
            key="area-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer 
              config={chartConfig}
              className="h-full"
            >
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-revenue)" 
                  fill="var(--color-revenue)" 
                  fillOpacity={0.3} 
                  animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Cumulative Analysis
            </div>
          </motion.div>
        );
        
      default: // bar
        return (
          <motion.div 
            className="h-[400px] w-full"
            key="bar-chart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer 
              config={chartConfig}
              className="h-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-revenue)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                  animationBegin={200}
                />
              </BarChart>
            </ChartContainer>
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              Distribution Analysis
            </div>
          </motion.div>
        );
    }
  };

  const renderLoading = () => {
    return (
      <motion.div 
        className="h-64 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-12 w-12 mb-4">
          <motion.div 
            className="absolute top-0 h-12 w-12 rounded-full border-4 border-solid border-primary border-r-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          ></motion.div>
        </div>
        <div className="space-y-2 text-center">
          <motion.p 
            className="font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Processing your query...
          </motion.p>
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Analyzing data and preparing insights with Gemini AI
          </motion.p>
        </div>
      </motion.div>
    );
  };

  const renderEmptyState = () => {
    return (
      <motion.div 
        className="h-64 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 p-6 rounded-full bg-secondary/40">
          <LoaderCircle 
            className="h-10 w-10 text-muted-foreground"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="font-medium text-xl mb-2">Ready for insights</h3>
        <p className="text-muted-foreground max-w-md">
          Enter a business question in the input field to analyze your data with Gemini AI and generate visualizations.
        </p>
      </motion.div>
    );
  };

  const renderChartTypeSelector = () => {
    if (!chartData) return null;

    return (
      <div className="mb-6 flex justify-center">
        <ToggleGroup 
          type="single" 
          value={chartType} 
          onValueChange={(value) => value && setChartType(value as ChartType)}
          className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-md"
        >
          <ToggleGroupItem value="bar" aria-label="Bar Chart" className="flex items-center gap-1 rounded-md px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <BarChart3 className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Bar</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="line" aria-label="Line Chart" className="flex items-center gap-1 rounded-md px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <LineIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Line</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="pie" aria-label="Pie Chart" className="flex items-center gap-1 rounded-md px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <PieChartIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Pie</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="area" aria-label="Area Chart" className="flex items-center gap-1 rounded-md px-3 py-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Area</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  };

  const renderInsight = () => {
    if (!insight) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6"
      >
        <Alert className="bg-primary/5 border border-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-medium flex items-center">
            <span className="mr-2">AI Insight</span>
            <ArrowRight className="h-3 w-3" />
          </AlertTitle>
          <AlertDescription className="text-foreground">
            {insight}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  };

  return (
    <Card className="h-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {query ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <span className="text-muted-foreground text-sm font-normal">Query:</span>
              <span className="font-normal ml-2 text-lg">{query}</span>
            </motion.div>
          ) : (
            "Data Visualization"
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          renderLoading()
        ) : (
          chartData ? (
            <>
              {renderChartTypeSelector()}
              {renderChart()}
              {renderInsight()}
            </>
          ) : (
            renderEmptyState()
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
