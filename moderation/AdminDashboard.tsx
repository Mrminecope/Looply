import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  Users,
  FileText,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { moderationService, type ContentReport, type UserViolation } from "../../utils/moderation";

interface AdminDashboardProps {
  moderatorId: string;
}

export function AdminDashboard({ moderatorId }: AdminDashboardProps) {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [violations, setViolations] = useState<UserViolation[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReports(moderationService.getReports());
    setViolations(moderationService.getViolations());
    setStats(moderationService.getModerationStats());
  };

  const filteredReports = reports
    .filter(report => {
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.contentId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleReportAction = (reportId: string, action: 'approve' | 'dismiss' | 'escalate') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    let newStatus: ContentReport['status'];
    let message: string;

    switch (action) {
      case 'approve':
        newStatus = 'resolved';
        message = 'Report approved and action taken';
        // In real app, take action on the content (hide, delete, etc.)
        break;
      case 'dismiss':
        newStatus = 'dismissed';
        message = 'Report dismissed - no violation found';
        break;
      case 'escalate':
        newStatus = 'under_review';
        message = 'Report escalated for further review';
        break;
    }

    const success = moderationService.updateReport(reportId, {
      status: newStatus,
      moderatorId,
      moderatorNotes: moderatorNotes.trim() || undefined
    });

    if (success) {
      toast.success(message);
      loadData();
      setSelectedReport(null);
      setModeratorNotes('');
    } else {
      toast.error('Failed to update report');
    }
  };

  const handleBlockUser = (userId: string, duration?: number) => {
    const reason = `Blocked by moderator ${moderatorId} for policy violations`;
    moderationService.blockUser(userId, reason, duration);
    toast.success(`User blocked ${duration ? 'temporarily' : 'permanently'}`);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'under_review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'dismissed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'violence': case 'hate_speech': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'harassment': case 'nudity': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'spam': case 'misinformation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Moderation Dashboard
          </h1>
          <p className="text-muted-foreground">Review and moderate community content</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blockedUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportsToday || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Content Reports</TabsTrigger>
          <TabsTrigger value="violations">User Violations</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reports Queue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {filteredReports.map((report) => (
                      <Card 
                        key={report.id}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedReport?.id === report.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={getReasonColor(report.reason)}>
                              {report.reason.replace('_', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <p className="font-medium">{report.contentType} #{report.contentId.slice(-6)}</p>
                            <p className="text-muted-foreground">
                              Reported {formatTime(report.timestamp)}
                            </p>
                            {report.description && (
                              <p className="text-muted-foreground line-clamp-2 mt-1">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {filteredReports.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reports found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Content Type</label>
                        <p className="capitalize">{selectedReport.contentType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reason</label>
                        <Badge className={getReasonColor(selectedReport.reason)}>
                          {selectedReport.reason.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Badge className={getStatusColor(selectedReport.status)}>
                          {selectedReport.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Reported</label>
                        <p className="text-sm">{formatTime(selectedReport.timestamp)}</p>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {selectedReport.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium">Moderator Notes</label>
                      <Textarea
                        placeholder="Add notes about your decision..."
                        value={moderatorNotes}
                        onChange={(e) => setModeratorNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {selectedReport.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          onClick={() => handleReportAction(selectedReport.id, 'approve')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(selectedReport.id, 'escalate')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a report to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle>User Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <Card key={violation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">User {violation.userId}</p>
                          <p className="text-sm text-muted-foreground">{violation.description}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(violation.timestamp)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={violation.severity === 'high' ? 'destructive' : 'secondary'}>
                            {violation.severity}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBlockUser(violation.userId)}
                          >
                            Block User
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No blocked users</p>
                <p className="text-sm">Blocked users will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}