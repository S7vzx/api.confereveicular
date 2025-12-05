import { useState, useEffect, useMemo } from "react";
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
import { RefreshCw, CheckCircle, XCircle, Clock, DollarSign, Users, BarChart3, TrendingUp, Calendar, Download, Tag, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Simple password protection (In a real app, use proper auth)
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, paidOrders: 0 });

    // New Coupon State
    const [newCouponCode, setNewCouponCode] = useState("");
    const [newCouponDiscount, setNewCouponDiscount] = useState("");

    const { toast } = useToast();

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            fetchOrders();
            fetchCoupons();
        } else {
            toast({
                title: "Senha incorreta",
                description: "Tente novamente.",
                variant: "destructive"
            });
        }
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await pagarme.getOrders();
            const fetchedOrders = data.data || [];
            setOrders(fetchedOrders);

            // Calculate stats
            const total = fetchedOrders
                .filter((o: any) => o.status === 'paid')
                .reduce((acc: number, curr: any) => acc + curr.items[0].amount, 0);

            setStats({
                totalSales: total,
                totalOrders: fetchedOrders.length,
                paidOrders: fetchedOrders.filter((o: any) => o.status === 'paid').length
            });

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

    const fetchCoupons = async () => {
        try {
            const data = await pagarme.getCoupons();
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
        try {
            await pagarme.createCoupon(newCouponCode, parseFloat(newCouponDiscount));
            setNewCouponCode("");
            setNewCouponDiscount("");
            fetchCoupons();
            toast({ title: "Cupom criado com sucesso!" });
        } catch (error) {
            toast({ title: "Erro ao criar cupom", variant: "destructive" });
        }
    };

    const handleDeleteCoupon = async (code: string) => {
        try {
            await pagarme.deleteCoupon(code);
            fetchCoupons();
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
            ...orders.map(order => [
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
            case 'failed':
                return <Badge variant="destructive">Falhou</Badge>;
            case 'canceled':
                return <Badge variant="secondary">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter orders based on status
    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [orders, statusFilter]);

    // Prepare data for the chart (Group sales by day for the last 7 days from available data)
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};

        // Initialize with 0 for robustness, but here we just aggregate what we have
        orders.forEach(order => {
            if (order.status === 'paid') {
                // Get date part YYYY-MM-DD
                const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const amount = order.items[0]?.amount || 0;
                data[date] = (data[date] || 0) + (amount / 100);
            }
        });

        return Object.entries(data)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => { // Simple sort by date string (DD/MM), works for same year/month usually. Better to use standard date for sorting in real app.
                const [dayA, monthA] = a.date.split('/').map(Number);
                const [dayB, monthB] = b.date.split('/').map(Number);
                if (monthA !== monthB) return monthA - monthB;
                return dayA - dayB;
            })
            .slice(-7); // Last 7 data points
    }, [orders]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-[#19406C]">Acesso Administrativo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        <Button className="w-full bg-[#19406C]" onClick={handleLogin}>
                            Entrar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <img src="/uploads/logo nova.png" alt="Confere Veicular" className="h-8 md:h-10 w-auto" />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={downloadCSV} className="gap-2 hidden md:flex">
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </Button>
                        <Button variant="outline" onClick={() => { fetchOrders(); fetchCoupons(); }} disabled={isLoading} className="gap-2">
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#19406C]">Dashboard</h1>
                        <p className="text-gray-500">Visão geral financeira e de vendas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-green-50 rounded-full text-green-600">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
                                <h3 className="text-3xl font-bold text-[#19406C]">{formatCurrency(stats.totalSales)}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Vendas Aprovadas</p>
                                <h3 className="text-3xl font-bold text-[#19406C]">{stats.paidOrders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-4 bg-orange-50 rounded-full text-orange-600">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total de Pedidos</p>
                                <h3 className="text-3xl font-bold text-[#19406C]">{stats.totalOrders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="sales" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="sales">Vendas</TabsTrigger>
                        <TabsTrigger value="coupons">Gerenciar Cupons</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <Card className="lg:col-span-2 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-[#19406C] flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-gray-500" />
                                        Vendas por Dia
                                    </CardTitle>
                                    <CardDescription>Faturamento dos últimos períodos</CardDescription>
                                </CardHeader>
                                <CardContent className="pl-0">
                                    <div className="h-[300px] w-full">
                                        {chartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} dx={-10} />
                                                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Vendas']} />
                                                    <Bar dataKey="amount" fill="#19406C" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-400">Nenhum dado para exibir</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-[#19406C] text-white">
                                <CardHeader>
                                    <CardTitle className="text-white">Resumo Rápido</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <p className="text-blue-100 text-sm mb-1">Ticket Médio</p>
                                        <p className="text-3xl font-bold">
                                            {stats.paidOrders > 0 ? formatCurrency((stats.totalSales / stats.paidOrders)) : 'R$ 0,00'}
                                        </p>
                                    </div>
                                    <div className="pt-4 border-t border-blue-800">
                                        <p className="text-blue-100 text-sm mb-1">Taxa de Conversão</p>
                                        <p className="text-3xl font-bold">
                                            {stats.totalOrders > 0 ? ((stats.paidOrders / stats.totalOrders) * 100).toFixed(1) + '%' : '0%'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-[#19406C]">Histórico de Vendas</CardTitle>
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
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                                    <TableCell className="font-medium text-gray-700">{formatDate(order.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-[#19406C]">{order.customer?.name || 'Cliente'}</span>
                                                            <span className="text-xs text-gray-500">{order.customer?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-gray-900">
                                                        {formatCurrency(order.items[0]?.amount || 0)}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell className="text-xs text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>Detalhes</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredOrders.length === 0 && !isLoading && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
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

                    <TabsContent value="coupons">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#19406C]">Gerenciar Cupons</CardTitle>
                                <CardDescription>Crie cupons de desconto para seus clientes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
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

                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gray-50">
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
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-[#19406C]">Detalhes do Pedido</DialogTitle>
                            <DialogDescription>ID: {selectedOrder?.id}</DialogDescription>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Status</p>
                                        <div>{getStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Data</p>
                                        <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-bold text-[#19406C] flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Dados do Cliente
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Nome</p>
                                            <p className="font-medium">{selectedOrder.customer?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Email</p>
                                            <p className="font-medium">{selectedOrder.customer?.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">CPF/CNPJ</p>
                                            <p className="font-medium">{selectedOrder.customer?.document}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-[#19406C] flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> Itens do Pedido
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead>Descrição</TableHead>
                                                    <TableHead className="text-right">Valor</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedOrder.items.map((item: any, i: number) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(item.amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-gray-50">
                                                    <TableCell className="font-bold">TOTAL</TableCell>
                                                    <TableCell className="text-right font-bold text-[#19406C]">
                                                        {formatCurrency(selectedOrder.items.reduce((acc: number, item: any) => acc + item.amount, 0))}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </main>
        </div>
    );
};

export default Admin;
