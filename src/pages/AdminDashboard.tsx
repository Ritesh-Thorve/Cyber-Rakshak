import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, TrendingUp, Users, Activity, Eye } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Incident = {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  status: string;
  threat_level: string | null;
  priority_score: number;
  created_at: string;
  user_id: string;
  location: string | null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'cert_admin'])
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchAllIncidents();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/dashboard');
    }
  };

  const fetchAllIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data as any || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus as any })
        .eq('id', incidentId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Incident status has been updated successfully",
      });

      fetchAllIncidents();
      setDetailsOpen(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateThreatLevel = async (incidentId: string, level: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ threat_level: level as any })
        .eq('id', incidentId);

      if (error) throw error;

      toast({
        title: "Threat level updated",
        description: "Incident threat level has been updated",
      });

      fetchAllIncidents();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getThreatBadge = (level: string | null) => {
    if (!level) return <Badge variant="outline">Unassessed</Badge>;
    
    const colors: Record<string, string> = {
      low: "bg-secondary/20 text-secondary border-secondary/30",
      medium: "bg-accent/20 text-accent border-accent/30",
      high: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      critical: "bg-destructive/20 text-destructive border-destructive/30",
    };

    return (
      <Badge className={`${colors[level]} border`}>
        <AlertTriangle className="h-3 w-3 mr-1" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-muted",
      under_review: "bg-primary/20 text-primary",
      investigating: "bg-accent/20 text-accent",
      resolved: "bg-secondary/20 text-secondary",
      closed: "bg-muted",
    };

    return (
      <Badge className={colors[status] || "bg-muted"}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.threat_level === 'critical').length,
    high: incidents.filter(i => i.threat_level === 'high').length,
    pending: incidents.filter(i => i.status === 'submitted' || i.status === 'under_review').length,
  };

  const filterIncidents = (filter: string) => {
    switch (filter) {
      case 'critical':
        return incidents.filter(i => i.threat_level === 'critical');
      case 'high':
        return incidents.filter(i => i.threat_level === 'high');
      case 'pending':
        return incidents.filter(i => i.status === 'submitted' || i.status === 'under_review');
      default:
        return incidents;
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            {loading ? "Loading..." : "Checking permissions..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">CERT-Army Command Center</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage all cyber security incidents
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-3xl font-bold text-destructive">{stats.critical}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold text-accent">{stats.high}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-primary">{stats.pending}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List with Filters */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Incident Management</CardTitle>
            <CardDescription>Priority-ranked incident list</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="critical">Critical ({stats.critical})</TabsTrigger>
                <TabsTrigger value="high">High ({stats.high})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              </TabsList>

              {['all', 'critical', 'high', 'pending'].map((filter) => (
                <TabsContent key={filter} value={filter} className="space-y-4">
                  {filterIncidents(filter).map((incident) => (
                    <Card key={incident.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{incident.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Incident #{incident.id.slice(0, 8)}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                {getThreatBadge(incident.threat_level)}
                                {getStatusBadge(incident.status)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {incident.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="capitalize">
                                Type: {incident.incident_type.replace('_', ' ')}
                              </span>
                              {incident.location && <span>Location: {incident.location}</span>}
                              <span>{new Date(incident.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filterIncidents(filter).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No incidents in this category
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Incident Management Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              Incident ID: {selectedIncident?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">User ID</h3>
                <p className="text-sm text-muted-foreground">{selectedIncident.user_id.slice(0, 8)}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Update Status</h3>
                  <Select
                    value={selectedIncident.status}
                    onValueChange={(value) => updateIncidentStatus(selectedIncident.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Threat Level</h3>
                  <Select
                    value={selectedIncident.threat_level || ""}
                    onValueChange={(value) => updateThreatLevel(selectedIncident.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(selectedIncident.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
