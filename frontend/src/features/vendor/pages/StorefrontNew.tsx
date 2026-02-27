/**
 * Vendor Storefront Page
 *
 * UI is adapted from Migration_Data/src/pages/Storefront.tsx.
 * We keep the richer dashboard-style layout (hero, stats, QR section,
 * settings form, and live preview iframe) but wire it to the current
 * vendor hooks (`useVendor`, `useStorefront`, `useProducts`, `useOrders`).
 *
 * Migration notes:
 * - Stats (products/orders/revenue) are derived from `useProducts` +
 *   `useOrders` so they stay in sync with the rest of the dashboard.
 * - QR code generation + storefront link use `useStorefront`, which writes
 *   to `vendor_profiles.qr_code_url` and reuses the current Supabase model.
 * - The live preview iframe points at `/storefront/:vendorId`, which is the
 *   same route the customer-facing storefront will use in Phase 4.
 * - If Supabase tables are not created/seeded yet, the preview area will
 *   render the shell UI but with no products; this is expected until DB
 *   setup is completed in later migration phases.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ExternalLink,
  Download,
  Copy,
  RefreshCw,
  Share2,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  Eye,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  Globe,
  Settings,
} from "lucide-react";
import { useStorefront } from "@/features/vendor/hooks/useStorefront";
import { ROUTES } from "@/constants/routes";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { useProducts } from "@/features/vendor/hooks/useProducts";
import { useOrders } from "@/features/vendor/hooks/useOrders";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StorefrontNew() {
  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const { updateQRCode, isUpdatingQRCode } = useStorefront();

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("mobile");

  // Calculate statistics (mirrors Migration_Data Storefront behavior).
  const stats = useMemo(() => {
    const totalProducts = products?.length || 0;
    const availableProducts =
      products?.filter(
        (p: any) =>
          p.is_available && (p.stock_quantity === null || p.stock_quantity > 0),
      ).length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue =
      orders?.reduce(
        (sum: number, order: any) =>
          sum + (Number(order.total_amount) || 0),
        0,
      ) || 0;
    const pendingOrders =
      orders?.filter((o: any) =>
        ["pending", "processing"].includes(o.status),
      ).length || 0;

    return {
      totalProducts,
      availableProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    };
  }, [products, orders]);

  useEffect(() => {
    if (vendor && (vendor as any).qr_code_url) {
      setQrCodeUrl((vendor as any).qr_code_url);
    }
  }, [vendor]);

  const handleGenerateQRCode = async () => {
    if (!vendor?.id) return;
    try {
      const result = await updateQRCode(vendor.id);
      if ((result as any)?.qr_code_url) {
        setQrCodeUrl((result as any).qr_code_url);
      }
    } catch (error) {
      // Error toast is already handled inside useStorefront
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${vendor?.business_name || "storefront"}-qr-code.png`;
    link.click();
  };

  const storefrontUrl = vendor?.id
    ? `${window.location.origin}/storefront/${vendor.id}`
    : "";

  const handleCopyStorefrontLink = () => {
    if (!storefrontUrl) return;
    navigator.clipboard.writeText(storefrontUrl);
  };

  const handleShare = async () => {
    if (!storefrontUrl || !vendor) return;

    const shareData = {
      title: vendor.business_name || "My Storefront",
      text: `Check out ${vendor.business_name || "my storefront"}!`,
      url: storefrontUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(storefrontUrl);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePreview = () => {
    if (!vendor?.id) return;
    window.open(`/storefront/${vendor.id}`, "_blank");
  };

  if (vendorLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative z-10">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h1 className="mb-2 text-4xl font-bold">
                  Storefront Dashboard
                </h1>
                <p className="text-lg text-white/90">
                  Manage and customize your digital storefront
                </p>
              </div>
            </div>
            <Badge className="flex items-center gap-2 rounded-2xl border-white/30 bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Active
            </Badge>
          </div>

          {vendor?.business_name && (
            <div className="flex items-center gap-2 text-white/90">
              <Globe className="h-5 w-5" />
              <span className="font-medium">{vendor.business_name}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalProducts}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.availableProducts} available
                  </p>
                </div>
                <div className="rounded-xl bg-blue-500/10 p-3">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalOrders}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats.pendingOrders} pending
                  </p>
                </div>
                <div className="rounded-xl bg-green-500/10 p-3">
                  <ShoppingBag className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All time
                  </p>
                </div>
                <div className="rounded-xl bg-orange-500/10 p-3">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-lg transition-shadow hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Storefront Views
                  </p>
                  <p className="text-3xl font-bold text-purple-600">-</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Coming soon
                  </p>
                </div>
                <div className="rounded-xl bg-purple-500/10 p-3">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <QrCode className="h-6 w-6 text-primary" />
                    Your QR Code
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Share your storefront with customers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted p-8">
                {qrCodeUrl ? (
                  <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={qrCodeUrl}
                    alt="Storefront QR Code"
                    className="h-72 w-72 rounded-xl bg-white p-4 shadow-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <QrCode className="h-32 w-32 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      QR Code will appear here
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Storefront Link
                </Label>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="mb-1.5 text-xs text-muted-foreground">
                    QR Code Points To:
                  </p>
                  <p className="break-all font-mono text-sm text-foreground">
                    {storefrontUrl}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={storefrontUrl}
                    readOnly
                    className="h-9 bg-muted/50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyStorefrontLink}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyStorefrontLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePreview}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Preview
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadQRCode}
                  disabled={!qrCodeUrl}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGenerateQRCode}
                disabled={isUpdatingQRCode}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isUpdatingQRCode ? "animate-spin" : ""
                  }`}
                />
                {isUpdatingQRCode ? "Generating..." : "Regenerate QR Code"}
              </Button>

              {vendor && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Storefront Status
                  </p>
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">
                        Storefront is live
                      </p>
                      <p className="text-xs text-green-700">
                        Customers can view your storefront
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Storefront Info (read-only) – edit in Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Store className="h-6 w-6 text-primary" />
                    Storefront Info
                  </CardTitle>
                  <CardDescription className="mt-1">
                    What customers see on your storefront
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link
                    to={ROUTES.VENDOR_DASHBOARD_SETTINGS}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Edit in Settings
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Store className="h-4 w-4" />
                  Business Name
                </Label>
                <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground">
                  {vendor?.business_name || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold text-foreground">
                  Description
                </Label>
                <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground min-h-[4rem]">
                  {vendor?.description || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground">
                  {vendor?.address || "—"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {vendor?.mobile_number || "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-foreground">
                    {vendor?.email || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Preview Section - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Eye className="h-6 w-6 text-primary" />
                  Live Preview
                </CardTitle>
                <CardDescription className="mt-1">
                  See how your storefront looks to customers
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full bg-muted/60 p-1">
                  <Button
                    type="button"
                    variant={previewMode === "mobile" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 rounded-full px-3 text-xs ${
                      previewMode === "mobile" ? "" : "bg-transparent"
                    }`}
                    onClick={() => setPreviewMode("mobile")}
                  >
                    Mobile
                  </Button>
                  <Button
                    type="button"
                    variant={previewMode === "desktop" ? "default" : "ghost"}
                    size="sm"
                    className={`h-8 rounded-full px-3 text-xs ${
                      previewMode === "desktop" ? "" : "bg-transparent"
                    }`}
                    onClick={() => setPreviewMode("desktop")}
                  >
                    Desktop
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {vendor?.id ? (
              previewMode === "desktop" ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted">
                  <iframe
                    src={`/storefront/${vendor.id}`}
                    className="h-full w-full rounded-lg border-0"
                    title="Storefront Preview Desktop"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="relative w-[390px] max-w-full aspect-[9/19.5] rounded-[2rem] border border-border bg-black/90 shadow-2xl">
                    <div className="absolute inset-2 rounded-[1.6rem] overflow-hidden bg-white">
                      <iframe
                        src={`/storefront/${vendor.id}`}
                        className="h-full w-full border-0"
                        title="Storefront Preview Mobile"
                      />
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-primary/20 bg-gradient-to-br from-muted/50 to-muted">
                <div className="flex h-full flex-col items-center justify-center gap-4">
                  <Store className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Preview will appear here
                  </p>
                  <Button variant="outline" onClick={handlePreview}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Live Preview
                  </Button>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>Live</span>
              </div>
              <span>•</span>
              <span>Updated in real-time</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

