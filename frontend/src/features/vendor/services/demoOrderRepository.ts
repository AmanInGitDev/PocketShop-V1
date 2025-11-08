/**
 * Demo Order Repository
 * 
 * Loads demo orders and menu items for UI development.
 * This is a demo-first approach - will be replaced with Supabase integration later.
 */

export interface DemoMenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  status: string;
}

export interface DemoOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DemoOrder {
  id: string;
  vendorId: string;
  total: number;
  status: 'NEW' | 'IN_PROGRESS' | 'READY';
  version: number;
  customerName: string;
  orderNumber: string;
  items: DemoOrderItem[];
  paymentMethod: 'GOOGLE_PAY' | 'PAYTM' | 'PHONEPE' | 'CASH' | 'CARD';
  paymentStatus: 'PAID' | 'PENDING';
  orderType: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
  createdAt: string;
  itemsCount: number;
}

// Demo data - defined inline to avoid import issues
const menuData: DemoMenuItem[] = [
  {"id":"menu-1","vendorId":"vendor-demo","name":"Maggi","price":50,"status":"ACTIVE"},
  {"id":"menu-2","vendorId":"vendor-demo","name":"Chai","price":20,"status":"ACTIVE"},
  {"id":"menu-3","vendorId":"vendor-demo","name":"Dosa","price":60,"status":"ACTIVE"},
  {"id":"menu-4","vendorId":"vendor-demo","name":"Samosa","price":15,"status":"ACTIVE"},
  {"id":"menu-5","vendorId":"vendor-demo","name":"Idli","price":40,"status":"ACTIVE"}
];

const ordersData: DemoOrder[] = [
  {
    "id":"order-1",
    "vendorId":"vendor-demo",
    "total":143,
    "status":"NEW",
    "version":1,
    "customerName":"Aman Momin",
    "orderNumber":"231",
    "items":[
      {"itemId":"menu-1","name":"Maggi","quantity":2,"price":50},
      {"itemId":"menu-2","name":"Chai","quantity":1,"price":20},
      {"itemId":"menu-4","name":"Samosa","quantity":2,"price":15}
    ],
    "paymentMethod":"GOOGLE_PAY",
    "paymentStatus":"PAID",
    "orderType":"DINE_IN",
    "createdAt":"2025-01-10T13:42:00Z",
    "itemsCount":4
  },
  {
    "id":"order-2",
    "vendorId":"vendor-demo",
    "total":80,
    "status":"NEW",
    "version":1,
    "customerName":"Prathmesh",
    "orderNumber":"232",
    "items":[
      {"itemId":"menu-2","name":"Chai","quantity":1,"price":20},
      {"itemId":"menu-3","name":"Dosa","quantity":1,"price":60}
    ],
    "paymentMethod":"PAYTM",
    "paymentStatus":"PENDING",
    "orderType":"TAKE_AWAY",
    "createdAt":"2025-01-10T13:45:00Z",
    "itemsCount":2
  },
  {
    "id":"order-3",
    "vendorId":"vendor-demo",
    "total":290,
    "status":"NEW",
    "version":1,
    "customerName":"Pratik",
    "orderNumber":"233",
    "items":[
      {"itemId":"menu-1","name":"Maggi","quantity":2,"price":50},
      {"itemId":"menu-3","name":"Dosa","quantity":2,"price":60},
      {"itemId":"menu-5","name":"Idli","quantity":1,"price":40}
    ],
    "paymentMethod":"CASH",
    "paymentStatus":"PAID",
    "orderType":"DINE_IN",
    "createdAt":"2025-01-10T13:43:00Z",
    "itemsCount":5
  }
];

/**
 * Get all menu items
 */
export const getMenuItems = (): DemoMenuItem[] => {
  return [...menuData];
};

/**
 * Get all orders
 */
export const getOrders = (): DemoOrder[] => {
  return [...ordersData];
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = (status: DemoOrder['status']): DemoOrder[] => {
  return ordersData.filter(order => order.status === status);
};

/**
 * Get order by ID
 */
export const getOrderById = (id: string): DemoOrder | undefined => {
  return ordersData.find(order => order.id === id);
};
