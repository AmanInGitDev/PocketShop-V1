import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductForm } from "@/components/inventory/ProductForm";
import { useProductMutations } from "@/features/vendor/hooks/useProductMutations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateProduct } = useProductMutations();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleSubmit = async (values: any) => {
    if (!id) return;
    await updateProduct.mutateAsync({ id, ...values });
    navigate("/inventory");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            <p className="text-muted-foreground">
              Update product details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              defaultValues={{
                name: product.name,
                description: product.description || "",
                price: product.price,
                stock_quantity: product.stock_quantity,
                low_stock_threshold: product.low_stock_threshold || 10,
                category: product.category || "",
                is_available: product.is_available,
                image_url: product.image_url || undefined,
              }}
              onSubmit={handleSubmit}
              isLoading={updateProduct.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
