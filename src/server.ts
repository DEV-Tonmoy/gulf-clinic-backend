import app from "./app";
import adminSettingsRoutes from "./routes/admin.settings.routes";

const PORT = process.env.PORT || 4000;

// Register Settings Routes
app.use('/api/admin/settings', adminSettingsRoutes);

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});