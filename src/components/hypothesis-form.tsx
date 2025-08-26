'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateHypothesis } from '@/app/actions';
import type { GenerateScientificHypothesisOutput } from '@/ai/flows/generate-scientific-hypothesis';
import type { DeriveEquationOutput } from '@/ai/flows/derive-equation-from-hypothesis';
import type { SuggestNextExperimentOutput } from '@/ai/flows/suggest-next-experiment';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  physicsDomain: z.string().min(3, {
    message: 'Physics domain must be at least 3 characters.',
  }),
  existingTheories: z.string().min(10, {
    message: 'Existing theories must be at least 10 characters.',
  }),
  experimentalData: z.string().min(10, {
    message: 'Experimental data must be at least 10 characters.',
  }),
  knowledgeGraphFacts: z.string().min(10, {
    message: 'Knowledge graph facts must be at least 10 characters.',
  }),
});

type HypothesisFormProps = {
  setHypothesis: Dispatch<SetStateAction<GenerateScientificHypothesisOutput | null>>;
  setEquation: Dispatch<SetStateAction<DeriveEquationOutput | null>>;
  setExperiments: Dispatch<SetStateAction<SuggestNextExperimentOutput | null>>;
  isGenerating: boolean;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
};

export function HypothesisForm({ setHypothesis, setEquation, setExperiments, isGenerating, setIsGenerating }: HypothesisFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      physicsDomain: '',
      existingTheories: '',
      experimentalData: '',
      knowledgeGraphFacts: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setHypothesis(null);
    setEquation(null);
    setExperiments(null);

    const result = await handleGenerateHypothesis(values);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.success) {
      setHypothesis(result.success);
      toast({
        title: 'Success!',
        description: 'A new hypothesis has been generated.',
      });
      form.reset();
    }
    setIsGenerating(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="physicsDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physics Domain</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Quantum Mechanics, Astrophysics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="existingTheories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Existing Theories</FormLabel>
              <FormControl>
                <Textarea placeholder="Summarize relevant existing theories..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experimentalData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experimental Data</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe available experimental data..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="knowledgeGraphFacts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Knowledge Graph Facts</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide facts from knowledge graphs..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isGenerating} className="w-full">
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Hypothesis
        </Button>
      </form>
    </Form>
  );
}
