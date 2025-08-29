import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Palette, 
  Download, 
  Upload, 
  Plus, 
  Trash2,
  Check,
  Moon,
  Sun,
  Sparkles,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { themeSystem, type ThemePreset } from '../../utils/theme-system';

interface ThemeCustomizerProps {
  userId: string;
}

export function ThemeCustomizer({ userId }: ThemeCustomizerProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset | null>(null);
  const [allThemes, setAllThemes] = useState<ThemePreset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'light' | 'dark' | 'colorful' | 'minimal'>('all');
  const [showCustomThemeDialog, setShowCustomThemeDialog] = useState(false);
  const [customThemeData, setCustomThemeData] = useState({
    name: '',
    description: '',
    category: 'colorful' as ThemePreset['category'],
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    isDark: false
  });

  useEffect(() => {
    refreshThemes();
  }, []);

  const refreshThemes = () => {
    setAllThemes(themeSystem.getAllThemes());
    setCurrentTheme(themeSystem.getCurrentTheme());
  };

  const filteredThemes = selectedCategory === 'all' 
    ? allThemes 
    : allThemes.filter(theme => theme.category === selectedCategory);

  const handleThemeSelect = (theme: ThemePreset) => {
    themeSystem.applyTheme(theme);
    setCurrentTheme(theme);
    toast.success(`${theme.name} theme applied!`);
  };

  const handleCreateCustomTheme = () => {
    if (!customThemeData.name.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    try {
      const generatedTheme = themeSystem.generateThemeFromColor(
        customThemeData.primaryColor,
        customThemeData.name,
        customThemeData.isDark
      );

      // Create the custom theme
      const customTheme = themeSystem.createCustomTheme(
        customThemeData.name,
        customThemeData.description || `Custom theme based on ${customThemeData.primaryColor}`,
        generatedTheme.colors,
        customThemeData.category
      );

      refreshThemes();
      handleThemeSelect(customTheme);
      setShowCustomThemeDialog(false);
      setCustomThemeData({
        name: '',
        description: '',
        category: 'colorful',
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        isDark: false
      });

      toast.success('Custom theme created!');
    } catch (error) {
      console.error('Failed to create custom theme:', error);
      toast.error('Failed to create custom theme');
    }
  };

  const handleDeleteCustomTheme = (themeId: string) => {
    if (!confirm('Are you sure you want to delete this custom theme?')) {
      return;
    }

    try {
      themeSystem.deleteCustomTheme(themeId);
      refreshThemes();
      
      // If deleted theme was current, reset to default
      if (currentTheme?.id === themeId) {
        themeSystem.resetToDefault();
        setCurrentTheme(themeSystem.getCurrentTheme());
      }
      
      toast.success('Custom theme deleted');
    } catch (error) {
      console.error('Failed to delete theme:', error);
      toast.error('Failed to delete theme');
    }
  };

  const handleExportTheme = () => {
    try {
      const themeJson = themeSystem.exportTheme();
      const blob = new Blob([themeJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${currentTheme?.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Theme exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export theme');
    }
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON file');
      return;
    }

    try {
      const fileContent = await file.text();
      const importedTheme = themeSystem.importTheme(fileContent);
      
      refreshThemes();
      toast.success(`Theme "${importedTheme.name}" imported successfully!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import theme');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'light': return <Sun className="size-4" />;
      case 'dark': return <Moon className="size-4" />;
      case 'colorful': return <Palette className="size-4" />;
      case 'minimal': return <Monitor className="size-4" />;
      default: return <Sparkles className="size-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5" />
            Current Theme
          </CardTitle>
          <CardDescription>
            Currently active theme and quick actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTheme && (
            <motion.div 
              className="flex items-center justify-between p-4 border rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-lg shadow-inner"
                  style={{ background: currentTheme.preview }}
                  whileHover={{ scale: 1.05 }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{currentTheme.name}</h3>
                    {getCategoryIcon(currentTheme.category)}
                    {'isCustom' in currentTheme && currentTheme.isCustom && (
                      <Badge variant="secondary" className="text-xs">Custom</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportTheme}>
                  <Download className="size-4 mr-2" />
                  Export
                </Button>
                {'isCustom' in currentTheme && currentTheme.isCustom && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCustomTheme(currentTheme.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Theme Gallery</TabsTrigger>
          <TabsTrigger value="create">Create Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="presets" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'light', 'dark', 'colorful', 'minimal'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category as any)}
                className="flex items-center gap-2 capitalize whitespace-nowrap"
              >
                {category !== 'all' && getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                    currentTheme?.id === theme.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleThemeSelect(theme)}
                >
                  {/* Theme Preview */}
                  <div 
                    className="w-full h-16 rounded-md mb-3 shadow-inner"
                    style={{ background: theme.preview }}
                  />
                  
                  {/* Theme Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{theme.name}</h4>
                      {currentTheme?.id === theme.id && (
                        <Check className="size-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(theme.category)}
                        <span className="text-xs capitalize text-muted-foreground">
                          {theme.category}
                        </span>
                      </div>
                      {'isCustom' in theme && theme.isCustom && (
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Import Theme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Import Theme</CardTitle>
              <CardDescription>
                Import a custom theme from a JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportTheme}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full">
                  <Upload className="size-4 mr-2" />
                  Choose Theme File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create Custom Theme</CardTitle>
              <CardDescription>
                Design your own theme with custom colors and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme-name">Theme Name</Label>
                  <Input
                    id="theme-name"
                    placeholder="My Awesome Theme"
                    value={customThemeData.name}
                    onChange={(e) => setCustomThemeData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme-category">Category</Label>
                  <Select 
                    value={customThemeData.category} 
                    onValueChange={(value: ThemePreset['category']) => 
                      setCustomThemeData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme-description">Description (Optional)</Label>
                <Textarea
                  id="theme-description"
                  placeholder="A brief description of your theme..."
                  value={customThemeData.description}
                  onChange={(e) => setCustomThemeData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customThemeData.primaryColor}
                      onChange={(e) => setCustomThemeData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={customThemeData.primaryColor}
                      onChange={(e) => setCustomThemeData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={customThemeData.backgroundColor}
                      onChange={(e) => setCustomThemeData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={customThemeData.backgroundColor}
                      onChange={(e) => setCustomThemeData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Preview */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <Label className="text-sm font-medium mb-2 block">Preview</Label>
                <motion.div 
                  className="w-full h-20 rounded-md shadow-inner border-2 border-dashed border-muted-foreground/30"
                  style={{ 
                    background: `linear-gradient(135deg, ${customThemeData.primaryColor} 0%, ${customThemeData.backgroundColor} 100%)` 
                  }}
                  whileHover={{ scale: 1.02 }}
                />
              </div>

              <Button onClick={handleCreateCustomTheme} className="w-full">
                <Plus className="size-4 mr-2" />
                Create Theme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}