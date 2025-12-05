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
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import InventoryIcon from '@mui/icons-material/Inventory';
import { productService } from '../services/productService';
import type { ProductList, CreateProduct, UpdateProduct } from '../types/api';

const ProductsPage = () => {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [searchSku, setSearchSku] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDescending, setSortDescending] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductList | null>(null);
  const [formData, setFormData] = useState<CreateProduct>({
    name: '',
    sku: '',
    price: 0,
    stockQty: 0,
    isActive: true,
  });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.list({
        page: page + 1,
        pageSize,
        name: searchName || undefined,
        sku: searchSku || undefined,
        isActive: isActiveFilter,
        sortBy: sortBy || undefined,
        sortDescending,
      });
      
      // Validar se result existe e tem items
      if (!result || !result.items) {
        console.error('Resposta inválida da API:', result);
        setError('Resposta inválida da API');
        setProducts([]);
        setTotalCount(0);
        return;
      }
      
      // Aplicar filtro isActive no frontend (backend não suporta ainda)
      // Nota: Isso pode afetar a paginação, mas é uma limitação do backend atual
      let filteredItems = result.items;
      if (isActiveFilter !== undefined) {
        filteredItems = result.items.filter(p => p.isActive === isActiveFilter);
      }
      
      setProducts(filteredItems);
      // Manter totalCount original para paginação correta
      // O filtro isActive é apenas visual neste momento
      setTotalCount(result.totalCount);
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.message || 'Erro ao carregar produtos');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchName, searchSku, isActiveFilter, sortBy, sortDescending]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Se já está ordenando por este campo, inverte a direção
      setSortDescending(!sortDescending);
    } else {
      // Novo campo, ordena ascendente
      setSortBy(field);
      setSortDescending(false);
    }
    setPage(0); // Reset para primeira página ao ordenar
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

  const handleOpenDialog = (product?: ProductList) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku, // Mantém SKU mesmo na edição para o tipo
        price: product.price,
        stockQty: product.stockQty,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        price: 0,
        stockQty: 0,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        const updateData: UpdateProduct = {
          name: formData.name,
          price: formData.price,
          stockQty: formData.stockQty,
          isActive: formData.isActive ?? true,
        };
        await productService.update(editingProduct.id, updateData);
      } else {
        await productService.create(formData);
      }
      handleCloseDialog();
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productService.delete(id);
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir produto');
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
            Produtos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seu catálogo de produtos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)',
            },
          }}
        >
          Novo Produto
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Nome"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder="Buscar por nome..."
          />
          <TextField
            label="SKU"
            size="small"
            value={searchSku}
            onChange={(e) => setSearchSku(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder="Buscar por SKU..."
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Todos"
              onClick={() => setIsActiveFilter(undefined)}
              color={isActiveFilter === undefined ? 'primary' : 'default'}
              variant={isActiveFilter === undefined ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Ativos"
              onClick={() => setIsActiveFilter(true)}
              color={isActiveFilter === true ? 'success' : 'default'}
              variant={isActiveFilter === true ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Inativos"
              onClick={() => setIsActiveFilter(false)}
              color={isActiveFilter === false ? 'default' : 'default'}
              variant={isActiveFilter === false ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum produto encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchName || searchSku || isActiveFilter !== undefined
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro produto'}
            </Typography>
            {!searchName && !searchSku && isActiveFilter === undefined && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
                }}
              >
                Adicionar Produto
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '80px' }}>ID</TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('name')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none', 
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Nome
                      <SortIcon field="name" />
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('sku')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      SKU
                      <SortIcon field="sku" />
                    </Box>
                  </TableCell>
                  <TableCell 
                    align="center"
                    onClick={() => handleSort('price')}
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
                      Preço
                      <SortIcon field="price" />
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>Estoque</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow 
                    key={product.id}
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
                        #{product.id}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {product.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        {product.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stockQty}
                        size="small"
                        color={product.stockQty > 10 ? 'success' : product.stockQty > 0 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.isActive ? 'Ativo' : 'Inativo'}
                        color={product.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        aria-label="editar"
                        sx={{
                          color: 'primary.main',
                          '&:hover': { 
                            backgroundColor: 'primary.light',
                            color: 'white',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                        aria-label="excluir"
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

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={700}>
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {!editingProduct && (
              <TextField
                label="SKU"
                fullWidth
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            )}
            <TextField
              label="Preço"
              type="number"
              fullWidth
              required
              inputProps={{ step: '0.01', min: 0 }}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
            <TextField
              label="Estoque"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0 }}
              value={formData.stockQty}
              onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value, 10) || 0 })}
            />
            <Box>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                {' '}Ativo
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;

