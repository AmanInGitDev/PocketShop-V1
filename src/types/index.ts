/**
 * TypeScript type definitions for PocketShop
 * 
 * This file contains all the type definitions used throughout the application.
 * Keeping them centralized makes the code more maintainable and type-safe.
 */

// ===== USER & AUTHENTICATION TYPES =====

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'vendor' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ===== BUSINESS & VENDOR TYPES =====

export interface Business {
  id: string;
  name: string;
  description: string;
  category: BusinessCategory;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  banner_url?: string;
  qr_code: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BusinessCategory = 
  | 'restaurant' 
  | 'cafe' 
  | 'retail' 
  | 'salon' 
  | 'pharmacy' 
  | 'grocery' 
  | 'other';

// ===== PRODUCT & MENU TYPES =====

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

// ===== ORDER TYPES =====

export interface Order {
  id: string;
  business_id: string;
  customer_id?: string; // Optional for guest orders
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product; // Populated from product_id
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'completed' 
  | 'cancelled';

// ===== ANALYTICS TYPES =====

export interface SalesAnalytics {
  total_sales: number;
  total_orders: number;
  average_order_value: number;
  top_products: ProductSales[];
  sales_by_hour: HourlySales[];
  sales_by_day: DailySales[];
}

export interface ProductSales {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface HourlySales {
  hour: number;
  sales: number;
  orders: number;
}

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ===== FORM TYPES =====

export interface BusinessFormData {
  name: string;
  description: string;
  category: BusinessCategory;
  address: string;
  phone: string;
  email: string;
  logo?: File;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: File;
  preparation_time?: number;
}

export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: {
    product_id: string;
    quantity: number;
    special_instructions?: string;
  }[];
  notes?: string;
}

// ===== UI STATE TYPES =====

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

export interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ===== COMPONENT PROP TYPES =====

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ===== UTILITY TYPES =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
