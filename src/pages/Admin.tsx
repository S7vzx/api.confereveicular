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
import { RefreshCw, CheckCircle, XCircle, Clock, DollarSign, Users, BarChart3, TrendingUp, Calendar, Download, Tag, Trash2, BellRing, Filter, PieChart, Sun, Moon, CheckSquare, ShieldAlert, Volume2, VolumeX, Settings, Play } from "lucide-react";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

import { GridBackground } from "@/components/GridBackground";
// Default notification sound (Cash Register)
const DEFAULT_NOTIFICATION_SOUND = "https://www.myinstants.com/media/sounds/cash-register-purchase.mp3";

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
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        paidOrders: 0,
        avgTicket: 0,
        trends: { sales: 0, orders: 0 },
        topProducts: [] as { name: string, count: number, revenue: number }[]
    });

    // Audio ref for notifications
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previousOrderCountRef = useRef(0);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [notificationSoundUrl, setNotificationSoundUrl] = useState(DEFAULT_NOTIFICATION_SOUND);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initialize state from localStorage after mount (client-side only)
    useEffect(() => {
        try {
            const storedSoundEnabled = localStorage.getItem("admin_sound_enabled");
            if (storedSoundEnabled !== null) {
                setIsSoundEnabled(storedSoundEnabled !== "false");
            }
            const storedUrl = localStorage.getItem("admin_sound_url");
            if (storedUrl) {
                setNotificationSoundUrl(storedUrl);
            }
        } catch (e) {
            console.error("Error loading settings:", e);
        }
    }, []);

    const toggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);
        try {
            localStorage.setItem("admin_sound_enabled", String(newState));
        } catch (e) { }
        toast({
            title: newState ? "Som ativado" : "Som desativado",
        });
    };

    const handleSaveSoundUrl = (url: string) => {
        setNotificationSoundUrl(url);
        localStorage.setItem("admin_sound_url", url);
        // Update current audio instance
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.load();
        }
        toast({ title: "Som de notificação atualizado!" });
    };

    const testSound = () => {
        const audio = new Audio(notificationSoundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => toast({ title: "Erro ao reproduzir", variant: "destructive" }));
    };

    // New Coupon State
    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState("");

    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();

    // Function to filter orders by date
    const filterOrdersByDate = (allOrders: any[], period: string) => {
        const now = new Date();
        let startDate = new Date();

        if (period === '7d') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === '30d') {
            startDate.setDate(now.getDate() - 30);
        } else {
            return allOrders; // 'all' period
        }

        return allOrders.filter(order => new Date(order.created_at) >= startDate);
    };

    // Authentication
    useEffect(() => {
        const storedToken = localStorage.getItem("admin_token");
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const data = await pagarme.login(password);
            localStorage.setItem("admin_token", data.token);
            setToken(data.token);
            setIsAuthenticated(true);
            toast({ title: "Login bem-sucedido!" });
        } catch (error) {
            console.error("Login error:", error);
            toast({ title: "Senha incorreta", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrders = async (authToken: string) => {
        setIsLoading(true);
        try {
            const response = await pagarme.getOrders(authToken);
            const fetchedOrders = response.data || [];

            setOrders(fetchedOrders);
            // Check for new orders to play sound
            if (previousOrderCountRef.current > 0 && fetchedOrders.length > previousOrderCountRef.current) {
                const newOrdersCount = fetchedOrders.length - previousOrderCountRef.current;
                toast({
                    title: "Nova Venda!",
                    description: `${newOrdersCount} novo(s) pedido(s) encontrado(s).`,
                    className: "bg-green-500 text-white border-none"
                });

                if (isSoundEnabled) {
                    audioRef.current?.play().catch(e => console.log("Audio play failed interaction required:", e));
                }

                setHasNewNotification(true);
                setTimeout(() => setHasNewNotification(false), 5000);
            }
            previousOrderCountRef.current = fetchedOrders.length;
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

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchOrders(token);
            fetchCoupons(token);
            // Set up polling for new orders every 30 seconds
            const interval = setInterval(() => {
                fetchOrders(token);
            }, 30000); // 30 seconds
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [isAuthenticated, token]);

    // Initialize audio ref
    useEffect(() => {
        // Initialize audio ref
        useEffect(() => {
            audioRef.current = new Audio(notificationSoundUrl);
            audioRef.current.volume = 0.5;
        }, [notificationSoundUrl]);
        audioRef.current.volume = 0.5;
    }, []);

    // ... (calculateStats function update)
    const calculateStats = (currentOrders: any[], period: string) => {
        const now = new Date();
        const getStartDate = (date: Date, type: string) => {
            const newDate = new Date(date);
            if (type === '7d') newDate.setDate(newDate.getDate() - 7);
            if (type === '30d') newDate.setDate(newDate.getDate() - 30);
            return newDate;
        };

        // Current Period
        const limitCurrent = getStartDate(now, period);
        const currentPeriodOrders = currentOrders.filter(o => new Date(o.created_at) >= limitCurrent);

        // Previous Period (for trends)
        const limitPrevious = getStartDate(limitCurrent, period);
        const previousPeriodOrders = currentOrders.filter(o => {
            const d = new Date(o.created_at);
            return d >= limitPrevious && d < limitCurrent;
        });

        // Sales Aggregates
        const getSales = (list: any[]) => list
            .filter(o => o.status === 'paid')
            .reduce((acc, curr) => acc + curr.items[0].amount, 0);

        const currentSales = getSales(currentPeriodOrders);
        const previousSales = getSales(previousPeriodOrders);

        const currentPaidCount = currentPeriodOrders.filter(o => o.status === 'paid').length;
        const previousPaidCount = previousPeriodOrders.filter(o => o.status === 'paid').length;

        // Trend Calculation
        const calcTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        // Top Products Logic
        const productMap: Record<string, { count: number, revenue: number }> = {};
        currentPeriodOrders.filter(o => o.status === 'paid').forEach(order => {
            let name = order.items[0]?.description || "Consulta Veicular";

            // Normalize Product Names
            if (name.includes("Placa")) name = "Consulta Completa";
            else if (name.includes("Débitos")) name = "Débitos Veiculares";
            else if (name.includes("Leilão")) name = "Consulta Leilão";

            if (!productMap[name]) productMap[name] = { count: 0, revenue: 0 };
            productMap[name].count += 1;
            productMap[name].revenue += order.items[0].amount;
        });

        const topProducts = Object.entries(productMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        setStats({
            totalSales: currentSales,
            totalOrders: currentPeriodOrders.length,
            paidOrders: currentPaidCount,
            avgTicket: currentPaidCount > 0 ? currentSales / currentPaidCount : 0,
            trends: {
                sales: calcTrend(currentSales, previousSales),
                orders: calcTrend(currentPaidCount, previousPaidCount)
            },
            topProducts
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

    // Product Breakdown Data
    const productData = useMemo(() => {
        const breakdown: Record<string, number> = {};
        const activeOrders = filterOrdersByDate(orders, dateFilter).filter(o => o.status === 'paid');

        activeOrders.forEach(order => {
            order.items.forEach((item: any) => {
                let name = item.description || "Produto Desconhecido";

                // Normalize Product Names
                if (name.includes("Placa")) name = "Consulta Completa";
                else if (name.includes("Débitos")) name = "Débitos Veiculares";
                else if (name.includes("Leilão")) name = "Consulta Leilão";

                breakdown[name] = (breakdown[name] || 0) + (item.amount / 100);
            });
        });

        return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
    }, [orders, dateFilter]);

    // Heatmap Data (Sales by Hour)
    const heatmapData = useMemo(() => {
        const hours = Array(24).fill(0).map((_, i) => ({ hour: `${i} h`, count: 0 }));
        const activeOrders = filterOrdersByDate(orders, dateFilter).filter(o => o.status === 'paid');

        activeOrders.forEach(order => {
            const date = new Date(order.created_at);
            const hour = date.getHours();
            if (hours[hour]) {
                hours[hour].count += 1;
            }
        });
        return hours;
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
            <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 relative overflow-hidden">
                <GridBackground />
                <div className="absolute top-0 w-full h-full bg-gradient-to-b from-transparent via-white/50 to-white/80 pointer-events-none" />

                <Card className="w-full max-w-[400px] border border-white/40 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] bg-white/80 backdrop-blur-xl rounded-2xl p-2 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent opacity-50 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-10 pt-8 relative">
                        <div className="mx-auto w-auto h-16 flex items-center justify-center mb-6">
                            <img
                                src="/uploads/logo nova.png"
                                alt="Confere Veicular"
                                className="h-full w-auto object-contain drop-shadow-sm"
                            />
                        </div>
                        <CardTitle className="text-center text-[#1A3C6D] text-2xl font-extrabold tracking-tight">
                            Acesso Administrativo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pb-8 px-8 relative">
                        <div className="space-y-2 group">
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="Senha de acesso"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    className="h-12 bg-gray-50/50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-[#1A3C6D] focus-visible:ring-offset-0 rounded-xl text-base pl-4 transition-all group-hover:bg-white group-hover:shadow-sm"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 bg-[#19406C] hover:bg-[#15355a] text-white font-bold rounded-xl text-base shadow-lg shadow-blue-900/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleLogin}
                        >
                            Entrar no Painel
                        </Button>

                        <div className="mt-6 flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                            <ShieldAlert className="w-4 h-4 text-[#19406C] shrink-0 mt-0.5" />
                            <div className="text-xs text-slate-600 leading-relaxed">
                                <span className="font-semibold text-[#19406C] block mb-0.5">Ambiente Seguro</span>
                                Acesso monitorado e restrito apenas a pessoal autorizado.
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <p className="mt-8 text-center text-xs text-gray-400 z-10 font-medium">
                    &copy; 2025 Confere Veicular Consultoria LTDA
                </p>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-300 flex flex-col font-sans">
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800/50 py-4 sticky top-0 z-50 shadow-sm transition-all">
                <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
                    <img src="/uploads/logo nova.png" alt="Confere Veicular" className="h-8 md:h-10 w-auto" />
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleSound} title={isSoundEnabled ? "Desativar som" : "Ativar som"}>
                            {isSoundEnabled ? (
                                <Volume2 className="h-[1.2rem] w-[1.2rem]" />
                            ) : (
                                <VolumeX className="h-[1.2rem] w-[1.2rem] text-gray-400" />
                            )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} title="Configurações de Notificação">
                            <Settings className="h-[1.2rem] w-[1.2rem]" />
                        </Button>
                    </div>
                </div>
            </header>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configurações de Notificação</DialogTitle>
                        <DialogDescription>
                            Personalize como você quer ser alertado sobre novas vendas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-base font-medium">Som de Notificação</label>
                                <p className="text-sm text-gray-500">Ativar ou desativar alertas sonoros</p>
                            </div>
                            <Button
                                variant={isSoundEnabled ? "default" : "outline"}
                                onClick={toggleSound}
                                className={isSoundEnabled ? "bg-[#19406C]" : ""}
                            >
                                {isSoundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                                {isSoundEnabled ? "Ativado" : "Desativado"}
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-medium">Avatar URL do Som (MP3)</label>
                            <div className="flex gap-2">
                                <Input
                                    value={notificationSoundUrl}
                                    onChange={(e) => setNotificationSoundUrl(e.target.value)}
                                    placeholder="https://exemplo.com/som.mp3"
                                />
                                <Button size="icon" variant="outline" onClick={testSound} title="Testar som">
                                    <Play className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                Cole o link direto de um arquivo de áudio (MP3). <br />
                                Padrão: Caixa Registradora.
                            </p>
                        </div>

                        <Button className="w-full bg-[#19406C] hover:bg-[#19406C]/90" onClick={() => {
                            handleSaveSoundUrl(notificationSoundUrl);
                            setIsSettingsOpen(false);
                        }}>
                            Salvar Alterações
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Dashboard de Vendas</h2>
                        <p className="text-muted-foreground">Visão geral do desempenho de suas consultas veiculares.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Notification Bell */}
                        <div className={`mr-2 p-2 rounded-full transition-all duration-300 ${hasNewNotification ? 'bg-red-100 text-red-600 animate-bounce' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}`}>
                            <BellRing className={`w-6 h-6 ${hasNewNotification ? 'fill-current' : ''}`} />
                        </div>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-[140px] shadow-sm bg-card text-card-foreground border-border">
                                <Calendar className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                                <SelectItem value="all">Todo o período</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            className="shadow-sm bg-card text-card-foreground border-border hover:bg-muted"
                            onClick={() => {
                                fetchOrders(token!);
                                toast({ title: "Atualizando dados..." });
                            }}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                        <Button variant="outline" onClick={downloadCSV} className="shadow-sm bg-card text-card-foreground border-border hover:bg-muted">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Faturamento Total</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{formatCurrency(stats.totalSales)}</h3>
                                <div className={`flex items-center text-xs font-bold mt-2 ${stats.trends.sales >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {stats.trends.sales >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                                    {Math.abs(stats.trends.sales).toFixed(1)}% vs anterior
                                </div>
                            </div>
                            <div className="p-4 bg-green-100/50 dark:bg-green-900/20 rounded-2xl text-green-600 dark:text-green-400 shadow-inner">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Passaram no Checkout</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{stats.paidOrders}</h3>
                                <div className={`flex items-center text-xs font-bold mt-2 ${stats.trends.orders >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {stats.trends.orders >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                                    {Math.abs(stats.trends.orders).toFixed(1)}% vs anterior
                                </div>
                            </div>
                            <div className="p-4 bg-blue-100/50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400 shadow-inner">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Ticket Médio</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{formatCurrency(stats.avgTicket)}</h3>
                                <p className="text-xs text-muted-foreground mt-2">Por pedido pago</p>
                            </div>
                            <div className="p-4 bg-purple-100/50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400 shadow-inner">
                                <Tag className="w-8 h-8" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1">Total de Pedidos</p>
                                <h3 className="text-3xl font-bold text-primary tracking-tight">{stats.totalOrders}</h3>
                                <p className="text-xs text-muted-foreground mt-2">Inclui pendentes/falhas</p>
                            </div>
                            <div className="p-4 bg-orange-100/50 dark:bg-orange-900/20 rounded-2xl text-orange-600 dark:text-orange-400 shadow-inner">
                                <Users className="w-8 h-8" />
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
                            {/* Top Products Card - New Addition */}
                            <Card className="lg:col-span-1 shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/90 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-accent" />
                                        Top Produtos
                                    </CardTitle>
                                    <CardDescription>O que seus clientes mais compram</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {stats.topProducts.length > 0 ? (
                                            stats.topProducts.map((product, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground line-clamp-1" title={product.name}>{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">{product.count} vendas</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-primary">{formatCurrency(product.revenue)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">Sem dados de vendas ainda</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sales Chart - Modified to take up 2 cols */}
                            <Card className="lg:col-span-2 shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/90 bg-card">
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
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `R$${value} `} dx={-10} />
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
                                                        formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')} `, 'Vendas']}
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
                                                            width: `${stats.totalOrders > 0 ? (stage.value / stats.totalOrders) * 100 : 0}% `,
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

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <Card className="lg:col-span-3 shadow-md border-none lg:hover:shadow-lg transition-all dark:bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-orange-500" />
                                        Horários de Pico (Heatmap)
                                    </CardTitle>
                                    <CardDescription>Volume de vendas por hora do dia</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={heatmapData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
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
                                                    formatter={(value: number) => [value, 'Vendas']}
                                                />
                                                <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
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
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}% `}
                                            >
                                                {productData.map((entry, index) => (
                                                    <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} stroke={theme === 'dark' ? '#18181b' : '#fff'} />
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

            </main >
        </div >
    );
};

export default Admin;
