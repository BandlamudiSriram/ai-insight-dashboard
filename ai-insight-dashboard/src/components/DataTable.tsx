
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Search } from "lucide-react";

interface DataTableProps {
  data: any[];
}

const DataTable = ({ data }: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get all column keys from the first data item
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);
  
  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const lowercasedTerm = searchTerm.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(
        value => 
          value !== null && 
          value !== undefined && 
          String(value).toLowerCase().includes(lowercasedTerm)
      );
    });
  }, [data, searchTerm]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-primary" />
            Data Overview
          </div>
          <div className="text-sm font-normal text-muted-foreground">
            {filteredData.length} of {data.length} rows
          </div>
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[300px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column} className="text-xs uppercase">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice(0, 100).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`} className="py-2">
                      {typeof row[column] === 'number' 
                        ? row[column].toLocaleString() 
                        : String(row[column] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredData.length > 100 && (
          <div className="text-center text-xs text-muted-foreground py-2 border-t">
            Showing first 100 of {filteredData.length} matching rows
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
