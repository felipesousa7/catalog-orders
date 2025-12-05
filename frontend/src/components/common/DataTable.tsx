import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import type { ReactNode } from 'react';
import SortableTableHeader from './SortableTableHeader';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortBy?: string;
  sortDescending?: boolean;
  onSort?: (field: string) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  actions?: (row: T) => ReactNode;
  rowsPerPageOptions?: number[];
}

const DataTable = <T extends { id: number }>({
  data,
  columns,
  loading,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  sortBy = '',
  sortDescending = false,
  onSort,
  emptyMessage = 'Nenhum item encontrado',
  emptyIcon,
  emptyAction,
  actions,
  rowsPerPageOptions = [5, 10, 25, 50],
}: DataTableProps<T>) => {
  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 8 }}>
          <CircularProgress size={48} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 8 }}>
          {emptyIcon}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
          {emptyAction && (
            <Box sx={{ mt: 3 }}>
              {emptyAction}
            </Box>
          )}
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  column.sortable && onSort ? (
                    <SortableTableHeader
                      key={column.id}
                      field={column.id}
                      label={column.label}
                      sortBy={sortBy}
                      sortDescending={sortDescending}
                      onSort={handleSort}
                      align={column.align}
                      width={column.width}
                    />
                  ) : (
                    <TableCell
                      key={column.id}
                      align={column.align || 'center'}
                      sx={{ fontWeight: 600, width: column.width }}
                    >
                      {column.label}
                    </TableCell>
                  )
                ))}
                {actions && (
                  <TableCell align="center" sx={{ fontWeight: 600, width: '120px' }}>
                    Ações
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={row.id}
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
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'center'}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="center">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              onPageSizeChange(parseInt(e.target.value, 10));
              onPageChange(0);
            }}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Itens por página:"
          />
        </TableContainer>
      )}
    </Paper>
  );
};

export default DataTable;

