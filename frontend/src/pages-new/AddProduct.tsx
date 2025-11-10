import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductForm } from "@/components/inventory/ProductForm";
import { useProductMutations } from "@/features/vendor/hooks/useProductMutations";

export default function AddProduct() {
  const navigate = useNavigate();
  const { createProduct } = useProductMutations();

  const handleSubmit = async (values: any) => {
    await createProduct.mutateAsync(values);
    navigate("/inventory");
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventory")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
            <p className="text-muted-foreground">
              Create a new product in your inventory
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm onSubmit={handleSubmit} isLoading={createProduct.isPending} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
