'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleDeriveEquation } from '@/app/actions';
import type { DeriveEquationOutput } from '@/ai/flows/derive-equation-from-hypothesis';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  hypothesis: z.string(),
  experimentalData: z.string().min(10, {
    message: 'Please provide experimental data (min. 10 characters).',
  }),
});

type EquationFormProps = {
  hypothesis: string;
  setEquation: Dispatch<SetStateAction<DeriveEquationOutput | null>>;
  isDeriving: boolean;
  setIsDeriving: Dispatch<SetStateAction<boolean>>;
};

export function EquationForm({ hypothesis, setEquation, isDeriving, setIsDeriving }: EquationFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hypothesis: hypothesis,
      experimentalData: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsDeriving(true);
    setEquation(null);

    const result = await handleDeriveEquation(values);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.success) {
      setEquation(result.success);
      toast({
        title: 'Success!',
        description: 'An equation has been successfully derived.',
      });
    }
    setIsDeriving(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="experimentalData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experimental Data</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste or describe available experimental data..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isDeriving} className="w-full">
          {isDeriving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Derive Equation
        </Button>
      </form>
    </Form>
  );
}
