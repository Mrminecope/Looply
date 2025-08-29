import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  Database,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { dataExportService, type ImportOptions } from '../../utils/data-export';

interface DataManagementProps {
  userId: string;
  onDataChange?: () => void;
}

export function DataManagement({ userId, onDataChange }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [exportStats, setExportStats] = useState(dataExportService.getExportStats(userId));
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    mergeData: true,
    overwriteExisting: false,
    preserveIds: true,
    importAnalytics: true
  });

  // Handle data export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      await dataExportService.downloadUserData(userId);
      
      // Update stats after export
      setExportStats(dataExportService.getExportStats(userId));
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle data import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON file');
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(0);

      const fileContent = await file.text();
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await dataExportService.importUserData(fileContent, userId, importOptions);
      
      clearInterval(progressInterval);
      setImportProgress(100);

      if (result.success) {
        toast.success('Data imported successfully!');
        setExportStats(dataExportService.getExportStats(userId));
        onDataChange?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  // Handle clear all data
  const handleClearData = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    try {
      await dataExportService.clearAllUserData(userId);
      setExportStats(dataExportService.getExportStats(userId));
      onDataChange?.();
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Failed to clear data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Data Overview
          </CardTitle>
          <CardDescription>
            Summary of your stored data and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="text-center p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-primary">{exportStats.posts}</div>
              <div className="text-sm text-muted-foreground">Posts Created</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-primary">{exportStats.communities}</div>
              <div className="text-sm text-muted-foreground">Communities Joined</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-primary">{exportStats.notifications}</div>
              <div className="text-sm text-muted-foreground">Notifications</div>
            </motion.div>
            
            <motion.div 
              className="text-center p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl font-bold text-primary">{exportStats.dataSize}</div>
              <div className="text-sm text-muted-foreground">Total Data Size</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download a complete backup of your SocialFlow data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              Export includes your profile, posts, communities, notifications, and analytics. 
              The file can be imported later to restore your data.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Complete Data Backup</p>
              <p className="text-sm text-muted-foreground">JSON format, all your data included</p>
            </div>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="size-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <Download className="size-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore data from a SocialFlow backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Options */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium">Import Options</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="merge-data">Merge with existing data</Label>
                  <p className="text-xs text-muted-foreground">Keep existing data and add imported data</p>
                </div>
                <Switch
                  id="merge-data"
                  checked={importOptions.mergeData}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, mergeData: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="overwrite-existing">Overwrite existing</Label>
                  <p className="text-xs text-muted-foreground">Replace duplicate items with imported ones</p>
                </div>
                <Switch
                  id="overwrite-existing"
                  checked={importOptions.overwriteExisting}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, overwriteExisting: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="import-analytics">Include analytics</Label>
                  <p className="text-xs text-muted-foreground">Import usage statistics and metrics</p>
                </div>
                <Switch
                  id="import-analytics"
                  checked={importOptions.importAnalytics}
                  onCheckedChange={(checked) => 
                    setImportOptions(prev => ({ ...prev, importAnalytics: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing data...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Select Backup File</p>
              <p className="text-sm text-muted-foreground">Choose a SocialFlow JSON backup file</p>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button disabled={isImporting} className="min-w-[120px]">
                <Upload className="size-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="size-4" />
            <AlertDescription className="text-destructive">
              <strong>Warning:</strong> This action cannot be undone. All your posts, communities, 
              notifications, and analytics will be permanently deleted.
            </AlertDescription>
          </Alert>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">Delete All Data</p>
              <p className="text-sm text-muted-foreground">Permanently remove all your SocialFlow data</p>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              className="min-w-[120px]"
            >
              <Trash2 className="size-4 mr-2" />
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}