import type { SuggestNextExperimentOutput } from '@/ai/flows/suggest-next-experiment';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function SuggestedExperiments({ suggestedExperiments }: SuggestNextExperimentOutput) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {suggestedExperiments.map((experiment, index) => (
        <AccordionItem value={`item-${index}`} key={index} className="border rounded-lg px-4 bg-muted/20">
          <AccordionTrigger className="text-left font-semibold hover:no-underline text-accent">
            {index + 1}. {experiment.name}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p className="whitespace-pre-wrap">{experiment.description}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
