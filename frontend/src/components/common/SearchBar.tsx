import { Box, TextField, Paper, Chip } from '@mui/material';

export interface SearchField {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export interface FilterChip {
  label: string;
  value: any;
  onClick: () => void;
  isActive: boolean;
  color?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info';
}

interface SearchBarProps {
  searchFields: SearchField[];
  filterChips?: FilterChip[];
}

const SearchBar = ({ searchFields, filterChips }: SearchBarProps) => {
  return (
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
        {searchFields.map((field, index) => (
          <TextField
            key={index}
            label={field.label}
            size="small"
            type={field.type || 'text'}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            placeholder={field.placeholder}
          />
        ))}
        {filterChips && filterChips.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {filterChips.map((chip, index) => (
              <Chip
                key={index}
                label={chip.label}
                onClick={chip.onClick}
                color={chip.color || (chip.isActive ? 'primary' : 'default')}
                variant={chip.isActive ? 'filled' : 'outlined'}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SearchBar;

