import { Shield, FileWarning, Activity, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const Home = () => {
  const features = [
    {
      icon: FileWarning,
      title: "Report Incident",
      description: "Submit cyber security incidents with evidence for rapid response",
      color: "text-accent",
    },
    {
      icon: Activity,
      title: "Track Status",
      description: "Monitor your incident reports in real-time with detailed updates",
      color: "text-primary",
    },
    {
      icon: Lock,
      title: "Secure Storage",
      description: "Military-grade encryption for all evidence and sensitive data",
      color: "text-secondary",
    },
    {
      icon: AlertTriangle,
      title: "AI Analysis",
      description: "Advanced threat detection and automated security recommendations",
      color: "text-destructive",
    },
  ];

  const threatTypes = [
    { name: "Phishing Attacks", severity: "high" },
    { name: "Malware Detection", severity: "critical" },
    { name: "Fraud Prevention", severity: "medium" },
    { name: "Espionage Threats", severity: "critical" },
    { name: "Data Breach", severity: "high" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/20 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Shield className="h-24 w-24 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CERT-Army Portal
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-Enabled Cyber Incident & Safety Portal for Defence Personnel
          </p>
          
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            Secure reporting platform with advanced AI threat analysis, real-time monitoring, 
            and military-grade data protection for army personnel, families, and veterans.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/report">
              <Button variant="tactical" size="lg" className="text-lg px-8">
                <FileWarning className="mr-2 h-5 w-5" />
                Report Incident
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secure" size="lg" className="text-lg px-8">
                <Activity className="mr-2 h-5 w-5" />
                Check Status
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Security Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="border-border/50 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardHeader>
                <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Threat Coverage */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Threat Coverage</CardTitle>
            <CardDescription>
              Comprehensive protection against cyber security threats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {threatTypes.map((threat, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background/50 border border-border"
                >
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                    threat.severity === 'critical' ? 'text-destructive' :
                    threat.severity === 'high' ? 'text-accent' :
                    'text-secondary'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{threat.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {threat.severity} Priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 pb-24">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Need Immediate Assistance?</CardTitle>
            <CardDescription className="text-lg">
              Our CERT team is available 24/7 for critical incidents
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report">
              <Button variant="alert" size="lg" className="text-lg px-8">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Report Critical Incident
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Access Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">CERT-Army Portal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Indian Army Cyber Security. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
