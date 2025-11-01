import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MealAnalysisProps {
  userName: string;
  userProfile: {
    medicalConditions: string;
    religion: string;
    workEnvironment: string;
  };
}

export const MealAnalysis = ({ userName, userProfile }: MealAnalysisProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualIngredients, setManualIngredients] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      let imageData = null;
      
      if (selectedImage) {
        // Convert image to base64
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
      }
      
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: {
          imageData,
          ingredients: manualIngredients || null,
          userProfile
        }
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysisResult(data.analysis);
        toast({
          title: "Analysis Complete",
          description: "Your meal has been analyzed successfully",
        });
      } else {
        throw new Error("No analysis data received");
      }
      
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-primary">Welcome, {userName}!</h2>
          <p className="text-xl text-muted-foreground">Upload or describe your meal for analysis</p>
        </div>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle className="text-2xl">Meal Input</CardTitle>
            <CardDescription>Choose how you'd like to input your meal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meal-image">Upload Meal Photo</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-border">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Meal preview" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
                        </div>
                      )}
                      <input
                        id="meal-image"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ingredients">List Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    value={manualIngredients}
                    onChange={(e) => setManualIngredients(e.target.value)}
                    placeholder="Enter ingredients separated by commas or new lines..."
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={analyzeFood}
              disabled={isAnalyzing || (!selectedImage && !manualIngredients)}
              className="w-full mt-6 bg-gradient-hero hover:opacity-90 transition-all shadow-soft text-lg"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Meal"
              )}
            </Button>
          </CardContent>
        </Card>

        {analysisResult && (
          <div className="space-y-4 animate-fade-in">
            {/* Detected Foods */}
            {analysisResult.detectedFoods && analysisResult.detectedFoods.length > 0 && (
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Detected Foods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.detectedFoods.map((food: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{food}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dangerous Combinations */}
            {analysisResult.dangerousCombinations && analysisResult.dangerousCombinations.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>⚠️ Dangerous Food Combinations</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-3">
                    {analysisResult.dangerousCombinations.map((combo: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-destructive pl-3">
                        <p className="font-semibold">{combo.foods.join(" + ")}</p>
                        <p className="text-sm">{combo.reason}</p>
                        <Badge className="mt-1" variant={combo.severity === "high" ? "destructive" : "secondary"}>
                          {combo.severity} severity
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Medical Concerns */}
            {analysisResult.medicalConcerns && analysisResult.medicalConcerns.length > 0 && (
              <Card className="shadow-soft border-amber-500/50">
                <CardHeader>
                  <CardTitle className="text-amber-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Medical Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.medicalConcerns.map((concern: any, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <p className="font-semibold text-amber-900 dark:text-amber-100">{concern.ingredient}</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{concern.concern}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        <strong>Recommendation:</strong> {concern.recommendation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Religious Concerns */}
            {analysisResult.religiousConcerns && analysisResult.religiousConcerns.length > 0 && (
              <Card className="shadow-soft border-purple-500/50">
                <CardHeader>
                  <CardTitle className="text-purple-600 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Religious Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.religiousConcerns.map((concern: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && (
              <Card className="shadow-strong border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6" />
                    Recommendations
                  </CardTitle>
                  {analysisResult.recommendations.overallSafety && (
                    <Badge 
                      variant={analysisResult.recommendations.overallSafety === "safe" ? "default" : "destructive"}
                      className="w-fit"
                    >
                      Overall Safety: {analysisResult.recommendations.overallSafety}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.recommendations.itemsToRemove && analysisResult.recommendations.itemsToRemove.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-destructive mb-2">🗑️ Items to Remove:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.recommendations.itemsToRemove.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysisResult.recommendations.itemsToAdd && analysisResult.recommendations.itemsToAdd.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">➕ Items to Add:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.recommendations.itemsToAdd.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {analysisResult.recommendations.notes && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{analysisResult.recommendations.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
