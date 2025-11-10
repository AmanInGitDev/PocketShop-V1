import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { useQueryClient } from "@tanstack/react-query";

export const BulkActions = () => {
  const { toast } = useToast();
  const { data: vendor } = useVendor();
  const queryClient = useQueryClient();

  const exportToCSV = async () => {
    if (!vendor?.id) return;

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to export products',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['name', 'description', 'price', 'stock_quantity', 'low_stock_threshold', 'category', 'is_available'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => 
        headers.map(h => {
          const value = p[h as keyof typeof p];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${new Date().toISOString()}.csv`;
    a.click();

    toast({
      title: 'Success',
      description: 'Products exported successfully',
    });
  };

  const importFromCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor?.id) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        const products = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => 
            v.replace(/^"|"$/g, '').trim()
          );
          
          const product: any = { vendor_id: vendor.id };
          headers.forEach((header, index) => {
            const value = values?.[index];
            if (header === 'price' || header === 'stock_quantity' || header === 'low_stock_threshold') {
              product[header] = parseFloat(value || '0');
            } else if (header === 'is_available') {
              product[header] = value === 'true';
            } else {
              product[header] = value;
            }
          });
          return product;
        });

        const { error } = await supabase
          .from('products')
          .insert(products);

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast({
          title: 'Success',
          description: `Imported ${products.length} products`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to import products',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportToCSV}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <label>
        <Button variant="outline" asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </span>
        </Button>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={importFromCSV}
        />
      </label>
    </div>
  );
};
