import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { OrderList, OrderStatus } from '../types/api';
import { OrderStatus as OrderStatusValues } from '../types/api';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDescending, setSortDescending] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
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
      setError(err.message || 'Erro ao carregar pedidos');
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

  const SortIcon = ({ field }: { field: string }) => {
    const isActive = sortBy === field;
    const Icon = sortDescending ? ArrowDownwardIcon : ArrowUpwardIcon;
    
    return (
      <Icon 
        fontSize="small" 
        sx={{ 
          ml: 0.5, 
          opacity: isActive ? 1 : 0.6,
          color: isActive ? 'primary.main' : 'text.secondary',
          transition: 'all 0.2s'
        }} 
      />
    );
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

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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

      <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {statusFilter !== undefined
                ? 'Tente ajustar o filtro de status'
                : 'Comece criando seu primeiro pedido'}
            </Typography>
            {statusFilter === undefined && (
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
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '80px' }}>ID</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Cliente</TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('totalAmount')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                      width: '150px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Total
                      <SortIcon field="totalAmount" />
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('status')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                      width: '120px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Status
                      <SortIcon field="status" />
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '100px' }}>Itens</TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('createdAt')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                      width: '180px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Data
                      <SortIcon field="createdAt" />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow 
                    key={order.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s',
                      animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`,
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={500}>
                        {order.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        {order.totalAmount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={order.itemsCount}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="Itens por página:"
            />
            </TableContainer>
          )}
      </Paper>
    </Box>
  );
};

export default OrdersPage;

