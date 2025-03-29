
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

interface FileUploadProps {
  onDataLoad: (data: any[]) => void;
}

const FileUpload = ({ onDataLoad }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check file type
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        throw new Error("Please upload a CSV or Excel file");
      }

      setFileName(file.name);
      
      // Read file
      const data = await readFile(file);
      if (data && data.length > 0) {
        onDataLoad(data);
        toast({
          title: "File loaded successfully",
          description: `${data.length} rows of data imported`,
        });
      } else {
        throw new Error("No data found in file");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error processing file");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error processing file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error("Failed to read file"));
            return;
          }
          
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  return (
    <Card className="shadow-md border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-primary" />
          Data Import
        </CardTitle>
        <CardDescription>
          Upload a CSV or Excel file to analyze your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        
        <div
          className={`border-2 rounded-lg p-6 text-center transition-all ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-dashed border-gray-300 dark:border-gray-600 hover:border-primary/50 dark:hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 flex flex-col items-center"
              >
                <div className="relative h-12 w-12 mb-3">
                  <motion.div 
                    className="absolute top-0 h-12 w-12 rounded-full border-4 border-solid border-primary border-r-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                </div>
                <p className="text-sm text-muted-foreground">Processing your file...</p>
              </motion.div>
            ) : fileName ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="flex items-center justify-center mb-2">
                  <FileSpreadsheet className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground mt-1">File loaded successfully</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleButtonClick}
                  className="mt-4"
                >
                  Replace File
                </Button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4"
              >
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
                <p className="font-medium text-red-500 dark:text-red-400">Upload Error</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleButtonClick}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8"
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium mb-1">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button 
                  variant="secondary" 
                  onClick={handleButtonClick}
                  className="mt-2"
                >
                  Browse Files
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: CSV, XLSX, XLS
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
