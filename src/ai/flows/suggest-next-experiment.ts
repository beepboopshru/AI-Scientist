'use server';
/**
 * @fileOverview Suggests next experiments to validate a hypothesis and equation.
 *
 * - suggestNextExperiment - A function that suggests next experiments.
 * - SuggestNextExperimentInput - The input type for the suggestNextExperiment function.
 * - SuggestNextExperimentOutput - The return type for the suggestNextExperiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextExperimentInputSchema = z.object({
  hypothesis: z.string().describe('The scientific hypothesis that was generated.'),
  equation: z.string().describe('The equation derived from the hypothesis.'),
});
export type SuggestNextExperimentInput = z.infer<typeof SuggestNextExperimentInputSchema>;

const ExperimentSchema = z.object({
  name: z.string().describe('The name of the suggested experiment.'),
  description: z
    .string()
    .describe('A detailed description of the experiment, including the required setup, procedure, and expected outcomes.'),
});

const SuggestNextExperimentOutputSchema = z.object({
  suggestedExperiments: z.array(ExperimentSchema).describe('A list of suggested experiments to validate the hypothesis and equation.'),
});
export type SuggestNextExperimentOutput = z.infer<typeof SuggestNextExperimentOutputSchema>;

export async function suggestNextExperiment(
  input: SuggestNextExperimentInput
): Promise<SuggestNextExperimentOutput> {
  return suggestNextExperimentFlow(input);
}

const suggestNextExperimentPrompt = ai.definePrompt({
  name: 'suggestNextExperimentPrompt',
  input: {schema: SuggestNextExperimentInputSchema},
  output: {schema: SuggestNextExperimentOutputSchema},
  prompt: `You are an AI research assistant that helps scientists design experiments.

  Given the following hypothesis and derived equation, propose a set of next experiments to validate them.

  Hypothesis: {{{hypothesis}}}
  Equation: {{{equation}}}

  For each experiment, provide a name and a detailed description covering the setup, procedure, and expected outcomes.
  `,
});

const suggestNextExperimentFlow = ai.defineFlow(
  {
    name: 'suggestNextExperimentFlow',
    inputSchema: SuggestNextExperimentInputSchema,
    outputSchema: SuggestNextExperimentOutputSchema,
  },
  async input => {
    const {output} = await suggestNextExperimentPrompt(input);
    return output!;
  }
);
