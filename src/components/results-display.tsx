import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info } from 'lucide-react';
import type { DeriveEquationOutput } from '@/ai/flows/derive-equation-from-hypothesis';

export function ResultsDisplay({ equation, accuracy, metrics }: DeriveEquationOutput) {
  return (
    <div className="space-y-6">
      <Card className="bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="text-accent">Candidate Equation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-2xl bg-muted p-4 rounded-md text-center break-all">
            {equation}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{(accuracy * 100).toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Fit against experimental data
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Additional Metrics</CardTitle>
            <Info className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                  <Badge variant="secondary" className="font-mono">{String(value)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
