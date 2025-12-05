import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';
import type { ProductList, CustomerList, CreateOrderItem } from '../types/api';

interface OrderItemWithProduct extends CreateOrderItem {
  productName: string;
  productSku: string;
  unitPrice: number;
  lineTotal: number;
}

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerList | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemWithProduct[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await customerService.list({ pageSize: 100 });
        setCustomers(result.items);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar clientes');
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      if (productSearch.length < 2) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }
      setProductsLoading(true);
      try {
        const result = await productService.list({
          pageSize: 20,
          name: productSearch,
          isActive: true,
        });
        setProducts(result.items);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar produtos');
      } finally {
        setProductsLoading(false);
      }
    };
    const timeoutId = setTimeout(loadProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  const handleAddProduct = (product: ProductList | null) => {
    if (!product) return;
    
    // Verificar se produto já está no pedido
    const existingItem = orderItems.find((item) => item.productId === product.id);
    if (existingItem) {
      setError('Produto já adicionado ao pedido');
      return;
    }

    // Verificar estoque
    if (product.stockQty === 0) {
      setError('Produto sem estoque disponível');
      return;
    }

    const newItem: OrderItemWithProduct = {
      productId: product.id,
      quantity: 1,
      productName: product.name,
      productSku: product.sku,
      unitPrice: product.price,
      lineTotal: product.price,
    };
    setOrderItems([...orderItems, newItem]);
    setProductSearch('');
    setError(null);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stockQty) {
      setError(`Quantidade excede o estoque disponível (${product.stockQty})`);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
          : item
      )
    );
    setError(null);
  };

  const handleRemoveProduct = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      setError('Selecione um cliente');
      return;
    }
    if (orderItems.length === 0) {
      setError('Adicione pelo menos um item ao pedido');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await orderService.create({
        customerId: selectedCustomer.id,
        orderItems: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setSubmitting(false);
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
            Criar Pedido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adicione produtos ao carrinho e finalize o pedido
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 102, 204, 0.05) 50%, rgba(79, 195, 247, 0.05) 100%)',
          border: '1px solid rgba(0, 102, 204, 0.15)',
        }}
      >
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Cliente *</InputLabel>
          <Select
            value={selectedCustomer?.id || ''}
            label="Cliente *"
            onChange={(e) => {
              const customer = customers.find((c) => c.id === e.target.value);
              setSelectedCustomer(customer || null);
            }}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Autocomplete
          options={products}
          getOptionLabel={(option) => `${option.name} (${option.sku}) - Estoque: ${option.stockQty}`}
          inputValue={productSearch}
          onInputChange={(_, newValue) => setProductSearch(newValue)}
          onChange={(_, value) => handleAddProduct(value)}
          loading={productsLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Produto"
              placeholder="Digite o nome do produto..."
              helperText="Digite pelo menos 2 caracteres para buscar produtos"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box>
                <Typography variant="body1" fontWeight={500}>{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  SKU: {option.sku} | Preço: {option.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })} | Estoque: {option.stockQty}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Paper>

      {orderItems.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 600,
            }}
          >
            Itens do Pedido
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Produto</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>SKU</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Preço Unit.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item) => (
                  <TableRow 
                    key={item.productId}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      transition: 'background-color 0.2s',
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
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                        inputProps={{ min: 1, max: 999 }}
                        sx={{ width: 80 }}
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
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveProduct(item.productId)}
                        aria-label="remover"
                        sx={{
                          color: 'error.main',
                          '&:hover': { 
                            backgroundColor: 'error.main',
                            color: 'white',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {orderItems.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 102, 204, 0.05) 50%, rgba(79, 195, 247, 0.05) 100%)',
            border: '1px solid rgba(0, 102, 204, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Total do Pedido
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 50%, #4fc3f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {calculateTotal().toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/orders')}
                sx={{ px: 3 }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={submitting || !selectedCustomer || orderItems.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                  px: 4,
                  py: 1.5,
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Criar Pedido'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CreateOrderPage;

