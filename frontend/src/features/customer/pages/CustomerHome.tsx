/**
 * Customer home – placeholder.
 * Full UI will be ported from Migration_Data in Phase 6.
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function CustomerHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            Customer home
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page is a placeholder. Full flow will be ported from Migration_Data.
          </p>
          <Button onClick={() => navigate('/')}>Back to home</Button>
        </CardContent>
      </Card>
    </div>
  );
}
