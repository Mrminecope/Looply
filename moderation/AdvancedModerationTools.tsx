import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Flag, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Filter,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Calendar
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import type { User, Post, Community } from '../../types/app';

interface ModerationReport {
  id: string;
  type: 'content' | 'user' | 'community';
  targetId: string;
  reporterId: string;
  reporter: User;
  reason: string;
  category: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'inappropriate_content' | 'copyright' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  evidenceUrls?: string[];
  targetContent?: Post;
  targetUser?: User;
  targetCommunity?: Community;
}

interface ModerationAction {
  id: string;
  reportId: string;
  moderatorId: string;
  moderator: User;
  action: 'warning' | 'content_removal' | 'temporary_ban' | 'permanent_ban' | 'account_suspension' | 'community_removal';
  reason: string;
  duration?: number; // in hours for temporary actions
  createdAt: string;
  notes?: string;
}

interface ContentFilter {
  id: string;
  name: string;
  pattern: string;
  type: 'keyword' | 'regex' | 'ai_classification';
  category: 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'inappropriate_content';
  action: 'flag' | 'auto_remove' | 'require_review';
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface AdvancedModerationToolsProps {
  currentUser: User;
  isAdmin: boolean;
  isModerator: boolean;
}

export function AdvancedModerationTools({ currentUser, isAdmin, isModerator }: AdvancedModerationToolsProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [filters, setFilters] = useState<ContentFilter[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockReports: ModerationReport[] = [
        {
          id: 'report_1',
          type: 'content',
          targetId: 'post_123',
          reporterId: 'user_456',
          reporter: {
            id: 'user_456',
            name: 'John Doe',
            username: '@johndoe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            verified: false,
            followers: 150,
            following: 200
          },
          reason: 'This post contains hate speech targeting a specific group',
          category: 'hate_speech',
          description: 'The post uses derogatory language and promotes discrimination',
          status: 'pending',
          priority: 'high',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          evidenceUrls: ['https://example.com/screenshot1.png']
        },
        {
          id: 'report_2',
          type: 'user',
          targetId: 'user_789',
          reporterId: 'user_101',
          reporter: {
            id: 'user_101',
            name: 'Sarah Smith',
            username: '@sarahsmith',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=32&h=32&fit=crop&crop=face',
            verified: true,
            followers: 500,
            following: 150
          },
          reason: 'This user is sending harassing messages',
          category: 'harassment',
          description: 'Repeated unwanted messages and threatening behavior',
          status: 'reviewing',
          priority: 'medium',
          assignedTo: 'mod_1',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockFilters: ContentFilter[] = [
        {
          id: 'filter_1',
          name: 'Spam Keywords',
          pattern: 'buy now|limited time|click here|free money',
          type: 'keyword',
          category: 'spam',
          action: 'flag',
          enabled: true,
          sensitivity: 'medium',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'filter_2',
          name: 'Hate Speech Detection',
          pattern: 'ai_hate_speech_model_v2',
          type: 'ai_classification',
          category: 'hate_speech',
          action: 'require_review',
          enabled: true,
          sensitivity: 'high',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setReports(mockReports);
      setFilters(mockFilters);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAction = async (action: ModerationAction['action'], reason: string, duration?: number) => {
    if (!selectedReport) return;

    try {
      const newAction: ModerationAction = {
        id: `action_${Date.now()}`,
        reportId: selectedReport.id,
        moderatorId: currentUser.id,
        moderator: currentUser,
        action,
        reason,
        duration,
        createdAt: new Date().toISOString(),
        notes: `Action taken on ${selectedReport.type} report`
      };

      setActions(prev => [newAction, ...prev]);
      
      // Update report status
      setReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? { ...report, status: 'resolved' as const, updatedAt: new Date().toISOString() }
          : report
      ));

      setShowActionDialog(false);
      setSelectedReport(null);

      // Show success notification
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl z-50 success-bounce shadow-2xl';
      successMsg.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="text-xl">✅</span>
          <span class="font-medium">Moderation action taken successfully</span>
        </div>
      `;
      document.body.appendChild(successMsg);
      setTimeout(() => successMsg.remove(), 3000);

    } catch (error) {
      console.error('Failed to take moderation action:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchQuery || 
      report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'reviewing': return 'text-blue-600 bg-blue-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'dismissed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isAdmin && !isModerator) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access moderation tools.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            Moderation Center
          </h1>
          <p className="text-gray-600 mt-1">Manage reports, content filters, and community safety</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            {reports.filter(r => r.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {reports.filter(r => r.status === 'reviewing').length} In Review
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="filters" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedReport(report)}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900">{report.reason}</h3>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <img
                              src={report.reporter.avatar}
                              alt={report.reporter.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span>Reported by {report.reporter.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                            setShowActionDialog(true);
                          }}
                        >
                          Take Action
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Moderation Actions</h3>
            <div className="space-y-4">
              {actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No moderation actions taken yet</p>
                </div>
              ) : (
                actions.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline">{action.action.replace('_', ' ')}</Badge>
                        <p className="mt-2 text-sm text-gray-600">{action.reason}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          By {action.moderator.name} • {new Date(action.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {action.duration && (
                        <Badge variant="secondary">{action.duration}h duration</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Content Filters</h3>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Add Filter
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filters.map((filter) => (
              <Card key={filter.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{filter.name}</h4>
                      <Badge variant={filter.enabled ? 'default' : 'secondary'}>
                        {filter.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                      <Badge variant="outline">{filter.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{filter.pattern}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {filter.category.replace('_', ' ')}</span>
                      <span>Action: {filter.action.replace('_', ' ')}</span>
                      <span>Sensitivity: {filter.sensitivity}</span>
                    </div>
                  </div>
                  <Switch checked={filter.enabled} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
                <Flag className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actions Taken</p>
                  <p className="text-2xl font-bold">{actions.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Filters</p>
                  <p className="text-2xl font-bold">{filters.filter(f => f.enabled).length}</p>
                </div>
                <Filter className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Moderation Action</DialogTitle>
            <DialogDescription>
              Choose an appropriate action for this report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Report Details</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedReport.reason}</p>
                <p className="text-xs text-gray-500">{selectedReport.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleTakeAction('warning', 'First warning for policy violation')}
                  className="justify-start"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Issue Warning
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleTakeAction('content_removal', 'Content violates community guidelines')}
                  className="justify-start"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Remove Content
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleTakeAction('temporary_ban', 'Temporary suspension for policy violation', 24)}
                  className="justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  24h Suspension
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleTakeAction('permanent_ban', 'Permanent ban for severe policy violation')}
                  className="justify-start text-red-600 hover:text-red-700"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Permanent Ban
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}