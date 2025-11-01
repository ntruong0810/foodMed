import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-food.jpg";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div className="container mx-auto px-4 py-20 relative z-10">
      <img id="site-logo" src="./public/logo.png" alt="Food MED logo" />

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              
              <span className="text-primary">Food MED</span>
              <br />
              Your Personal Food Safety Analyzer
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Upload your meal, get instant analysis on food combinations that could harm you based on your medical conditions, religion, and lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-gradient-hero hover:opacity-90 transition-all shadow-strong text-lg px-8"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8"
              >
                Donate
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in-delay">
            <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-20" />
            <img 
              src={heroImage}
              alt="Healthy colorful food in a bowl"
              className="relative rounded-3xl shadow-strong w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
