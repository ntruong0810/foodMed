import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, userProfile, ingredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing meal with user profile:', userProfile);

    // Build the analysis prompt
    const prompt = `You are a medical nutrition expert analyzing a meal for safety and health recommendations.

User Profile:
- Medical Conditions: ${userProfile.medicalConditions || 'None specified'}
- Religion: ${userProfile.religion || 'None specified'}
- Work Environment: ${userProfile.workEnvironment || 'None specified'}

${ingredients ? `Ingredients: ${ingredients}` : 'Please analyze the food in the image.'}

Provide a comprehensive analysis in the following JSON format:
{
  "detectedFoods": ["list of foods identified"],
  "dangerousCombinations": [
    {
      "foods": ["food1", "food2"],
      "reason": "why this combination is dangerous",
      "severity": "high|medium|low"
    }
  ],
  "medicalConcerns": [
    {
      "ingredient": "ingredient name",
      "concern": "why it's concerning for this user's condition",
      "recommendation": "what to do about it"
    }
  ],
  "religiousConcerns": ["any ingredients that conflict with religious requirements"],
  "recommendations": {
    "itemsToRemove": ["foods to remove from the meal"],
    "itemsToAdd": ["foods to add for better nutrition"],
    "overallSafety": "safe|caution|unsafe",
    "notes": "additional advice"
  }
}

Be thorough, specific, and prioritize safety. If there are no concerns in a category, use an empty array.`;

    const messages: any[] = [
      {
        role: "user",
        content: imageData 
          ? [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageData } }
            ]
          : prompt
      }
    ];

    console.log('Calling Lovable AI for meal analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Using most powerful vision model
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI analysis received');

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: return raw content
      analysis = {
        detectedFoods: [],
        dangerousCombinations: [],
        medicalConcerns: [],
        religiousConcerns: [],
        recommendations: {
          itemsToRemove: [],
          itemsToAdd: [],
          overallSafety: "unknown",
          notes: content
        }
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-meal function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze meal';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
