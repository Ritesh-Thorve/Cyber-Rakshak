import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Incident = {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  status: string;
  threat_level: string | null;
  created_at: string;
  location: string | null;
  recommendations: string[] | null;
  ai_analysis_result: any;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchIncidents();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
    }
  };

  const fetchIncidents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      submitted: { variant: "secondary", icon: Clock },
      under_review: { variant: "default", icon: Activity },
      investigating: { variant: "default", icon: Activity },
      resolved: { variant: "outline", icon: CheckCircle },
      closed: { variant: "outline", icon: CheckCircle },
    };

    const config = variants[status] || variants.submitted;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getThreatBadge = (level: string | null) => {
    if (!level) return null;
    
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

  const viewDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading your incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Incidents</h1>
          <p className="text-muted-foreground">
            Track and monitor your reported cyber security incidents
          </p>
        </div>

        {incidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No incidents reported</h3>
              <p className="text-muted-foreground mb-4">
                You haven't reported any incidents yet
              </p>
              <Button variant="tactical" onClick={() => navigate('/report')}>
                Report First Incident
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{incident.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {new Date(incident.created_at).toLocaleString()}
                        {incident.location && ` • ${incident.location}`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(incident.status)}
                      {getThreatBadge(incident.threat_level)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {incident.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {incident.incident_type.replace('_', ' ')}
                    </Badge>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewDetails(incident)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              Incident #{selectedIncident?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedIncident.status)}</div>
              </div>

              {selectedIncident.threat_level && (
                <div>
                  <Label className="text-sm font-medium">Threat Level</Label>
                  <div className="mt-1">{getThreatBadge(selectedIncident.threat_level)}</div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.recommendations && selectedIncident.recommendations.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">AI Recommendations</Label>
                  <ul className="mt-2 space-y-2">
                    {selectedIncident.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export default Dashboard;
