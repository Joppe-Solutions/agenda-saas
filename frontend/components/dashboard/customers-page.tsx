"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Tag, X, Phone, Mail, Calendar, DollarSign, RefreshCw, User, MoreHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCustomersList,
  getCustomerHistory,
  listCustomerTags,
  createCustomerTag,
  deleteCustomerTag,
  assignTagToCustomer,
  removeTagFromCustomer,
} from "@/lib/api";
import type { Customer, CustomerTag, Booking } from "@/lib/types";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CustomersPageProps {
  merchantId: string;
}

const TAG_COLORS = [
  { name: "Amarelo", value: "#FFB800" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Verde", value: "#22C55E" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Roxo", value: "#A855F7" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Laranja", value: "#F97316" },
  { name: "Cinza", value: "#6B7280" },
];

export function CustomersPage({ merchantId }: CustomersPageProps) {
  const [customers, setCustomers] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalBookings: number;
    totalSpent: number;
    lastBookingDate?: string;
  }>>([]);
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    customer: Customer;
    stats: { totalBookings: number; totalSpent: number; noShowCount: number };
    tags: CustomerTag[];
    bookings: Booking[];
  } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#FFB800");
  const [createTagLoading, setCreateTagLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [merchantId]);

  async function loadData() {
    setLoading(true);
    try {
      const [customersData, tagsData] = await Promise.all([
        getCustomersList(merchantId),
        listCustomerTags(merchantId),
      ]);
      setCustomers(customersData.customers);
      setTags(tagsData.tags);
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    setCreateTagLoading(true);
    try {
      const result = await createCustomerTag(merchantId, newTagName.trim(), newTagColor);
      setTags((prev) => [...prev, result.tag]);
      setNewTagName("");
      setNewTagColor("#FFB800");
      setCreateTagOpen(false);
    } catch (err) {
      console.error("Error creating tag:", err);
    } finally {
      setCreateTagLoading(false);
    }
  }

  async function handleDeleteTag(tagId: string) {
    try {
      await deleteCustomerTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      console.error("Error deleting tag:", err);
    }
  }

  async function handleAssignTag(customerId: string, tagId: string) {
    try {
      await assignTagToCustomer(customerId, tagId);
      const tag = tags.find((t) => t.id === tagId);
      if (tag && selectedCustomer) {
        setSelectedCustomer({
          ...selectedCustomer,
          tags: [...selectedCustomer.tags, tag],
        });
      }
    } catch (err) {
      console.error("Error assigning tag:", err);
    }
  }

  async function handleRemoveTag(customerId: string, tagId: string) {
    try {
      await removeTagFromCustomer(customerId, tagId);
      if (selectedCustomer) {
        setSelectedCustomer({
          ...selectedCustomer,
          tags: selectedCustomer.tags.filter((t) => t.id !== tagId),
        });
      }
    } catch (err) {
      console.error("Error removing tag:", err);
    }
  }

  async function openCustomerDetails(customerId: string) {
    try {
      const data = await getCustomerHistory(customerId);
      setSelectedCustomer(data);
      setDetailsOpen(true);
    } catch (err) {
      console.error("Error loading customer details:", err);
    }
  }

  const filteredCustomers = searchQuery
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
      )
    : customers;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e etiquetas
          </p>
        </div>
        <Button
          size="sm"
          className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue-950"
          onClick={() => setCreateTagOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Etiqueta
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Etiquetas</CardTitle>
            <CardDescription>Clique para ver clientes com cada etiqueta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: "#fff" }}
                  className="cursor-pointer hover:opacity-80"
                >
                  {tag.name}
                  <button
                    className="ml-1 hover:opacity-70"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Os clientes aparecerão aqui após a primeira reserva
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="cursor-pointer hover:border-brand-cyan/50 transition-colors"
              onClick={() => openCustomerDetails(customer.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand-cyan/20 text-brand-cyan">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{customer.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{customer.totalBookings} reserva{customer.totalBookings !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>R$ {customer.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.customer.name}</DialogTitle>
            <DialogDescription>Histórico e detalhes do cliente</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.stats.totalBookings}</p>
                    <p className="text-xs text-muted-foreground">Reservas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      R$ {selectedCustomer.stats.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total gasto</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedCustomer.stats.noShowCount}</p>
                    <p className="text-xs text-muted-foreground">No-shows</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">
                      {selectedCustomer.stats.totalBookings > 0
                        ? ((selectedCustomer.stats.noShowCount / selectedCustomer.stats.totalBookings) * 100).toFixed(0)
                        : 0}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">Taxa no-show</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Etiquetas</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Selecione uma etiqueta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {tags.filter(t => !selectedCustomer.tags.some(st => st.id === t.id)).map((tag) => (
                        <DropdownMenuItem
                          key={tag.id}
                          onClick={() => handleAssignTag(selectedCustomer.customer.id, tag.id)}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </DropdownMenuItem>
                      ))}
                      {tags.filter(t => !selectedCustomer.tags.some(st => st.id === t.id)).length === 0 && (
                        <DropdownMenuItem disabled>Nenhuma etiqueta disponível</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma etiqueta atribuída</p>
                  ) : (
                    selectedCustomer.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color, color: "#fff" }}
                      >
                        {tag.name}
                        <button
                          className="ml-1 hover:opacity-70"
                          onClick={() => handleRemoveTag(selectedCustomer.customer.id, tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Histórico de Reservas</h4>
                {selectedCustomer.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma reserva encontrada</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{booking.resourceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.bookingDate + "T12:00:00"), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                            {booking.startTime && ` • ${booking.startTime}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">R$ {booking.totalAmount.toFixed(2)}</span>
                          <Badge className={BOOKING_STATUS_COLORS[booking.status]}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createTagOpen} onOpenChange={setCreateTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Etiqueta</DialogTitle>
            <DialogDescription>Crie uma etiqueta para categorizar clientes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ex: VIP, Inadimplente..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newTagColor === color.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewTagColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTagOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={createTagLoading || !newTagName.trim()}
              className="bg-brand-cyan hover:bg-brand-cyan/90 text-white"
            >
              {createTagLoading ? "Criando..." : "Criar Etiqueta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
