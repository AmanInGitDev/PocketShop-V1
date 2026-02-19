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
  };
  onDelete: (id: string) => void;
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => {
  const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 10);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] max-h-36 relative bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {isLowStock && (
          <Badge variant="destructive" className="absolute top-2 right-2">
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
      <CardContent className="p-3">
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
