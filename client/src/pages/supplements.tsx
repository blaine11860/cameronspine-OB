import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, Heart, Pill, Package, Search, ShoppingCart, Plus, Minus, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  privateLabelName: string;
  sku: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  upc: string;
  count: string;
  flavor: string;
  weight: number;
  countUnit: string;
  weightUnit: string;
  isOnBackorder: boolean;
}

interface MedPaxPill {
  sku: string;
  genericName: string;
  privateLabelName: string;
}

interface PrivateLabelCarton {
  sku: string;
  name: string;
  cartonImage: string;
  quantity: number;
}

const productsData = {
  privateLabelProducts: [
    {
      privateLabelName: "3PL Probiotics 30 C",
      sku: "000000000300095860",
      quantity: 0,
      wholesalePrice: 21.57,
      retailPrice: 41.10,
      upc: "",
      count: "30",
      flavor: "",
      weight: 1.6,
      countUnit: "Capsules",
      weightUnit: "OZ",
      isOnBackorder: false
    },
    {
      privateLabelName: "3PL Mood formula 60 C",
      sku: "000000000300095859",
      quantity: 0,
      wholesalePrice: 20.35,
      retailPrice: 39.53,
      upc: "",
      count: "60",
      flavor: "",
      weight: 2.4,
      countUnit: "Capsules",
      weightUnit: "OZ",
      isOnBackorder: false
    }
  ],
  medPaxPills: [
    {
      sku: "000000000100000873",
      genericName: "BIOTIN PLUS",
      privateLabelName: "Beauty"
    },
    {
      sku: "000000000200000131",
      genericName: "FLORA SUPPORT",
      privateLabelName: ""
    }
  ],
  privateLabelCartons: [
    {
      sku: "000000000200087661",
      name: "Wellness Clinic",
      cartonImage: "https://www.wholescripts.com/images/default-image.png",
      quantity: 0
    }
  ]
};

export default function SupplementsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{[sku: string]: number}>({});

  const user = {
    firstName: "Sarah",
    profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
  };

  const addToCart = (sku: string) => {
    setCart(prev => ({
      ...prev,
      [sku]: (prev[sku] || 0) + 1
    }));
    toast({
      title: t.success,
      description: "Item added to cart"
    });
  };

  const removeFromCart = (sku: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[sku] > 1) {
        newCart[sku]--;
      } else {
        delete newCart[sku];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [sku, qty]) => {
      const product = productsData.privateLabelProducts.find(p => p.sku === sku);
      if (product) {
        return total + (product.retailPrice * qty);
      }
      return total;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const filteredProducts = productsData.privateLabelProducts.filter(product =>
    product.privateLabelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPills = productsData.medPaxPills.filter(pill =>
    pill.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pill.privateLabelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 pb-20 lg:pb-0">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.back}
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">{t.supplements}</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                className="border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
              >
                {t.scheduleAppointment}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-deep text-white text-xs rounded-full flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {t.cartTotal}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[300px]">
                    {getCartItemCount() === 0 ? (
                      <p className="text-center text-gray-500 py-8">{t.emptyCart}</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(cart).map(([sku, qty]) => {
                          const product = productsData.privateLabelProducts.find(p => p.sku === sku);
                          if (!product) return null;
                          return (
                            <div key={sku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{product.privateLabelName}</p>
                                <p className="text-xs text-gray-500">${product.retailPrice.toFixed(2)} x {qty}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">${(product.retailPrice * qty).toFixed(2)}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setCart(prev => {
                                      const newCart = { ...prev };
                                      delete newCart[sku];
                                      return newCart;
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  {getCartItemCount() > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between font-medium">
                        <span>{t.cartTotal}:</span>
                        <span className="text-rose-deep">${getCartTotal().toFixed(2)}</span>
                      </div>
                      <Button 
                        className="w-full bg-rose-deep hover:bg-rose-deep/90"
                        onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                      >
                        {t.checkout}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-rose-200" 
              />
              <span className="text-sm font-medium text-gray-700">
                {user.firstName}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.supplementsTitle}</h2>
          <p className="text-gray-600">{t.supplementsDescription}</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t.searchSupplements}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {getCartTotal() > 0 && (
          <Card className="mb-6 border-rose-200 bg-gradient-to-r from-rose-50 to-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-rose-deep" />
                  <span className="font-medium">{t.cartTotal}: ${getCartTotal().toFixed(2)}</span>
                  <span className="text-gray-500">({getCartItemCount()} {t.items})</span>
                </div>
                <Button 
                  className="bg-rose-deep hover:bg-rose-deep/90"
                  onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                >
                  {t.checkout}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="supplements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="supplements" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              {t.supplementsTab}
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t.wellnessTab}
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t.packsTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supplements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.sku} className="border-rose-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.privateLabelName}</CardTitle>
                        <CardDescription>{product.count} {product.countUnit}</CardDescription>
                      </div>
                      {product.isOnBackorder && (
                        <Badge variant="secondary">{t.backorder}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{t.weight}:</span>
                        <span>{product.weight} {product.weightUnit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-rose-deep">
                          ${product.retailPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {cart[product.sku] ? (
                      <div className="flex items-center justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromCart(product.sku)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium">{cart[product.sku]}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => addToCart(product.sku)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-rose-deep hover:bg-rose-deep/90"
                        onClick={() => addToCart(product.sku)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t.addToCart}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wellness">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPills.map((pill) => (
                <Card key={pill.sku} className="border-rose-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{pill.genericName}</CardTitle>
                    {pill.privateLabelName && (
                      <CardDescription>{pill.privateLabelName}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-rose-deep" />
                      <span className="text-sm text-gray-600">{t.wellnessSupport}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      className="w-full border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
                      onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                    >
                      {t.learnMore}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packs">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.privateLabelCartons.map((carton) => (
                <Card key={carton.sku} className="border-rose-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{carton.name}</CardTitle>
                    <CardDescription>{t.wellnessPack}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      className="w-full border-rose-deep text-rose-deep hover:bg-rose-deep hover:text-white"
                      onClick={() => window.open('https://mooreobgyn.com/', '_blank')}
                    >
                      {t.viewDetails}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}
