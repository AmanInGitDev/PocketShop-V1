import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface OrderReceiptProps {
  order: any;
  vendor: any;
  payment: any;
}

export function OrderReceipt({ order, vendor, payment }: OrderReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create receipt content
    const receiptContent = `
RECEIPT
========================================
${vendor.business_name}
${vendor.address || ''}
${vendor.contact_phone || ''}

Order #: ${order.order_number}
Date: ${format(new Date(order.created_at), 'PPpp')}

Customer: ${order.customer_name}
Phone: ${order.customer_phone}
${order.customer_email ? `Email: ${order.customer_email}` : ''}

========================================
ITEMS
========================================
${order.order_items.map((item: any) => 
  `${item.products.name}\n  ${item.quantity} x ₹${item.unit_price} = ₹${item.subtotal}`
).join('\n\n')}

========================================
Subtotal:        ₹${order.total_amount}
Payment Method:  ${payment?.payment_method.toUpperCase() || 'N/A'}
Status:          ${payment?.payment_status.toUpperCase() || 'PENDING'}

TOTAL:           ₹${order.total_amount}
========================================

Thank you for your business!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.order_number}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <h3 className="text-lg font-semibold">Receipt</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">{vendor.business_name}</h2>
          {vendor.address && <p className="text-sm text-muted-foreground">{vendor.address}</p>}
          {vendor.contact_phone && <p className="text-sm text-muted-foreground">{vendor.contact_phone}</p>}
        </div>

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number:</span>
            <span className="font-medium">#{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(new Date(order.created_at), 'PPpp')}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">Customer Details:</p>
          <p className="font-medium">{order.customer_name}</p>
          <p className="text-muted-foreground">{order.customer_phone}</p>
          {order.customer_email && <p className="text-muted-foreground">{order.customer_email}</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Separator />

        <div className="space-y-3">
          <p className="font-medium">Order Items:</p>
          {order.order_items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.products.name}</p>
                <p className="text-muted-foreground">
                  {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                </p>
              </div>
              <p className="font-medium">₹{Number(item.subtotal).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>₹{Number(order.total_amount).toFixed(2)}</span>
          </div>
          {payment && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{payment.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className="capitalize font-medium">{payment.payment_status}</span>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>₹{Number(order.total_amount).toFixed(2)}</span>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4 print:block">
          Thank you for your business!
        </div>
      </CardContent>
    </Card>
  );
}
