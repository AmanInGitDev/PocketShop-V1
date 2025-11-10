/**
 * Storefront Page (New - Adapted from reference repo)
 * 
 * Storefront management page with QR code generation and settings.
 * Adapted to use frontend's structure and hooks.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, ExternalLink, Download, Copy, RefreshCw } from "lucide-react";
import { useStorefront } from "@/features/vendor/hooks/useStorefront";
import { useVendor } from "@/features/vendor/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export default function StorefrontNew() {
  const { data: vendor, isLoading: vendorLoading } = useVendor();
  const { generateQRCode, updateQRCode, isUpdatingQRCode, updateStorefront, isUpdatingStorefront } = useStorefront();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    address: '',
    mobile_number: '',
    email: '',
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        business_name: vendor.business_name || '',
        description: vendor.description || '',
        address: vendor.address || '',
        mobile_number: vendor.mobile_number || '',
        email: vendor.email || '',
      });
      
      if (vendor.qr_code_url) {
        setQrCodeUrl(vendor.qr_code_url);
      }
    }
  }, [vendor]);

  const handleGenerateQRCode = async () => {
    if (!vendor?.id) return;
    try {
      const result = await updateQRCode(vendor.id);
      if (result?.qr_code_url) {
        setQrCodeUrl(result.qr_code_url);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${vendor?.business_name || 'storefront'}-qr-code.png`;
    link.click();
    
    sonnerToast.success('QR Code downloaded', {
      description: 'Your QR code has been downloaded successfully',
    });
  };

  const handleCopyStorefrontLink = () => {
    if (!vendor?.id) return;
    
    const storefrontUrl = `${window.location.origin}/storefront/${vendor.id}`;
    navigator.clipboard.writeText(storefrontUrl);
    
    sonnerToast.success('Link copied', {
      description: 'Storefront link copied to clipboard',
    });
  };

  const handlePreview = () => {
    if (!vendor?.id) return;
    window.open(`/storefront/${vendor.id}`, '_blank');
  };

  const handleSaveSettings = () => {
    if (!vendor?.id) return;
    
    updateStorefront({
      business_name: formData.business_name,
      description: formData.description,
      address: formData.address,
      mobile_number: formData.mobile_number,
      email: formData.email,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Storefront</h2>
        <p className="text-muted-foreground">
          Customize your digital storefront and QR code
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="Storefront QR Code"
                  className="w-64 h-64"
                />
              ) : (
                <QrCode className="h-32 w-32 text-muted-foreground" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Storefront Link</Label>
              <div className="flex gap-2">
                <Input
                  value={vendor?.id ? `${window.location.origin}/storefront/${vendor.id}` : ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyStorefrontLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadQRCode}
                disabled={!qrCodeUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePreview}>
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
              <RefreshCw className={`mr-2 h-4 w-4 ${isUpdatingQRCode ? 'animate-spin' : ''}`} />
              {isUpdatingQRCode ? 'Generating...' : 'Regenerate QR Code'}
            </Button>
          </CardContent>
        </Card>

        {/* Storefront Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Storefront Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell customers about your business"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number">Phone</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="Contact phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Contact email address"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSaveSettings}
              disabled={isUpdatingStorefront}
            >
              {isUpdatingStorefront ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Storefront Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Button variant="outline" size="lg" onClick={handlePreview}>
              <ExternalLink className="mr-2 h-5 w-5" />
              Open Live Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

