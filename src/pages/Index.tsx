import { Link } from "react-router-dom";
import {
  Sparkles,
  Users,
  FolderKanban,
  TrendingUp,
  Search,
  Brain,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Advanced algorithms analyze skills, experience, and project requirements for optimal matches.",
  },
  {
    icon: Users,
    title: "Talent Pool Management",
    description: "Comprehensive employee profiles with skills, certifications, and availability tracking.",
  },
  {
    icon: FolderKanban,
    title: "Project Allocation",
    description: "Streamlined project staffing with real-time visibility into team capacity.",
  },
  {
    icon: BarChart3,
    title: "Skill Gap Analysis",
    description: "Identify skill gaps and get personalized learning recommendations.",
  },
  {
    icon: TrendingUp,
    title: "Bench Optimization",
    description: "Reduce bench time with proactive talent matching and resource planning.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure access controls for admins, project managers, and employees.",
  },
];

const stats = [
  { value: "95%", label: "Match Accuracy" },
  { value: "40%", label: "Faster Allocation" },
  { value: "60%", label: "Less Bench Time" },
  { value: "500+", label: "Skills Tracked" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SkillMatch AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium mb-8">
            <Zap className="w-4 h-4 text-primary" />
            AI-Powered Talent Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            Match the{" "}
            <span className="gradient-text">right skills</span>
            {" "}to the{" "}
            <span className="gradient-text">right projects</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            SkillMatch AI uses advanced algorithms to analyze employee skills, 
            experience, and project requirements—delivering optimal team compositions 
            in seconds, not days.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Matching
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Search className="w-5 h-5 mr-2" />
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need for talent optimization
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From skill profiling to AI-powered matching, SkillMatch AI provides 
              a complete solution for IT resource management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How SkillMatch AI Works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Build Skill Profiles",
                description: "Upload resumes or manually add skills, certifications, and experience levels.",
              },
              {
                step: "2",
                title: "Define Requirements",
                description: "Create projects with specific skill requirements and experience criteria.",
              },
              {
                step: "3",
                title: "Get AI Matches",
                description: "Our AI analyzes all factors and ranks candidates by match percentage.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-sidebar via-primary/90 to-accent/80 text-primary-foreground text-center relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to optimize your talent allocation?
              </h2>
              <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
                Join leading IT organizations using SkillMatch AI to build better teams.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "Free 14-day trial",
                  "No credit card required",
                  "Setup in minutes",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="inline-block mt-8">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SkillMatch AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SkillMatch AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;