import { TableCell, Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface SortableTableHeaderProps {
  field: string;
  label: string;
  sortBy: string;
  sortDescending: boolean;
  onSort: (field: string) => void;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

const SortableTableHeader = ({
  field,
  label,
  sortBy,
  sortDescending,
  onSort,
  align = 'center',
  width,
}: SortableTableHeaderProps) => {
  const isActive = sortBy === field;
  const Icon = sortDescending ? ArrowDownwardIcon : ArrowUpwardIcon;

  return (
    <TableCell
      align={align}
      onClick={() => onSort(field)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(field);
        }
      }}
      aria-label={`Ordenar por ${label}${isActive ? (sortDescending ? ' descendente' : ' ascendente') : ''}`}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        fontWeight: 600,
        '&:hover': { backgroundColor: 'action.hover' },
        '&:focus': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: '-2px' },
        transition: 'background-color 0.2s',
        width,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: align, gap: 0.5 }}>
        {label}
        <Icon
          fontSize="small"
          sx={{
            opacity: isActive ? 1 : 0.6,
            color: isActive ? 'primary.main' : 'text.secondary',
            transition: 'all 0.2s',
          }}
        />
      </Box>
    </TableCell>
  );
};

export default SortableTableHeader;

