import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  People
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography color="textSecondary" variant="h6">
        {title}
      </Typography>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: `${color}.light`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ventas Hoy"
            value="$12,450"
            icon={<TrendingUp sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Productos"
            value="234"
            icon={<Inventory sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ventas del Mes"
            value="156"
            icon={<ShoppingCart sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes"
            value="89"
            icon={<People sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenido al Sistema de Inventario
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Este es el panel principal donde podrás ver un resumen de las operaciones de tu licorería.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Usa el menú lateral para navegar entre las diferentes secciones del sistema.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
