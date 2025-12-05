import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Chip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { OrderList, OrderStatus } from '../types/api';
import { OrderStatus as OrderStatusValues } from '../types/api';
import { DataTable } from '../components/common';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDescending, setSortDescending] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const result = await orderService.list({
        page: page + 1,
        pageSize,
        status: statusFilter,
        sortBy: sortBy || undefined,
        sortDescending,
      });
      setOrders(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar pedidos';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter, sortBy, sortDescending]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPage(0);
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatusValues.CREATED:
        return 'Criado';
      case OrderStatusValues.PAID:
        return 'Pago';
      case OrderStatusValues.CANCELLED:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: OrderStatus): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case OrderStatusValues.CREATED:
        return 'primary';
      case OrderStatusValues.PAID:
        return 'success';
      case OrderStatusValues.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: number) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOrderId(null);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    handleMenuClose();
    try {
      await orderService.updateStatus(orderId, { status: newStatus });
      showSuccess('Status do pedido atualizado com sucesso!');
      loadOrders();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar status do pedido';
      showError(errorMessage);
    }
  };

  const handleViewDetails = (orderId: number) => {
    handleMenuClose();
    navigate(`/orders/${orderId}`);
  };

  const getAvailableStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatusValues.CREATED:
        return [OrderStatusValues.PAID, OrderStatusValues.CANCELLED];
      case OrderStatusValues.PAID:
        return [OrderStatusValues.CANCELLED];
      case OrderStatusValues.CANCELLED:
        return [];
      default:
        return [];
    }
  };

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 50%, #4fc3f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Pedidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie os pedidos do sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/orders/create')}
          sx={{
            background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)',
            },
          }}
        >
          Novo Pedido
        </Button>
      </Box>


      <Paper 
        elevation={0}
        sx={{ 
          mb: 3, 
          p: 3,
          background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 102, 204, 0.05) 50%, rgba(79, 195, 247, 0.05) 100%)',
          border: '1px solid rgba(0, 102, 204, 0.15)',
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter ?? ''}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value={OrderStatusValues.CREATED}>Criado</MenuItem>
            <MenuItem value={OrderStatusValues.PAID}>Pago</MenuItem>
            <MenuItem value={OrderStatusValues.CANCELLED}>Cancelado</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <DataTable
        data={orders}
        columns={[
          {
            id: 'id',
            label: 'ID',
            align: 'center',
            width: '80px',
            render: (order) => (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                #{order.id}
              </Typography>
            ),
          },
          {
            id: 'customerName',
            label: 'Cliente',
            sortable: true,
            align: 'center',
            render: (order) => (
              <Typography variant="body1" fontWeight={500}>
                {order.customerName}
              </Typography>
            ),
          },
          {
            id: 'totalAmount',
            label: 'Total',
            sortable: true,
            align: 'center',
            width: '150px',
            render: (order) => (
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {order.totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'center',
            width: '120px',
            render: (order) => (
              <Chip
                label={getStatusLabel(order.status)}
                color={getStatusColor(order.status)}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            ),
          },
          {
            id: 'itemsCount',
            label: 'Itens',
            sortable: true,
            align: 'center',
            width: '100px',
            render: (order) => (
              <Chip
                label={order.itemsCount}
                size="small"
                color="info"
                variant="outlined"
              />
            ),
          },
          {
            id: 'createdAt',
            label: 'Data',
            sortable: true,
            align: 'center',
            width: '180px',
            render: (order) => (
              <Typography variant="body2" color="text.secondary">
                {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            ),
          },
        ]}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(0);
        }}
        sortBy={sortBy}
        sortDescending={sortDescending}
        onSort={handleSort}
        emptyMessage={statusFilter !== undefined
          ? 'Tente ajustar o filtro de status'
          : 'Comece criando seu primeiro pedido'}
        emptyIcon={<ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />}
        emptyAction={statusFilter === undefined ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/orders/create')}
            sx={{
              background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
            }}
          >
            Criar Pedido
          </Button>
        ) : undefined}
        actions={(order) => (
          <>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(order.id)}
              aria-label="ver detalhes"
              sx={{
                color: 'primary.main',
                '&:hover': { 
                  backgroundColor: 'primary.light',
                  color: 'white',
                },
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, order.id)}
              aria-label="mais opções"
              sx={{
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </>
        )}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {selectedOrderId && (() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (!order) return null;
          const availableStatuses = getAvailableStatuses(order.status);
          return (
            <>
              {availableStatuses.map((status) => (
                <MenuItem
                  key={status}
                  onClick={() => handleUpdateStatus(selectedOrderId, status)}
                >
                  Alterar para: {getStatusLabel(status)}
                </MenuItem>
              ))}
              {availableStatuses.length === 0 && (
                <MenuItem disabled>
                  Nenhuma alteração disponível
                </MenuItem>
              )}
            </>
          );
        })()}
      </Menu>
    </Box>
  );
};

export default OrdersPage;

