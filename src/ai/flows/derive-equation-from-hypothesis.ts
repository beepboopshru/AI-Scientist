// src/ai/flows/derive-equation-from-hypothesis.ts
'use server';
/**
 * @fileOverview Derives candidate equations from AI-generated hypotheses using symbolic regression.
 *
 * - deriveEquation - A function that handles the equation derivation process.
 * - DeriveEquationInput - The input type for the deriveEquation function.
 * - DeriveEquationOutput - The return type for the deriveEquation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeriveEquationInputSchema = z.object({
  hypothesis: z
    .string()
    .describe('The AI-generated scientific hypothesis to derive an equation from.'),
  experimentalData: z
    .string()
    .describe(
      'Available experimental data to fit the equation to.  Should be in a format parseable by symbolic regression algorithms.'
    ),
});
export type DeriveEquationInput = z.infer<typeof DeriveEquationInputSchema>;

const DeriveEquationOutputSchema = z.object({
  equation: z.string().describe('The derived candidate equation.'),
  accuracy: z.number().describe('The accuracy of the equation against the experimental data.'),
  metrics: z.record(z.any()).describe('Other relevant metrics for the equation.'),
});
export type DeriveEquationOutput = z.infer<typeof DeriveEquationOutputSchema>;

export async function deriveEquation(input: DeriveEquationInput): Promise<DeriveEquationOutput> {
  return deriveEquationFlow(input);
}

const deriveEquationPrompt = ai.definePrompt({
  name: 'deriveEquationPrompt',
  input: {schema: DeriveEquationInputSchema},
  output: {schema: DeriveEquationOutputSchema},
  prompt: `You are a mathematical physicist tasked with deriving equations from scientific hypotheses using experimental data.

  Hypothesis: {{{hypothesis}}}
  Experimental Data: {{{experimentalData}}}

  Derive a candidate equation that fits the hypothesis and data. Also provide an accuracy score and other relevant metrics.
  Return the equation, accuracy, and metrics in JSON format.
  Ensure that the equation is in a format suitable for symbolic calculation.
  The metrics field should include any relevant information, like R-squared value or p-value.`,
});

const deriveEquationFlow = ai.defineFlow(
  {
    name: 'deriveEquationFlow',
    inputSchema: DeriveEquationInputSchema,
    outputSchema: DeriveEquationOutputSchema,
  },
  async input => {
    const {output} = await deriveEquationPrompt(input);
    return output!;
  }
);
