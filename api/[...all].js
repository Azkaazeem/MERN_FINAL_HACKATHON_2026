let app;
try {
  app = require('../PROJECT/BACKEND/server');
} catch (e) {
  try {
    app = require('../BACKEND/server');
  } catch (err) {
    console.error('Failed to import backend server:', err);
  }
}
module.exports = app;
