import app from "./app";

// Railway provides the PORT environment variable automatically.
// We use 4000 as a local fallback.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});