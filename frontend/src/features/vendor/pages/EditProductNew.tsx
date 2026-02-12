/**
 * Edit Product Page (Vendor)
 *
 * Adapted from Migration_Data/src/pages/EditProduct.tsx.
 * Uses the current vendor product hooks and shared ProductForm component
 * to edit an existing product inside the vendor dashboard.
 */

import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/inventory/ProductForm";
import { useProduct } from "@/features/vendor/hooks/useProducts";
import { useProductMutations } from "@/features/vendor/hooks/useProductMutations";
import { ROUTES } from "@/constants/routes";

export default function EditProductNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id);
  const { updateProduct } = useProductMutations();

  const handleSubmit = async (values: any) => {
    await updateProduct.mutateAsync({ id, ...values });
    navigate(ROUTES.VENDOR_DASHBOARD_INVENTORY);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found</p>
        <Button onClick={() => navigate(ROUTES.VENDOR_DASHBOARD_INVENTORY)} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.VENDOR_DASHBOARD_INVENTORY)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
          <p className="text-muted-foreground">
            Update product information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm 
            onSubmit={handleSubmit} 
            initialValues={product}
            isLoading={updateProduct.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

