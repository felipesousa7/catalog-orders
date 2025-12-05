import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import { customerService } from '../services/customerService';
import { useSnackbar } from '../contexts/SnackbarContext';
import type { CustomerList, CreateCustomer, UpdateCustomer } from '../types/api';
import { DataTable, SearchBar, CrudDialog } from '../components/common';

const CustomersPage = () => {
  const { showSuccess, showError } = useSnackbar();
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDescending, setSortDescending] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerList | null>(null);
  const [formData, setFormData] = useState<CreateCustomer | UpdateCustomer>({
    name: '',
    email: '',
    document: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; document?: string }>({});

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await customerService.list({
        page: page + 1,
        pageSize,
        name: searchName || undefined,
        email: searchEmail || undefined,
        sortBy: sortBy || undefined,
        sortDescending,
      });
      setCustomers(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar clientes';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchName, searchEmail, sortBy, sortDescending]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPage(0);
  };

  const handleOpenDialog = (customer?: CustomerList) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        document: customer.document,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        email: '',
        document: '',
      });
    }
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; document?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.document.trim()) {
      newErrors.document = 'Documento é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData as UpdateCustomer);
        showSuccess('Cliente atualizado com sucesso!');
      } else {
        await customerService.create(formData as CreateCustomer);
        showSuccess('Cliente criado com sucesso!');
      }
      handleCloseDialog();
      loadCustomers();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar cliente';
      showError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await customerService.delete(id);
      showSuccess('Cliente excluído com sucesso!');
      loadCustomers();
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao excluir cliente';
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
            Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie sua base de clientes
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
          Novo Cliente
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
            label: 'Email',
            value: searchEmail,
            onChange: setSearchEmail,
            type: 'email',
            placeholder: 'Buscar por email...',
          },
        ]}
      />

      <DataTable
        data={customers}
        columns={[
          {
            id: 'id',
            label: 'ID',
            align: 'center',
            width: '80px',
            render: (customer) => (
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                #{customer.id}
              </Typography>
            ),
          },
          {
            id: 'name',
            label: 'Nome',
            sortable: true,
            align: 'center',
            render: (customer) => (
              <Typography variant="body1" fontWeight={500}>
                {customer.name}
              </Typography>
            ),
          },
          {
            id: 'email',
            label: 'Email',
            sortable: true,
            align: 'center',
            render: (customer) => (
              <Typography variant="body2" color="text.secondary">
                {customer.email}
              </Typography>
            ),
          },
          {
            id: 'document',
            label: 'Documento',
            align: 'center',
            render: (customer) => (
              <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                {customer.document}
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
        emptyMessage={searchName || searchEmail
          ? 'Tente ajustar os filtros de busca'
          : 'Comece adicionando seu primeiro cliente'}
        emptyIcon={<PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />}
        emptyAction={!searchName && !searchEmail ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #0066cc 0%, #4fc3f7 100%)',
            }}
          >
            Adicionar Cliente
          </Button>
        ) : undefined}
        actions={(customer) => (
          <>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(customer)}
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
              onClick={() => handleDelete(customer.id)}
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
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
          <Box>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <Typography id="email-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                {errors.email}
              </Typography>
            )}
          </Box>
          <Box>
            <TextField
              label="Documento (CPF/CNPJ)"
              fullWidth
              required
              value={formData.document}
              onChange={(e) => {
                setFormData({ ...formData, document: e.target.value });
                if (errors.document) setErrors({ ...errors, document: undefined });
              }}
              error={!!errors.document}
              aria-describedby={errors.document ? 'document-error' : undefined}
            />
            {errors.document && (
              <Typography id="document-error" color="error" variant="caption" role="alert" sx={{ mt: 0.5, display: 'block' }}>
                {errors.document}
              </Typography>
            )}
          </Box>
        </Box>
      </CrudDialog>
    </Box>
  );
};

export default CustomersPage;

