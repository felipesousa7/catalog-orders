import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Produtos', path: '/products', icon: InventoryIcon },
    { label: 'Clientes', path: '/customers', icon: PeopleIcon },
    { label: 'Pedidos', path: '/orders', icon: ReceiptIcon },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 50%, #4fc3f7 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ShoppingCartIcon sx={{ color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(45deg, #ffffff 30%, #e8f4f8 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Catalog Orders
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/orders' && location.pathname.startsWith('/orders'));
            
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={<Icon />}
                sx={{
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: isActive 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

