'use server';

import { z } from 'zod';
import { generateScientificHypothesis } from '@/ai/flows/generate-scientific-hypothesis';
import { deriveEquation } from '@/ai/flows/derive-equation-from-hypothesis';
import { suggestNextExperiment } from '@/ai/flows/suggest-next-experiment';

const hypothesisSchema = z.object({
  physicsDomain: z.string().min(3, "Physics domain must be at least 3 characters."),
  existingTheories: z.string().min(10, "Please provide some existing theories."),
  experimentalData: z.string().min(10, "Please provide some experimental data."),
  knowledgeGraphFacts: z.string().min(10, "Please provide some knowledge graph facts."),
});

export async function handleGenerateHypothesis(values: z.infer<typeof hypothesisSchema>) {
  const validatedFields = hypothesisSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await generateScientificHypothesis(validatedFields.data);
    return { success: result };
  } catch (error) {
    console.error('Error generating hypothesis:', error);
    return { error: 'Failed to generate hypothesis. Please try again.' };
  }
}


const equationSchema = z.object({
  hypothesis: z.string().min(1, "Hypothesis cannot be empty."),
  experimentalData: z.string().min(10, "Please provide some experimental data to derive the equation."),
});


export async function handleDeriveEquation(values: z.infer<typeof equationSchema>) {
    const validatedFields = equationSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }

    try {
        const result = await deriveEquation(validatedFields.data);
        return { success: result };
    } catch (error) {
        console.error('Error deriving equation:', error);
        return { error: 'Failed to derive equation. Please try again.' };
    }
}

const experimentSchema = z.object({
    hypothesis: z.string().min(1, "Hypothesis cannot be empty."),
    equation: z.string().min(1, "Equation cannot be empty."),
});

export async function handleSuggestExperiment(values: z.infer<typeof experimentSchema>) {
    const validatedFields = experimentSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid input.' };
    }

    try {
        const result = await suggestNextExperiment(validatedFields.data);
        return { success: result };
    } catch (error) {
        console.error('Error suggesting experiment:', error);
        return { error: 'Failed to suggest experiment. Please try again.' };
    }
}
