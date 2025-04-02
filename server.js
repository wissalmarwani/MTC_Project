// Import the Express app instance from restaurant/app.js
const app = require("./restaurant/app");

// Start the server on port 3000
app.listen(3000, () => {
  console.log("Server is listening on PORT 3000...");
});