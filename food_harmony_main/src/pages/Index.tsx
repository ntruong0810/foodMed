import { useState } from "react";
import { Hero } from "@/components/Hero";
import { ProfileSurvey } from "@/components/ProfileSurvey";
import { MealAnalysis } from "@/components/MealAnalysis";

interface ProfileData {
  name: string;
  medicalConditions: string;
  religion: string;
  workEnvironment: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<"hero" | "profile" | "analysis">("hero");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const handleGetStarted = () => {
    setCurrentStep("profile");
  };

  const handleProfileComplete = (data: ProfileData) => {
    setProfileData(data);
    setCurrentStep("analysis");
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "hero" && <Hero onGetStarted={handleGetStarted} />}
      {currentStep === "profile" && <ProfileSurvey onComplete={handleProfileComplete} />}
      {currentStep === "analysis" && profileData && (
        <MealAnalysis
          userName={profileData.name}
          userProfile={{
            medicalConditions: profileData.medicalConditions,
            religion: profileData.religion,
            workEnvironment: profileData.workEnvironment,
          }}
        />
      )}
    </div>
  );
};

export default Index;
