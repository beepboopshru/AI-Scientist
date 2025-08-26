'use server';

/**
 * @fileOverview A flow for generating scientific hypotheses based on input parameters.
 *
 * - generateScientificHypothesis - A function that generates scientific hypotheses.
 * - GenerateScientificHypothesisInput - The input type for the generateScientificHypothesis function.
 * - GenerateScientificHypothesisOutput - The return type for the generateScientificHypothesis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScientificHypothesisInputSchema = z.object({
  physicsDomain: z
    .string()
    .describe('The specific domain of physics to generate hypotheses for (e.g., quantum mechanics, astrophysics).'),
  existingTheories: z
    .string()
    .describe('A summary of existing theories relevant to the domain.'),
  experimentalData: z
    .string()
    .describe('A description of available experimental data.'),
  knowledgeGraphFacts: z
    .string()
    .describe('Facts extracted from a knowledge graph of physics literature, such as entities and relationships'),
});

export type GenerateScientificHypothesisInput = z.infer<typeof GenerateScientificHypothesisInputSchema>;

const GenerateScientificHypothesisOutputSchema = z.object({
  hypothesis: z.string().describe('A novel scientific hypothesis.'),
  rationale: z.string().describe('The rationale behind the generated hypothesis.'),
});

export type GenerateScientificHypothesisOutput = z.infer<typeof GenerateScientificHypothesisOutputSchema>;

export async function generateScientificHypothesis(
  input: GenerateScientificHypothesisInput
): Promise<GenerateScientificHypothesisOutput> {
  return generateScientificHypothesisFlow(input);
}

const hypothesisGenerationPrompt = ai.definePrompt({
  name: 'hypothesisGenerationPrompt',
  input: {schema: GenerateScientificHypothesisInputSchema},
  output: {schema: GenerateScientificHypothesisOutputSchema},
  prompt: `You are an AI research assistant that generates novel scientific hypotheses in physics.

  Given the following context, generate a novel scientific hypothesis and provide a rationale for it.

  Physics Domain: {{{physicsDomain}}}
  Existing Theories: {{{existingTheories}}}
  Experimental Data: {{{experimentalData}}}
  Knowledge Graph Facts: {{{knowledgeGraphFacts}}}

  Ensure the hypothesis is well-reasoned and addresses potential gaps in existing knowledge.
  `,
});

const generateScientificHypothesisFlow = ai.defineFlow(
  {
    name: 'generateScientificHypothesisFlow',
    inputSchema: GenerateScientificHypothesisInputSchema,
    outputSchema: GenerateScientificHypothesisOutputSchema,
  },
  async input => {
    const {output} = await hypothesisGenerationPrompt(input);
    return output!;
  }
);
