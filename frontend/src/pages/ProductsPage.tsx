import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Chip,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { productService } from '../services/productService';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { ProductList, CreateProduct, UpdateProduct } from '../types/api';
import { DataTable, SearchBar, CrudDialog } from '../components/common';

const ProductsPage = () => {
  const { showSuccess, showError } = useSnackbar();
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(false);
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
  const [errors, setErrors] = useState<{ name?: string; sku?: string; price?: string; stockQty?: string }>({});

  const loadProducts = async () => {
    setLoading(true);
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
        showError('Resposta inválida da API');
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
      showError(err.message || 'Erro ao carregar produtos');
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
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPage(0);
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
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; sku?: string; price?: string; stockQty?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!editingProduct && !formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    
    if (formData.stockQty < 0) {
      newErrors.stockQty = 'Estoque não pode ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingProduct) {
        const updateData: UpdateProduct = {
          name: formData.name,
          price: formData.price,
          stockQty: formData.stockQty,
          isActive: formData.isActive ?? true,
        };
        await productService.update(editingProduct.id, updateData);
        showSuccess('Produto atualizado com sucesso!');
      } else {
        await productService.create(formData);
        showSuccess('Produto criado com sucesso!');
      }
      handleCloseDialog();
      loadProducts();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar produto';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await productService.delete(id);
      showSuccess('Produto excluído com sucesso!');
      loadProducts();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao excluir produto';
      showError(errorMessage);
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


      <SearchBar
        searchFields={[
          {
            label: 'Nome',
            value: searchName,
            onChange: setSearchName,
            placeholder: 'Buscar por nome...',
          },
          {
            label: 'SKU',
            value: searchSku,
            onChange: setSearchSku,
            placeholder: 'Buscar por SKU...',
          },
        ]}
        filterChips={[
          {
            label: 'Todos',
            value: undefined,
            onClick: () => setIsActiveFilter(undefined),
            isActive: isActiveFilter === undefined,
            color: 'primary',
          },
          {
            label: 'Ativos',
            value: true,
            onClick: () => setIsActiveFilter(true),
            isActive: isActiveFilter === true,
            color: 'success',
          },
          {
            label: 'Inativos',
            value: false,
            onClick: () => setIsActiveFilter(false),
            isActive: isActiveFilter === false,
          },
        ]}
      />

      <DataTable
        data={products}
        columns={[
          {
            id: 'id',
            label: 'ID',
            align: 'center',
            width: '80px',
            render: (product) => (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                #{product.id}
              </Typography>
            ),
          },
          {
            id: 'name',
            label: 'Nome',
            sortable: true,
            align: 'center',
            render: (product) => (
              <Typography variant="body1" fontWeight={500}>
                {product.name}
              </Typography>
            ),
          },
          {
            id: 'sku',
            label: 'SKU',
            sortable: true,
            align: 'center',
            render: (product) => (
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {product.sku}
              </Typography>
            ),
          },
          {
            id: 'price',
            label: 'Preço',
            sortable: true,
            align: 'center',
            width: '150px',
            render: (product) => (
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {product.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Typography>
            ),
          },
          {
            id: 'stockQty',
            label: 'Estoque',
            sortable: true,
            align: 'center',
            width: '120px',
            render: (product) => (
              <Chip
                label={product.stockQty}
                size="small"
                color={product.stockQty > 10 ? 'success' : product.stockQty > 0 ? 'warning' : 'error'}
                variant="outlined"
              />
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'center',
            width: '120px',
            render: (product) => (
              <Chip
                label={product.isActive ? 'Ativo' : 'Inativo'}
                color={product.isActive ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 500 }}
              />
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
        emptyMessage={searchName || searchSku || isActiveFilter !== undefined
          ? 'Tente ajustar os filtros de busca'
          : 'Comece adicionando seu primeiro produto'}
        emptyIcon={<InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />}
        emptyAction={!searchName && !searchSku && isActiveFilter === undefined ? (
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
        ) : undefined}
        actions={(product) => (
          <>
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
          </>
        )}
      />

      <CrudDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box>
            <TextField
              label="Nome"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <Typography id="name-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                {errors.name}
              </Typography>
            )}
          </Box>
          {!editingProduct && (
            <Box>
              <TextField
                label="SKU"
                fullWidth
                required
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value });
                  if (errors.sku) setErrors({ ...errors, sku: undefined });
                }}
                error={!!errors.sku}
                aria-describedby={errors.sku ? 'sku-error' : undefined}
              />
              {errors.sku && (
                <Typography id="sku-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.sku}
                </Typography>
              )}
            </Box>
          )}
          <Box>
            <TextField
              label="Preço"
              type="number"
              fullWidth
              required
              inputProps={{ step: '0.01', min: 0 }}
              value={formData.price === 0 ? '' : formData.price}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, price: value === '' ? 0 : parseFloat(value) || 0 });
                if (errors.price) setErrors({ ...errors, price: undefined });
              }}
              error={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <Typography id="price-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                {errors.price}
              </Typography>
            )}
          </Box>
          <Box>
            <TextField
              label="Estoque"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0 }}
              value={formData.stockQty === 0 ? '' : formData.stockQty}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ ...formData, stockQty: value === '' ? 0 : parseInt(value, 10) || 0 });
                if (errors.stockQty) setErrors({ ...errors, stockQty: undefined });
              }}
              error={!!errors.stockQty}
              aria-describedby={errors.stockQty ? 'stockQty-error' : undefined}
            />
            {errors.stockQty && (
              <Typography id="stockQty-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                {errors.stockQty}
              </Typography>
            )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Ativo"
          />
        </Box>
      </CrudDialog>
    </Box>
  );
};

export default ProductsPage;

