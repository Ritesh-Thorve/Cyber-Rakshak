import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, FileWarning, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/Navbar";

const ReportIncident = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    incident_type: "",
    location: "",
    occurred_at: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to report an incident",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Create incident
      const { data: incident, error: incidentError } = await supabase
        .from('incidents')
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          incident_type: formData.incident_type as any,
          location: formData.location,
          occurred_at: formData.occurred_at || null,
        }])
        .select()
        .single();

      if (incidentError) throw incidentError;

      // Upload files if any
      if (files.length > 0 && incident) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${incident.id}/${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('incident-evidence')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Record file in database
          await supabase.from('incident_files').insert({
            incident_id: incident.id,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
          });
        }
      }

      toast({
        title: "Incident reported successfully",
        description: "Your incident has been submitted for review.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Failed to submit incident",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileWarning className="h-8 w-8 text-accent" />
              <div>
                <CardTitle className="text-2xl">Report Cyber Incident</CardTitle>
                <CardDescription>
                  Submit detailed information about the security incident
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6 border-primary/50 bg-primary/10">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                All submissions are encrypted and handled with military-grade security protocols.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the incident"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident_type">Incident Type *</Label>
                <Select
                  value={formData.incident_type}
                  onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phishing">Phishing Attack</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="fraud">Fraud</SelectItem>
                    <SelectItem value="espionage">Espionage</SelectItem>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide comprehensive details about the incident, including what happened, when it occurred, and any suspicious activities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Delhi, Mumbai"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occurred_at">Date & Time</Label>
                  <Input
                    id="occurred_at"
                    type="datetime-local"
                    value={formData.occurred_at}
                    onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Evidence Files (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="evidence"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.txt,.zip"
                  />
                  <Label htmlFor="evidence" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Images, videos, audio, documents (Max 50MB per file)
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  variant="tactical"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileWarning className="mr-2 h-4 w-4" />
                      Submit Incident Report
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportIncident;
