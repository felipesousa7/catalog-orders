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
import PeopleIcon from '@mui/icons-material/People';
import { customerService } from '../services/customerService';
import type { CustomerList, CreateCustomer, UpdateCustomer } from '../types/api';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<CustomerList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
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
      setError(err.message || 'Erro ao carregar clientes');
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
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, formData as UpdateCustomer);
      } else {
        await customerService.create(formData as CreateCustomer);
      }
      handleCloseDialog();
      loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await customerService.delete(id);
      loadCustomers();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir cliente');
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Nome"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder="Buscar por nome..."
          />
          <TextField
            label="Email"
            size="small"
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder="Buscar por email..."
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress size={48} />
          </Box>
        ) : customers.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum cliente encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchName || searchEmail
                ? 'Tente ajustar os filtros de busca'
                : 'Comece adicionando seu primeiro cliente'}
            </Typography>
            {!searchName && !searchEmail && (
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
                    onClick={() => handleSort('email')}
                    sx={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      Email
                      <SortIcon field="email" />
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Documento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer, index) => (
                  <TableRow 
                    key={customer.id}
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
                        #{customer.id}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight={500}>
                        {customer.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                        {customer.document}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
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
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              label="Documento (CPF/CNPJ)"
              fullWidth
              required
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
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

export default CustomersPage;

