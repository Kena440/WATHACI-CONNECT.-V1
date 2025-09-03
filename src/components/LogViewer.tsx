/**
 * Log Viewer component for debugging and monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogger } from '@/contexts/LoggerContext';
import { LogEntry, LogLevel } from '@/lib/logger';
import { Download, Trash2, Refresh, Filter, Settings } from 'lucide-react';

export const LogViewer: React.FC = () => {
  const { getLogs, clearLogs, exportLogs, getLogStats } = useLogger();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState<{
    level?: LogLevel;
    source?: string;
    search?: string;
  }>({});

  const refreshLogs = useCallback(() => {
    const currentLogs = getLogs();
    setLogs(currentLogs);
    setStats(getLogStats());
  }, [getLogs, getLogStats]);

  useEffect(() => {
    refreshLogs();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  useEffect(() => {
    let filtered = [...logs];

    if (filter.level !== undefined) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter.source) {
      filtered = filtered.filter(log => 
        log.source?.toLowerCase().includes(filter.source!.toLowerCase())
      );
    }

    if (filter.search) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(filter.search!.toLowerCase()) ||
        JSON.stringify(log.data || {}).toLowerCase().includes(filter.search!.toLowerCase())
      );
    }

    setFilteredLogs(filtered.reverse()); // Show newest first
  }, [logs, filter]);

  const handleExport = () => {
    const logData = exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wathaci-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      clearLogs();
      refreshLogs();
    }
  };

  const getLevelBadgeVariant = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return 'destructive';
      case LogLevel.WARN:
        return 'secondary';
      case LogLevel.INFO:
        return 'default';
      case LogLevel.DEBUG:
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const LogEntryComponent: React.FC<{ log: LogEntry }> = ({ log }) => (
    <div className="border-b pb-2 mb-2 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Badge variant={getLevelBadgeVariant(log.level)}>
            {LogLevel[log.level]}
          </Badge>
          {log.source && (
            <Badge variant="outline" className="text-xs">
              {log.source}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
        {log.userId && (
          <Badge variant="outline" className="text-xs">
            User: {log.userId.substring(0, 8)}...
          </Badge>
        )}
      </div>
      <div className="text-sm">{log.message}</div>
      {log.data && (
        <details className="mt-1">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            View Data
          </summary>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(log.data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Application Logs
            </CardTitle>
            <CardDescription>
              Real-time application logging and monitoring
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshLogs}>
              <Refresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearLogs}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <select
                value={filter.level ?? ''}
                onChange={(e) => setFilter(prev => ({
                  ...prev,
                  level: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">All Levels</option>
                <option value={LogLevel.DEBUG}>Debug</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.WARN}>Warn</option>
                <option value={LogLevel.ERROR}>Error</option>
              </select>
              
              <input
                type="text"
                placeholder="Filter by source..."
                value={filter.source || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
                className="px-2 py-1 border rounded text-sm"
              />
              
              <input
                type="text"
                placeholder="Search logs..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="px-2 py-1 border rounded text-sm flex-1"
              />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilter({})}
              >
                Clear Filters
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} logs
            </div>

            <ScrollArea className="h-[400px] w-full border rounded-md p-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No logs found matching your filters
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <LogEntryComponent key={index} log={log} />
                ))
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalLogs || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Storage Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatFileSize(stats.sizeInBytes || 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Oldest Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {stats.oldestLog ? 
                      new Date(stats.oldestLog).toLocaleString() : 
                      'N/A'
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Newest Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {stats.newestLog ? 
                      new Date(stats.newestLog).toLocaleString() : 
                      'N/A'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Log Distribution by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.values(LogLevel)
                    .filter(val => typeof val === 'number')
                    .map(level => {
                      const count = logs.filter(log => log.level === level).length;
                      const percentage = logs.length ? (count / logs.length * 100).toFixed(1) : 0;
                      return (
                        <div key={level} className="flex items-center justify-between">
                          <Badge variant={getLevelBadgeVariant(level as LogLevel)}>
                            {LogLevel[level as LogLevel]}
                          </Badge>
                          <span className="text-sm">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};