'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Plus, 
  DollarSign, 
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Search,
  RefreshCw,
  Globe,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCTS } from '@/constants';
import { getCJProducts } from '@/lib/dropshipping';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const chartData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Musaab Asa', email: 'musaab.asa@gmail.com', orders: 12, totalSpent: 1240.50, status: 'Active' },
  { id: '2', name: 'John Doe', email: 'john@example.com', orders: 5, totalSpent: 450.20, status: 'Active' },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@test.com', orders: 1, totalSpent: 89.99, status: 'Inactive' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cjProducts, setCjProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalOrders = orders.length;

  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleWipeData = async () => {
    if (!supabase) return;
    if (!confirm('CRITICAL ACTION: This will delete ALL orders and profiles. This is intended for clearing mock data before going live. Continue?')) return;
    
    setIsWiping(true);
    try {
      // We delete from orders first due to potential foreign keys
      const { error: orderError } = await supabase.from('orders').delete().neq('id', '0');
      if (orderError) throw orderError;
      
      const { error: profileError } = await supabase.from('profiles').delete().neq('id', '0');
      if (profileError) throw profileError;

      toast.success('System purged. Database is ready for real transactions.');
      fetchRealData();
    } catch (error: any) {
      toast.error('Purge failed: ' + error.message);
    } finally {
      setIsWiping(false);
    }
  };

  const handleAddProduct = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('products').insert([{
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      }]);

      if (error) throw error;
      toast.success('Product added to inventory');
      setIsAddingProduct(false);
      setNewProduct({ name: '', description: '', price: '', category: '', image_url: '', stock: '' });
      fetchRealData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchRealData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      // Fetch customers
      const { data: customerData } = await supabase.from('profiles').select('*');
      if (customerData) setCustomers(customerData);

      // Fetch orders
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

      // Fetch products
      const { data: productData } = await supabase.from('products').select('*');
      if (productData) setProducts(productData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCJProducts = async () => {
    setLoading(true);
    try {
      const products = await getCJProducts();
      setCjProducts(products);
    } catch (error) {
      toast.error('Failed to fetch dropshipping products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast.error('Admin access required');
        router.push('/auth');
        return;
      }

      // STRICT ADMIN CHECK
      const adminEmail = 'musaab.asa@gmail.com';
      if (user.email !== adminEmail) {
        toast.error('Unauthorized access. Customers cannot access the command center.');
        router.push('/dashboard');
      } else {
        fetchRealData();
      }
    }).catch((err) => {
      console.warn('Admin check: Failed to retrieve user session.', err);
      toast.error('Could not authenticate. Please double-check network connection or reload.');
      router.push('/auth');
    });

    if (activeTab === 'dropshipping') {
      fetchCJProducts();
    }
  }, [activeTab, router]);

  return (
    <div className="container mx-auto px-4 md:px-8 pb-40">
      <div className="space-y-12 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-5xl font-black italic tracking-tighter">Command Center.</h1>
                 <div className="badge-premium bg-accent/10 text-accent">Admin Access</div>
              </div>
              <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Real-time global store analytics & management</p>
           </div>
           <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="rounded-full font-bold h-12 text-red-500 border-red-100 hover:bg-red-50"
                onClick={handleWipeData}
                disabled={isWiping}
              >
                {isWiping ? 'Purging...' : 'Purge All Data'}
              </Button>
              <Button variant="outline" className="rounded-full font-bold h-12" onClick={() => router.push('/admin/newsletter')}>Newsletter Lab</Button>
              <Button variant="outline" className="rounded-full font-bold h-12">Export Data</Button>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-black/90 rounded-full font-black px-8 h-12 shadow-xl shadow-black/10">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[32px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black italic tracking-tighter">New Product Launch.</DialogTitle>
                    <DialogDescription>Add a premium item to your global curated collection.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Name</Label>
                      <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Price ($)</Label>
                        <Input id="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="rounded-xl" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Stock</Label>
                        <Input id="stock" type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Category</Label>
                      <Input id="category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Image URL</Label>
                      <Input id="image" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="https://..." className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-stone-400">Description</Label>
                      <Textarea id="description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddProduct} className="w-full bg-black text-white hover:bg-black/90 rounded-full font-black h-12">Create Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
        </div>

        <Tabs defaultValue="overview" className="w-full space-y-10" onValueChange={setActiveTab}>
           <div className="flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-stone-100 pb-1">
              <TabsList className="bg-transparent p-0 w-full justify-start md:w-auto h-14 rounded-none gap-8">
                 <TabsTrigger value="overview" className="rounded-none h-full px-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] text-stone-400">Analytics</TabsTrigger>
                 <TabsTrigger value="products" className="rounded-none h-full px-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] text-stone-400">Inventory</TabsTrigger>
                 <TabsTrigger value="customers" className="rounded-none h-full px-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] text-stone-400">Customers</TabsTrigger>
                 <TabsTrigger value="dropshipping" className="rounded-none h-full px-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] text-stone-400">
                    <Zap className="h-3 w-3 mr-2" /> Dropshipping
                 </TabsTrigger>
                 <TabsTrigger value="orders" className="rounded-none h-full px-0 bg-transparent border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] text-stone-400">Orders</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">System Live</span>
                 </div>
                 <Separator orientation="vertical" className="h-4" />
                 <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Vercel Edge Platform</span>
              </div>
           </div>

           <TabsContent value="overview" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Global Revenue" value={`$${totalRevenue.toLocaleString()}`} change="+24.5%" positive={true} icon={DollarSign} />
                 <StatCard title="Active Customers" value={customers.length.toString()} change="+12.2%" positive={true} icon={Users} />
                 <StatCard title="Total Orders" value={totalOrders.toString()} change="-2.4%" positive={false} icon={Package} />
                 <StatCard title="Inventory Items" value={products.length.toString()} change="+3.1%" positive={true} icon={TrendingUp} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 rounded-[40px] border-stone-100 shadow-sm overflow-hidden">
                    <CardHeader className="p-8 pb-0">
                       <CardTitle className="text-xl font-black italic tracking-tighter">Sales Trajectory.</CardTitle>
                       <CardDescription>Daily revenue performance across all international markets.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-8 pt-4 overflow-hidden">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                          <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                                   <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888', fontWeight: 'bold'}} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888', fontWeight: 'bold'}} />
                             <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                                itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                                labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: '#999', marginBottom: '4px' }}
                             />
                             <Area type="monotone" dataKey="sales" stroke="#000" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </CardContent>
                 </Card>

                 <Card className="rounded-[40px] border-stone-100 shadow-sm overflow-hidden">
                    <CardHeader className="p-8">
                       <CardTitle className="text-xl font-black italic tracking-tighter">Live Updates.</CardTitle>
                       <CardDescription>Instant updates from global fulfillment.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                       {(orders.length > 0 ? orders : [1, 2, 3, 4, 5]).slice(0, 5).map((order, idx) => (
                         <div key={idx} className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center shrink-0 border border-stone-100">
                               <Package className="h-5 w-5 text-stone-300" />
                            </div>
                            <div className="flex-grow space-y-0.5">
                               <p className="text-xs font-bold">
                                 {typeof order === 'object' ? `Order: $${order.total_amount}` : `Sample Order: #H-${Math.floor(Math.random()*9000)+1000}`}
                               </p>
                               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Globe className="h-3 w-3" /> {typeof order === 'object' && order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Active Session'}
                               </p>
                            </div>
                         </div>
                       ))}
                       <Button variant="ghost" className="w-full h-12 rounded-full text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-stone-50">View Global Dashboard</Button>
                    </CardContent>
                 </Card>
              </div>
           </TabsContent>

            <TabsContent value="products">
              <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                       <Input placeholder="Filter inventory..." className="h-12 pl-12 rounded-full bg-stone-50 border-none font-bold text-sm" />
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" className="rounded-full h-10 px-6 font-bold text-xs uppercase tracking-widest">Categories</Button>
                       <Button variant="outline" className="rounded-full h-10 px-6 font-bold text-xs uppercase tracking-widest">Status</Button>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-stone-50/50">
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Curated Product</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Category</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Stock Status</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Premium Price</th>
                             <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-stone-400">Control</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-stone-50">
                          {(products.length > 0 ? products : PRODUCTS).map(product => (
                            <tr key={product.id} className="hover:bg-stone-50/30 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 flex items-center justify-center shrink-0 border border-stone-50">
                                        <img src={Array.isArray(product.images) ? product.images[0] : (product.image_url || product.images)} alt="" className="w-full h-full object-cover" />
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="font-bold text-sm text-black group-hover:text-accent transition-colors">{product.name}</p>
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">GLOBAL-REF: {product.id.toString().toUpperCase()}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className="text-[10px] font-black uppercase tracking-widest bg-stone-50 px-4 py-1.5 rounded-full border border-stone-100">{product.category}</span>
                                </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                     <span className="text-xs font-black uppercase tracking-widest">{product.stock !== undefined ? `${product.stock} Units` : 'In Stock'}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-black tracking-tighter text-lg">${Number(product.price).toFixed(2)}</td>
                               <td className="px-8 py-6 text-right">
                                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-black hover:text-white transition-all"><MoreVertical className="h-4 w-4" /></Button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="customers">
              <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                       <Input placeholder="Search customers..." className="h-12 pl-12 rounded-full bg-stone-50 border-none font-bold text-sm" />
                    </div>
                    <Button variant="outline" className="rounded-full h-10 px-6 font-bold text-xs uppercase tracking-widest text-[#CB912F] border-[#CB912F]/20 bg-[#CB912F]/5">
                       VIP Segments
                    </Button>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-stone-50/50">
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Customer Identity</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Joined</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Lifetime Value</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Account status</th>
                             <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-stone-400">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-stone-50">
                          {(customers.length > 0 ? customers : MOCK_CUSTOMERS).map(customer => (
                            <tr key={customer.id} className="hover:bg-stone-50/30 transition-colors group">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-full overflow-hidden bg-stone-100 flex items-center justify-center shrink-0 border border-stone-50">
                                        <Users className="h-5 w-5 text-stone-300" />
                                     </div>
                                     <div className="space-y-0.5">
                                        <p className="font-bold text-sm text-black">{customer.name || customer.full_name || 'Guest User'}</p>
                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{customer.email}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6 font-bold text-sm">
                                 {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                               </td>
                               <td className="px-8 py-6 font-black tracking-tighter text-lg">
                                  ${(customer.totalSpent || 0).toFixed(2)}
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border bg-green-50 text-green-600 border-green-100`}>
                                     Active
                                  </span>
                                </td>
                               <td className="px-8 py-6 text-right">
                                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-black hover:text-white transition-all"><MoreVertical className="h-4 w-4" /></Button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="dropshipping" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <Card className="rounded-3xl border-stone-100 shadow-sm p-6 bg-accent/5 border-accent/10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                          <Zap className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Source Platform</p>
                          <p className="text-xl font-black italic tracking-tighter">CJdropshipping</p>
                       </div>
                    </div>
                 </Card>
                 <Card className="rounded-3xl border-stone-100 shadow-sm p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400">
                          <RefreshCw className="h-6 w-6" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sync Status</p>
                          <p className="text-xl font-black italic tracking-tighter">Active</p>
                       </div>
                    </div>
                 </Card>
              </div>

              <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black italic tracking-tighter">Verified Global Suppliers.</h3>
                       <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Connect and import directly to HDZ-Store</p>
                    </div>
                    <Button onClick={fetchCJProducts} disabled={loading} className="rounded-full bg-black text-white px-8 h-12 shadow-lg shadow-black/10">
                       {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Scan New Suppliers'}
                    </Button>
                 </div>
                 
                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                      Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-80 rounded-[32px] bg-stone-50 animate-pulse" />
                      ))
                    ) : cjProducts.length > 0 ? (
                      cjProducts.map((p: any) => (
                        <Card key={p.pid || p.id} className="rounded-[32px] border-stone-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-black/5 transition-all">
                           <div className="aspect-square relative overflow-hidden bg-stone-50">
                              <img src={p.productImage || p.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-stone-100">
                                 Sourced
                              </div>
                           </div>
                           <CardContent className="p-6 space-y-4">
                              <div className="space-y-1">
                                 <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{p.categoryName || 'Global Direct'}</p>
                                 <h4 className="font-bold text-sm text-black line-clamp-1">{p.productName || p.name}</h4>
                              </div>
                              <div className="flex justify-between items-center">
                                 <p className="text-xl font-black tracking-tighter">${(p.sellPrice || p.price || 0).toFixed(2)}</p>
                                 <Button size="sm" className="rounded-full bg-stone-100 text-black hover:bg-black hover:text-white transition-all font-bold text-xs">Import</Button>
                              </div>
                           </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-20 text-center space-y-6">
                         <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100">
                            <Zap className="h-8 w-8 text-stone-200" />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-xl font-black italic tracking-tighter text-stone-300">No products imported yet.</h4>
                           <Button onClick={fetchCJProducts} variant="ghost" className="text-accent font-bold uppercase tracking-widest text-[10px]">Start Global Scan</Button>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </TabsContent>
           <TabsContent value="orders">
              <div className="bg-white rounded-[40px] border border-stone-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-stone-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic tracking-tighter">Global Transactions.</h3>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Manage fulfillment and track international revenue</p>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-stone-50/50">
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Order ID</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Customer</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Date</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Total</th>
                             <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-stone-400">Fulfillment</th>
                             <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-stone-400">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-stone-50">
                          {orders.length > 0 ? orders.map(order => (
                            <tr key={order.id} className="hover:bg-stone-50/30 transition-colors group">
                               <td className="px-8 py-6">
                                  <p className="font-bold text-xs uppercase tracking-widest">#ORD-{order.id.toString().slice(0, 8)}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-sm font-bold text-black">{order.user_email || 'Guest'}</p>
                               </td>
                               <td className="px-8 py-6 text-xs text-stone-400 font-bold uppercase tracking-widest">
                                  {new Date(order.created_at).toLocaleDateString()}
                               </td>
                               <td className="px-8 py-6 font-black tracking-tighter text-lg">${Number(order.total_amount).toFixed(2)}</td>
                               <td className="px-8 py-6">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${order.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                     {order.status || 'Pending'}
                                  </span>
                                </td>
                               <td className="px-8 py-6 text-right">
                                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-black hover:text-white transition-all"><MoreVertical className="h-4 w-4" /></Button>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="px-8 py-20 text-center">
                                <div className="space-y-4">
                                  <ShoppingBag className="h-12 w-12 text-stone-100 mx-auto" />
                                  <p className="text-stone-300 font-black italic tracking-tighter text-xl">No transactions processed yet.</p>
                                </div>
                              </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, positive, icon: Icon }: any) {
   return (
      <Card className="rounded-[40px] border-stone-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group overflow-hidden">
         <CardHeader className="p-8 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">{title}</CardTitle>
            <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all border border-stone-100">
               <Icon className="h-5 w-5" />
            </div>
         </CardHeader>
         <CardContent className="p-8 pt-0">
            <div className="text-4xl font-black italic tracking-tighter">{value}</div>
            <div className={`mt-4 flex items-center gap-1 font-black text-[10px] ${positive ? 'text-green-500' : 'text-red-500'}`}>
               <div className={`w-1.5 h-1.5 rounded-full ${positive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
               {change} <span className="text-stone-300 ml-1">vs target pulse</span>
            </div>
         </CardContent>
      </Card>
   );
}
