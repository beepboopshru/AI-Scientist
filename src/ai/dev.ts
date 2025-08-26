import { config } from 'dotenv';
config();

import '@/ai/flows/generate-scientific-hypothesis.ts';
import '@/ai/flows/derive-equation-from-hypothesis.ts';
import '@/ai/flows/suggest-next-experiment.ts';
