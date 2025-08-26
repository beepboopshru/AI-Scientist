'use client';

import { useEffect, useState } from 'react';
import type { GenerateScientificHypothesisOutput } from '@/ai/flows/generate-scientific-hypothesis';
import type { DeriveEquationOutput } from '@/ai/flows/derive-equation-from-hypothesis';
import type { SuggestNextExperimentOutput } from '@/ai/flows/suggest-next-experiment';
import { handleSuggestExperiment } from '@/app/actions';
import { AppHeader } from '@/components/app-header';
import { HypothesisForm } from '@/components/hypothesis-form';
import { EquationForm } from '@/components/equation-form';
import { ResultsDisplay } from '@/components/results-display';
import { SuggestedExperiments } from '@/components/suggested-experiments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, TestTube, FunctionSquare, Beaker } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [hypothesis, setHypothesis] = useState<GenerateScientificHypothesisOutput | null>(null);
  const [equation, setEquation] = useState<DeriveEquationOutput | null>(null);
  const [experiments, setExperiments] = useState<SuggestNextExperimentOutput | null>(null);
  const [isGeneratingHypothesis, setIsGeneratingHypothesis] = useState(false);
  const [isDerivingEquation, setIsDerivingEquation] = useState(false);
  const [isSuggestingExperiments, setIsSuggestingExperiments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (hypothesis && equation) {
      const suggest = async () => {
        setIsSuggestingExperiments(true);
        setExperiments(null);
        const result = await handleSuggestExperiment({
          hypothesis: hypothesis.hypothesis,
          equation: equation.equation,
        });
        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Error suggesting experiments',
            description: result.error,
          });
        } else if (result.success) {
          setExperiments(result.success);
        }
        setIsSuggestingExperiments(false);
      };
      suggest();
    }
  }, [hypothesis, equation, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            LawFinder AI
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Leverage AI to generate novel scientific hypotheses and derive mathematical equations from complex data.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8 lg:sticky top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  <span>Step 1: Generate a Hypothesis</span>
                </CardTitle>
                <CardDescription>
                  Provide context from physics literature, theories, and data to generate a new hypothesis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HypothesisForm
                  setHypothesis={setHypothesis}
                  setEquation={setEquation}
                  setExperiments={setExperiments}
                  isGenerating={isGeneratingHypothesis}
                  setIsGenerating={setIsGeneratingHypothesis}
                />
              </CardContent>
            </Card>

            {hypothesis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FunctionSquare className="w-6 h-6 text-primary" />
                    <span>Step 2: Derive an Equation</span>
                  </CardTitle>
                  <CardDescription>
                    Use the generated hypothesis and experimental data to derive a candidate equation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EquationForm
                    hypothesis={hypothesis.hypothesis}
                    setEquation={setEquation}
                    setExperiments={setExperiments}
                    isDeriving={isDerivingEquation}
                    setIsDeriving={setIsDerivingEquation}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TestTube className="w-6 h-6 text-primary" />
                  <span>Result: Your Hypothesis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[150px]">
                {isGeneratingHypothesis ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : hypothesis ? (
                  <div>
                    <p className="text-lg font-semibold text-accent">{hypothesis.hypothesis}</p>
                    <p className="mt-2 text-muted-foreground">{hypothesis.rationale}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Your generated hypothesis will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {hypothesis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FunctionSquare className="w-6 h-6 text-primary" />
                    <span>Result: Derived Equation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                  {isDerivingEquation ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : equation ? (
                    <ResultsDisplay {...equation} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Your derived equation and its metrics will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {(equation || isSuggestingExperiments) && (
                 <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-3">
                     <Beaker className="w-6 h-6 text-primary" />
                     <span>Step 3: Suggested Next Experiments</span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="min-h-[200px]">
                   {isSuggestingExperiments ? (
                     <div className="space-y-4">
                       <Skeleton className="h-8 w-3/4" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-8 w-3/4 mt-4" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-5/6" />
                     </div>
                   ) : experiments ? (
                     <SuggestedExperiments {...experiments} />
                   ) : (
                     <div className="flex items-center justify-center h-full">
                         <p className="text-muted-foreground">Suggested experiments to validate your findings will appear here.</p>
                     </div>
                   )}
                 </CardContent>
               </Card>
            )}

          </div>
        </div>
      </main>
      <footer className="py-6 mt-12 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for the modern researcher. LawFinder AI.</p>
        </div>
      </footer>
    </div>
  );
}
