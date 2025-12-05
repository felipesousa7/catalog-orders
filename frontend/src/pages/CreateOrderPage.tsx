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
import { useSnackbar } from '../contexts/SnackbarContext';
import type { ProductList, CustomerList, CreateOrderItem } from '../types/api';

interface OrderItemWithProduct extends CreateOrderItem {
  productName: string;
  productSku: string;
  unitPrice: number;
  lineTotal: number;
  quantityInput?: string; // Para permitir campo vazio temporariamente
}

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
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
        const errorMessage = err.message || 'Erro ao carregar clientes';
        showError(errorMessage);
      }
    };
    loadCustomers();
  }, [showError]);

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
        const errorMessage = err.message || 'Erro ao buscar produtos';
        showError(errorMessage);
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
      // Se já existe, aumenta a quantidade em 1 (se houver estoque)
      const currentQty = existingItem.quantity;
      if (currentQty >= product.stockQty) {
        showError(`Quantidade máxima disponível em estoque: ${product.stockQty}`);
        return;
      }
      handleUpdateQuantity(product.id, currentQty + 1);
      showSuccess(`Quantidade de ${product.name} aumentada!`);
      setProductSearch('');
      return;
    }

    // Verificar estoque
    if (product.stockQty === 0) {
      showError('Produto sem estoque disponível');
      return;
    }

    const newItem: OrderItemWithProduct = {
      productId: product.id,
      quantity: 1,
      productName: product.name,
      productSku: product.sku,
      unitPrice: product.price,
      lineTotal: product.price,
      quantityInput: undefined,
    };
    setOrderItems([...orderItems, newItem]);
    setProductSearch('');
    showSuccess(`${product.name} adicionado ao pedido!`);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    // Verificar estoque apenas se quantidade for válida (> 0)
    if (quantity > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && quantity > product.stockQty) {
        showError(`Quantidade excede o estoque disponível (${product.stockQty})`);
        return;
      }
    }

    // Atualizar quantidade e recalcular total (se quantidade > 0)
    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId
          ? { 
              ...item, 
              quantity: quantity > 0 ? quantity : item.quantity, // Mantém quantidade anterior se for <= 0
              lineTotal: quantity > 0 ? item.unitPrice * quantity : item.lineTotal,
              quantityInput: quantity > 0 ? undefined : '' // Limpa input temporário se quantidade válida
            }
          : item
      )
    );
  };

  const handleRemoveProduct = (productId: number) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showError('Selecione um cliente');
      return;
    }
    if (orderItems.length === 0) {
      showError('Adicione pelo menos um item ao pedido');
      return;
    }

    // Validar se todas as quantidades são válidas (> 0)
    const invalidItems = orderItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      showError('Todos os itens devem ter quantidade maior que zero');
      return;
    }

    setSubmitting(true);
    try {
      await orderService.create({
        customerId: selectedCustomer.id,
        orderItems: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      showSuccess('Pedido criado com sucesso!');
      navigate('/orders');
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar pedido';
      showError(errorMessage);
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


      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          background: 'linear-gradient(135deg, rgba(0, 61, 122, 0.05) 0%, rgba(0, 102, 204, 0.05) 50%, rgba(79, 195, 247, 0.05) 100%)',
          border: '1px solid rgba(0, 102, 204, 0.15)',
        }}
      >
        <FormControl fullWidth sx={{ mb: 3 }} error={!selectedCustomer && orderItems.length > 0}>
          <InputLabel>Cliente *</InputLabel>
          <Select
            value={selectedCustomer?.id || ''}
            label="Cliente *"
            onChange={(e) => {
              const customer = customers.find((c) => c.id === e.target.value);
              setSelectedCustomer(customer || null);
            }}
            aria-describedby={!selectedCustomer && orderItems.length > 0 ? 'customer-error' : undefined}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </MenuItem>
            ))}
          </Select>
          {!selectedCustomer && orderItems.length > 0 && (
            <Typography id="customer-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
              Selecione um cliente antes de criar o pedido
            </Typography>
          )}
        </FormControl>

        <Autocomplete
          options={products}
          getOptionLabel={(option) => `${option.name} (${option.sku}) - Estoque: ${option.stockQty}`}
          inputValue={productSearch}
          onInputChange={(_, newValue) => setProductSearch(newValue)}
          onChange={(_, value) => {
            handleAddProduct(value);
            // Resetar o valor do Autocomplete para permitir selecionar outro produto
            setTimeout(() => {
              setProductSearch('');
            }, 100);
          }}
          value={null}
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
                        value={item.quantityInput !== undefined ? item.quantityInput : item.quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          
                          // Se campo estiver vazio, apenas atualizar o input temporário
                          if (value === '') {
                            setOrderItems(
                              orderItems.map((i) =>
                                i.productId === item.productId
                                  ? { ...i, quantityInput: '' }
                                  : i
                              )
                            );
                            return;
                          }
                          
                          // Se tiver valor, parsear e atualizar
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue) && numValue > 0) {
                            handleUpdateQuantity(item.productId, numValue);
                          }
                        }}
                        onBlur={(e) => {
                          // Se campo estiver vazio ao perder foco, voltar para quantidade anterior (não forçar 1)
                          if (e.target.value === '' || parseInt(e.target.value, 10) <= 0) {
                            setOrderItems(
                              orderItems.map((i) =>
                                i.productId === item.productId
                                  ? { ...i, quantityInput: undefined } // Remove input temporário, volta para quantidade original
                                  : i
                              )
                            );
                          }
                        }}
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

