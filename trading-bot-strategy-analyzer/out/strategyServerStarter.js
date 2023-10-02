"use strict";
// server.ts
// import app from './backend-server';
const app = require('@/backend-server');
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=strategyServerStarter.js.map