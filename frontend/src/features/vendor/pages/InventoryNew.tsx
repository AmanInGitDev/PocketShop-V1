/**
 * Inventory Page (New - Adapted from reference repo)
 * 
 * Product inventory management page.
 * Adapted to use frontend's structure.
 * 
 * Note: Hooks will be adapted in Phase 3. For now, using placeholder imports.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "@/features/vendor/hooks/useProducts";
import { useProductMutations } from "@/features/vendor/hooks/useProductMutations";
import { ProductCard } from "@/components/inventory/ProductCard";
import { BulkActions } from "@/components/inventory/BulkActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ROUTES } from "@/constants/routes";

export default function InventoryNew() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { deleteProduct } = useProductMutations();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable" | "low-stock">("all");

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);
    
    switch (filterStatus) {
      case "available":
        return matchesSearch && product.is_available;
      case "unavailable":
        return matchesSearch && !product.is_available;
      case "low-stock":
        return matchesSearch && isLowStock;
      default:
        return matchesSearch;
    }
  });

  const lowStockCount = products?.filter((p: any) => 
    p.stock_quantity <= (p.low_stock_threshold || 10)
  ).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <BulkActions />
          <Button onClick={() => navigate(`${ROUTES.VENDOR_DASHBOARD_INVENTORY}/add`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={(id) => deleteProduct.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== "all"
              ? "No products found matching your criteria"
              : "No products yet. Add your first product to get started!"}
          </p>
        </div>
      )}
    </div>
  );
}

