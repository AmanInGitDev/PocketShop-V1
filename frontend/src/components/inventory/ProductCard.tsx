import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock_quantity: number;
    low_stock_threshold?: number;
    category?: string;
    image_url?: string;
    is_available: boolean;
    diet_type?: string;
  };
  onDelete: (id: string) => void;
  variant?: "grid" | "list";
}

export const ProductCard = ({ product, onDelete, variant = "grid" }: ProductCardProps) => {
  const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);

  if (variant === "list") {
    return (
      <Card className="flex flex-row overflow-hidden border border-border hover:border-primary hover:shadow-md transition-colors duration-200">
        <div className="relative w-24 sm:w-32 h-24 sm:h-28 shrink-0 bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No Image
            </div>
          )}
          {product.category && (
            <Badge className="absolute left-1.5 top-1.5 rounded-full bg-orange-500 text-white text-[10px] px-1.5 py-0">
              {product.category}
            </Badge>
          )}
        </div>
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {product.description}
                </p>
              )}
            </div>
            <span className="font-bold text-primary shrink-0">₹{product.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {product.stock_quantity} in stock
            </span>
            {product.category && (
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            )}
            {!product.is_available && (
              <Badge variant="secondary" className="text-xs">
                Unavailable
              </Badge>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link to={`${ROUTES.VENDOR_DASHBOARD_INVENTORY}/edit/${product.id}`} className="gap-1.5">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(product.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-colors transition-shadow duration-200">
      <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden group">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {product.category && (
          <Badge className="absolute left-2 top-2 rounded-full bg-orange-500 text-white text-[10px] px-2 py-0.5">
            {product.category}
          </Badge>
        )}
        {product.diet_type && (
          <div className="absolute left-2 bottom-2 flex items-center gap-1 text-[10px] font-medium">
            <span
              className={`h-3 w-3 rounded-sm border flex items-center justify-center ${
                product.diet_type === "veg" ? "border-green-600" : "border-red-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-[2px] ${
                  product.diet_type === "veg" ? "bg-green-600" : "bg-red-600"
                }`}
              />
            </span>
          </div>
        )}
        {isLowStock && (
          <Badge
            variant="destructive"
            className="absolute top-2 right-2 animate-pulse shadow-md rounded-full px-3 py-1"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Low Stock
          </Badge>
        )}
        {!product.is_available && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Unavailable
          </Badge>
        )}
      </div>
      <CardContent className="flex-1 p-3 flex flex-col">
        <h3 className="font-semibold text-base mb-0.5 line-clamp-1">{product.name}</h3>
        {product.category && (
          <Badge variant="outline" className="mb-1.5 text-xs">
            {product.category}
          </Badge>
        )}
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
            {product.description}
          </p>
        )}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-primary">₹{product.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 dark:bg-green-400 transition-all"
                style={{
                  width: `${Math.min(100, (product.stock_quantity / Math.max(50, (product.low_stock_threshold || 10) * 5)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
              {product.stock_quantity}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">in stock</p>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8"
          type="button"
          asChild
        >
          <Link to={`${ROUTES.VENDOR_DASHBOARD_INVENTORY}/edit/${product.id}`} className="inline-flex items-center justify-center gap-2">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-8 w-8">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(product.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
