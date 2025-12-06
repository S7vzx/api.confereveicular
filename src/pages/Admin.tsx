import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import MinimalFooter from "@/components/MinimalFooter";
import pagarme from "@/services/pagarme";
import { RefreshCw, CheckCircle, XCircle, Clock, DollarSign, Users, BarChart3, TrendingUp, Calendar, Download, Tag, Trash2, BellRing, Filter, PieChart, Sun, Moon, CheckSquare } from "lucide-react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';



// Notification sound
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("7d"); // 7d, 30d, all
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, paidOrders: 0 });

    // Audio ref for notifications
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousOrderCountRef = useRef(0);

    // New Coupon State
    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState("");

    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
    }, []);

    const handleLogin = async () => {
        try {
            const data = await pagarme.login(password);
            if (data.token) {
                setToken(data.token);
                setIsAuthenticated(true);
                toast({ title: "Login realizado com sucesso!" });
            }
        } catch (error) {
            toast({
                title: "Falha na autenticação",
                description: "Senha incorreta.",
                variant: "destructive"
            });
        }
    };

    // Trigger data fetching when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchOrders(token);
            fetchCoupons(token);

            const interval = setInterval(() => {
                fetchOrders(token);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isAuthenticated, token]);

    const fetchOrders = async (authToken: string) => {
        setIsLoading(true);
        try {
            const data = await pagarme.getOrders(authToken);
            const fetchedOrders = data.data || [];

            // Check for new orders to play sound
            if (previousOrderCountRef.current > 0 && fetchedOrders.length > previousOrderCountRef.current) {
                const newOrdersCount = fetchedOrders.length - previousOrderCountRef.current;
                toast({
                    title: "Nova Venda!",
                    description: `${newOrdersCount} novo(s) pedido(s) encontrado(s).`,
                    className: "bg-green-500 text-white border-none"
                });
                audioRef.current?.play().catch(e => console.log("Audio play failed interaction required:", e));
            }
            previousOrderCountRef.current = fetchedOrders.length;

            setOrders(fetchedOrders);
            calculateStats(fetchedOrders, dateFilter);

        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Erro ao buscar vendas",
                description: "Não foi possível carregar as vendas.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (currentOrders: any[], period: string) => {
        const filtered = filterOrdersByDate(currentOrders, period);

        const total = filtered
            .filter((o: any) => o.status === 'paid')
            .reduce((acc: number, curr: any) => acc + curr.items[0].amount, 0);

        setStats({
            totalSales: total,
            totalOrders: filtered.length,
            paidOrders: filtered.filter((o: any) => o.status === 'paid').length
        });
    };

    const filterOrdersByDate = (orderList: any[], period: string) => {
        const now = new Date();
        return orderList.filter(order => {
            const orderDate = new Date(order.created_at);
            if (period === '7d') {
                const limit = new Date(now);
                limit.setDate(limit.getDate() - 7);
                return orderDate >= limit;
            }
            if (period === '30d') {
                const limit = new Date(now);
                limit.setDate(limit.getDate() - 30);
                return orderDate >= limit;
            }
            return true; // 'all'
        });
    };

    // Update stats when date filter changes
    useEffect(() => {
        if (orders.length > 0) {
            calculateStats(orders, dateFilter);
        }
    }, [dateFilter, orders]);

    const fetchCoupons = async (authToken: string) => {
        try {
            const data = await pagarme.getCoupons(authToken);
            setCoupons(data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
        }
    };

    const handleCreateCoupon = async () => {
        if (!newCouponCode || !newCouponDiscount) {
            toast({ title: "Preencha todos os campos", variant: "destructive" });
            return;
        }
        if (!token) return;

        try {
            await pagarme.createCoupon(newCouponCode, parseFloat(newCouponDiscount), token);
            setNewCouponCode("");
            setNewCouponDiscount("");
            fetchCoupons(token);
            toast({ title: "Cupom criado com sucesso!" });
        } catch (error) {
            toast({ title: "Erro ao criar cupom", variant: "destructive" });
        }
    };

    const handleDeleteCoupon = async (code: string) => {
        if (!token) return;
        try {
            await pagarme.deleteCoupon(code, token);
            fetchCoupons(token);
            toast({ title: "Cupom removido" });
        } catch (error) {
            toast({ title: "Erro ao remover cupom", variant: "destructive" });
        }
    };

    const downloadCSV = () => {
        if (!orders.length) return;

        const headers = ["Data", "Nome", "Email", "CPF", "Valor", "Status", "ID Pedido"];
        const csvContent = [
            headers.join(","),
            ...filteredOrders.map(order => [
                new Date(order.created_at).toLocaleString('pt-BR'),
                `"${order.customer?.name || ''}"`,
                order.customer?.email || '',
                order.customer?.document || '',
                (order.items[0]?.amount / 100).toFixed(2),
                order.status,
                order.id
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vendas_confere_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount / 100);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const handleMarkAsPaid = async (orderId: string) => {
        if (!token) return;
        try {
            await pagarme.markAsPaid(orderId, token);
            toast({
                title: "Sucesso!",
                description: "Pedido marcado como pago manualmente.",
                className: "bg-green-500 text-white border-none"
            });
            // Refresh stats and close modal
            fetchOrders(token);
            setSelectedOrder(null);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o pedido.",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600 dark:text-yellow-400 dark:border-yellow-400">Pendente</Badge>;
            case 'failed':
                return <Badge variant="destructive">Falhou</Badge>;
            case 'canceled':
                return <Badge variant="secondary">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter orders based on status and date for the table
    const filteredOrders = useMemo(() => {
        let filtered = filterOrdersByDate(orders, dateFilter);
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        return filtered;
    }, [orders, statusFilter, dateFilter]);

    // Sales by Day Chart Data
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        const activeOrders = filterOrdersByDate(orders, dateFilter);

        activeOrders.forEach(order => {
            if (order.status === 'paid') {
                const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const amount = order.items[0]?.amount || 0;
                data[date] = (data[date] || 0) + (amount / 100);
            }
        });

        return Object.entries(data)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => {
                const [dayA, monthA] = a.date.split('/').map(Number);
                const [dayB, monthB] = b.date.split('/').map(Number);
                if (monthA !== monthB) return monthA - monthB;
                return dayA - dayB;
            });
    }, [orders, dateFilter]);

    // Product Breakdown Data (Mock logic - Pagar.me items usually have description)
    const productData = useMemo(() => {
        const breakdown: Record<string, number> = {};
        const activeOrders = filterOrdersByDate(orders, dateFilter).filter(o => o.status === 'paid');

        activeOrders.forEach(order => {
            order.items.forEach((item: any) => {
                const name = item.description || "Produto Desconhecido";
                breakdown[name] = (breakdown[name] || 0) + (item.amount / 100);
            });
        });

        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    }, [orders, dateFilter]);

    // Sales Funnel Data
    const funnelData = useMemo(() => {
        const activeOrders = filterOrdersByDate(orders, dateFilter);
        const initiated = activeOrders.length; // Approximate "Created"
        const pending = activeOrders.filter(o => o.status === 'pending').length;
        const paid = activeOrders.filter(o => o.status === 'paid').length;

        // Simple logic: Initiated = Total (Created), Pix Generated = Pending + Paid (assumes Pix flow), Paid = Paid
        return [
            { name: "Pedidos Criados", value: initiated, fill: "#3B82F6" },
            { name: "Pix Gerados", value: pending + paid, fill: "#F59E0B" },
            { name: "Pagamentos Confirmados", value: paid, fill: "#10B981" }
        ];
    }, [orders, dateFilter]);

    // Customer Ranking Data
    const customerRanking = useMemo(() => {
        const ranking: Record<string, { name: string, email: string, total: number, count: number }> = {};
        const activeOrders = filterOrdersByDate(orders, dateFilter).filter(o => o.status === 'paid');

        activeOrders.forEach(order => {
            const email = order.customer?.email || "anonimo@email.com";
            if (!ranking[email]) {
                ranking[email] = {
                    name: order.customer?.name || "Cliente",
                    email: email,
                    total: 0,
                    count: 0
                };
            }
            ranking[email].total += (order.items[0]?.amount || 0);
            ranking[email].count += 1;
        });

        return Object.values(ranking)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5
    }, [orders, dateFilter]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-sm border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-bold text-primary">Acesso Administrativo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            className="bg-white/50 dark:bg-zinc-800/50"
                        />
                        <Button className="w-full bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20" onClick={handleLogin}>
                            Entrar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-colors duration-300 flex flex-col font-sans">
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800/50 py-4 sticky top-0 z-50 shadow-sm transition-all">
                <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
                    <img src="/uploads/logo nova.png" alt="Confere Veicular" className="h-8 md:h-10 w-auto" />
                    <div className="flex gap-2">
                        <div className="hidden md:flex items-center gap-1 mr-4 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg border border-gray-200 dark:border-zinc-700">
                            <Button
                                variant={dateFilter === "7d" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setDateFilter("7d")}
                                className={`text-xs h-8 px-3 rounded-md transition-all ${dateFilter === "7d"
                                    ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-sm font-semibold"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    }`}
                            >
                                7 Dias
                            </Button>
                            <Button
                                variant={dateFilter === "30d" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setDateFilter("30d")}
                                className={`text-xs h-8 px-3 rounded-md transition-all ${dateFilter === "30d"
                                    ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-sm font-semibold"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    }`}
                            >
                                30 Dias
                            </Button>
                            <Button
                                variant={dateFilter === "all" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setDateFilter("all")}
                                className={`text-xs h-8 px-3 rounded-md transition-all ${dateFilter === "all"
                                    ? "bg-white dark:bg-zinc-700 text-primary dark:text-white shadow-sm font-semibold"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    }`}
                            >
                                Tudo
                            </Button>
                        </div>
                        <Button variant="outline" onClick={downloadCSV} className="gap-2 hidden md:flex">
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </Button>
                        <Button variant="outline" onClick={() => { if (token) { fetchOrders(token); fetchCoupons(token); } }} disabled={isLoading} className="gap-2">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 tracking-tight">
                            Dashboard <BellRing className="w-5 h-5 text-yellow-500 animate-pulse" />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Visão geral financeira e de vendas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-2xl text-green-600 dark:text-green-400 shadow-inner">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Faturamento ({dateFilter})</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{formatCurrency(stats.totalSales)}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Vendas Aprovadas</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{stats.paidOrders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/50">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-orange-100/50 dark:bg-orange-900/20 rounded-2xl text-orange-600 dark:text-orange-400 shadow-inner">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total de Pedidos</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{stats.totalOrders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="sales" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="sales">Análise de Vendas</TabsTrigger>
                        <TabsTrigger value="products">Produtos & Clientes</TabsTrigger>
                        <TabsTrigger value="coupons">Gerenciar Cupons</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <Card className="lg:col-span-2 shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-gray-500" />
                                        Evolução de Vendas
                                    </CardTitle>
                                    <CardDescription>Faturamento diário nos últimos {dateFilter === '7d' ? '7 dias' : dateFilter === '30d' ? '30 dias' : 'períodos'}</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-0">
                                    <div className="h-[300px] w-full">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} dx={-10} />
                                                    <Tooltip
                                                        cursor={{ fill: theme === 'dark' ? '#27272a' : '#F3F4F6' }}
                                                        contentStyle={{
                                                            borderRadius: '12px',
                                                            border: 'none',
                                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                            backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                                                            color: theme === 'dark' ? '#fff' : '#000'
                                                        }}
                                                        itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                                        formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Vendas']}
                                                    />
                                                    <Bar dataKey="amount" fill="#19406C" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">Nenhum dado para exibir</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Filter className="w-5 h-5" /> Funil de Conversão
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {funnelData.map((stage, i) => (
                                            <div key={i} className="relative">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium text-gray-700">{stage.name}</span>
                                                    <span className="font-bold">{stage.value}</span>
                                                </div>
                                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${stats.totalOrders > 0 ? (stage.value / stats.totalOrders) * 100 : 0}%`,
                                                            backgroundColor: stage.fill
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-right text-xs text-gray-500 mt-1">
                                                    {stats.totalOrders > 0 ? ((stage.value / stats.totalOrders) * 100).toFixed(1) : 0}%
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-4 border-t mt-4">
                                            <p className="text-xs text-center text-gray-500">
                                                Taxa de Aprovação Global: <span className="font-bold text-green-600">{stats.totalOrders > 0 ? ((stats.paidOrders / stats.totalOrders) * 100).toFixed(1) : 0}%</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-primary">Histórico Detalhado</CardTitle>
                                <div className="w-[180px]">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filtrar Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="paid">Pagos</SelectItem>
                                            <SelectItem value="pending">Pendentes</SelectItem>
                                            <SelectItem value="failed">Falhas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50 dark:bg-zinc-900/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="font-semibold text-gray-500">Data</TableHead>
                                                <TableHead className="font-semibold text-gray-500">Cliente</TableHead>
                                                <TableHead className="font-semibold text-gray-500">Itens</TableHead>
                                                <TableHead className="font-semibold text-gray-500">Valor</TableHead>
                                                <TableHead className="font-semibold text-gray-500">Status</TableHead>
                                                <TableHead className="text-right font-semibold text-gray-500">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.slice(0, 10).map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-zinc-800" onClick={() => setSelectedOrder(order)}>
                                                    <TableCell className="font-medium text-gray-700 dark:text-gray-300">{formatDate(order.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-primary">{order.customer?.name || 'Cliente'}</span>
                                                            <span className="text-xs text-gray-400">{order.customer?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500 max-w-[150px] truncate">
                                                        {order.items.map((i: any) => i.description).join(", ")}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(order.items[0]?.amount || 0)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell className="text-xs text-right">
                                                        <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20" onClick={() => setSelectedOrder(order)}>Detalhes</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredOrders.length === 0 && !isLoading && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <XCircle className="w-8 h-8 text-gray-300" />
                                                            <p>Nenhuma venda encontrada com este filtro.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <PieChart className="w-5 h-5" /> Mix de Produtos
                                    </CardTitle>
                                    <CardDescription>O que estamos vendendo mais?</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px] flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={productData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {productData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={theme === 'dark' ? '#18181b' : '#fff'} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                    backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                                                    color: theme === 'dark' ? '#fff' : '#000'
                                                }}
                                                itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                                            />
                                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Users className="w-5 h-5" /> Top Clientes
                                    </CardTitle>
                                    <CardDescription>Melhores compradores do período</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerRanking.map((customer, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{customer.name}</p>
                                                            <p className="text-xs text-gray-500">{customer.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600">
                                                        {formatCurrency(customer.total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {customerRanking.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center text-gray-500 py-8">Sem dados suficientes</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="coupons" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-primary">Gerenciar Cupons</CardTitle>
                                <CardDescription>Crie cupons de desconto para seus clientes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4 items-end bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 p-4 rounded-lg border">
                                    <div className="space-y-2 flex-1">
                                        <label className="text-sm font-medium">Código do Cupom</label>
                                        <Input
                                            placeholder="Ex: BLACKFRIDAY"
                                            value={newCouponCode}
                                            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div className="space-y-2 w-40">
                                        <label className="text-sm font-medium">Desconto</label>
                                        <Select value={newCouponDiscount} onValueChange={setNewCouponDiscount}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="%" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0.05">5%</SelectItem>
                                                <SelectItem value="0.10">10%</SelectItem>
                                                <SelectItem value="0.15">15%</SelectItem>
                                                <SelectItem value="0.20">20%</SelectItem>
                                                <SelectItem value="0.25">25%</SelectItem>
                                                <SelectItem value="0.50">50%</SelectItem>
                                                <SelectItem value="1.00">100% (Grátis)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button className="bg-[#19406C]" onClick={handleCreateCoupon}>
                                        <Tag className="w-4 h-4 mr-2" />
                                        Criar Cupom
                                    </Button>
                                </div>

                                <div className="border rounded-lg overflow-hidden dark:border-zinc-700">
                                    <Table>
                                        <TableHeader className="bg-gray-50 dark:bg-zinc-900">
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Desconto</TableHead>
                                                <TableHead className="text-right">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {coupons.length > 0 ? (
                                                coupons.map((coupon) => (
                                                    <TableRow key={coupon.code}>
                                                        <TableCell className="font-bold">{coupon.code}</TableCell>
                                                        <TableCell>{(coupon.discount * 100).toFixed(0)}% OFF</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCoupon(coupon.code)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">Nenhum cupom ativo no momento.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Order Details Modal */}
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-2xl border-none shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                Detalhes do Pedido
                                <Badge variant={selectedOrder?.status === 'paid' ? 'default' : 'outline'} className={selectedOrder?.status === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                    {selectedOrder?.status === 'paid' ? 'Pago' : selectedOrder?.status}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-gray-500 dark:text-gray-400 font-mono text-xs">ID: {selectedOrder?.id}</DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                                        <div>{getStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data do Pedido</p>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {formatDate(selectedOrder.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 dark:bg-zinc-800/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-700 space-y-4">
                                    <h4 className="font-bold text-primary flex items-center gap-2 text-sm border-b border-gray-200 dark:border-zinc-700 pb-2">
                                        <Users className="w-4 h-4" /> DADOS DO CLIENTE
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Nome</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.customer?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate" title={selectedOrder.customer?.email}>{selectedOrder.customer?.email}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500 dark:text-gray-400 text-xs">CPF/CNPJ</p>
                                            <p className="font-medium text-gray-900 dark:text-gray-100 tracking-wide">{selectedOrder.customer?.document}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-primary flex items-center gap-2 text-sm">
                                        <DollarSign className="w-4 h-4" /> ITENS DO PEDIDO
                                    </h4>
                                    <div className="border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-gray-50/80 dark:bg-zinc-900/80">
                                                <TableRow className="hover:bg-transparent border-gray-100 dark:border-zinc-800">
                                                    <TableHead className="text-gray-600 dark:text-gray-400 h-9">Descrição</TableHead>
                                                    <TableHead className="text-right text-gray-600 dark:text-gray-400 h-9">Valor</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.items.map((item: any, i: number) => (
                                                    <TableRow key={i} className="border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                                                        <TableCell className="text-gray-700 dark:text-gray-300 py-3">{item.description}</TableCell>
                                                        <TableCell className="text-right font-medium text-gray-900 dark:text-gray-100 py-3">
                                                            {formatCurrency(item.amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-gray-50/50 dark:bg-zinc-800/30 font-bold border-t border-gray-200 dark:border-zinc-700">
                                                    <TableCell className="text-primary py-4">TOTAL</TableCell>
                                                    <TableCell className="text-right text-primary py-4 text-base">
                                                        {formatCurrency(selectedOrder.items.reduce((acc: number, item: any) => acc + item.amount, 0))}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                                {selectedOrder.status !== 'paid' && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 transition-all active:scale-95"
                                            onClick={() => handleMarkAsPaid(selectedOrder.id)}
                                        >
                                            <CheckSquare className="w-4 h-4 mr-2" />
                                            Marcar como Pago Manualmente
                                        </Button>
                                        <p className="text-center text-xs text-gray-400 mt-2">
                                            Use esta opção apenas se confirmou o pagamento por outros meios (ex: Pix direto).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </main>
        </div >
    );
};

export default Admin;
