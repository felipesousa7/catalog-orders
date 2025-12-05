import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { orderService } from '../services/orderService';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { Order, OrderStatus } from '../types/api';
import { OrderStatus as OrderStatusValues } from '../types/api';

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError } = useSnackbar();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) {
        showError('ID do pedido não fornecido');
        navigate('/orders');
        return;
      }

      setLoading(true);
      try {
        const orderData = await orderService.getById(parseInt(id, 10));
        setOrder(orderData);
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao carregar pedido';
        showError(errorMessage);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate, showError]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ minWidth: 'auto' }}
        >
          Voltar
        </Button>
        <Box sx={{ flexGrow: 1 }}>
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
            Detalhes do Pedido #{order.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Informações completas do pedido
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Cards de Informações */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          {/* Informações do Pedido */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: { xs: '100%', md: '300px' } }}>
            <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ReceiptIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Informações do Pedido
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mt: 0.5 }}>
                      {order.totalAmount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Data de Criação
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Informações do Cliente */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: { xs: '100%', md: '300px' } }}>
            <Card elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nome
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                      {order.customerName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ID do Cliente
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      #{order.customerId}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Resumo */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' }, minWidth: { xs: '100%', md: '300px' } }}>
            <Card 
              elevation={0} 
              sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 102, 204, 0.05) 50%, rgba(79, 195, 247, 0.05) 100%)',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Resumo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total de Itens
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                      {order.orderItems.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quantidade Total
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mt: 0.5 }}>
                      {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} unidades
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Itens do Pedido */}
        <Box>
          <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Itens do Pedido
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Produto</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Preço Unit.</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item, index) => (
                    <TableRow 
                      key={item.id}
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
                        <Typography variant="body1" fontWeight={500}>
                          {item.productName}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                          {item.productSku}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.unitPrice.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={item.quantity}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight={600} color="primary.main">
                          {item.lineTotal.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 600, pt: 3 }}>
                      <Typography variant="h6">Total do Pedido:</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, pt: 3 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 50%, #4fc3f7 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {order.totalAmount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderDetailsPage;

