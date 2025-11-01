import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Heart, Church, Briefcase } from "lucide-react";

interface ProfileData {
  name: string;
  medicalConditions: string;
  religion: string;
  workEnvironment: string;
}

interface ProfileSurveyProps {
  onComplete: (data: ProfileData) => void;
}

export const ProfileSurvey = ({ onComplete }: ProfileSurveyProps) => {
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    medicalConditions: "",
    religion: "",
    workEnvironment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <Card className="w-full max-w-2xl shadow-strong">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-primary">Personal Information</CardTitle>
          <CardDescription className="text-lg">
            Help us personalize your food safety analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Your Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
                className="border-input focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical" className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-destructive" />
                Medical Conditions
              </Label>
              <Textarea
                id="medical"
                value={formData.medicalConditions}
                onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                placeholder="List any allergies, diabetes, heart conditions, etc."
                rows={4}
                className="border-input focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="religion" className="flex items-center gap-2 text-base">
                <Church className="h-4 w-4 text-accent" />
                Religion / Dietary Restrictions
              </Label>
              <Input
                id="religion"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                placeholder="e.g., Halal, Kosher, Vegetarian, etc."
                className="border-input focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work" className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-secondary" />
                Working Environment
              </Label>
              <Input
                id="work"
                value={formData.workEnvironment}
                onChange={(e) => setFormData({ ...formData, workEnvironment: e.target.value })}
                placeholder="e.g., Office, Physical labor, etc."
                className="border-input focus:ring-primary"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-gradient-hero hover:opacity-90 transition-all shadow-soft text-lg"
            >
              Continue to Meal Analysis
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};
