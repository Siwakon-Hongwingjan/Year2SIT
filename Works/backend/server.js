import * as http from "node:http";
import * as route from "./router.js";

const server = http.createServer((req, res) => {
  route.handleUserRequest(req, res);
});
server.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});
server.on("request", (req, res) => {
  console.log("Request received:", req.method, req.url);
});
