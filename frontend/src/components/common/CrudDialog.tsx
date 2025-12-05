import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

interface CrudDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

const CrudDialog = ({
  open,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
}: CrudDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, px: 3, pt: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CrudDialog;

