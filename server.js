/**
 * @module server
 * @description A minimal HTTP server that listens on a configurable hostname and port,
 * responding to all incoming requests with a plain-text "Hello, World!" message.
 *
 * This module uses the Node.js built-in `http` module to create a single-endpoint
 * HTTP server. The server binds to localhost (127.0.0.1) on port 3000 and returns
 * a 200 OK response with Content-Type text/plain for every request regardless of
 * HTTP method or URL path.
 *
 * @requires http
 * @example
 * // Start the server
 * // $ node server.js
 * // Server running at http://127.0.0.1:3000/
 */

// Import the built-in Node.js HTTP module for creating the web server
const http = require('http');

/**
 * @const {string} hostname
 * @description The hostname (IP address) on which the server will listen.
 * Set to '127.0.0.1' (loopback address) to restrict access to the local machine only.
 * Change to '0.0.0.0' to accept connections from all network interfaces.
 * @default '127.0.0.1'
 */
// Define the server binding address (loopback-only for local development)
const hostname = '127.0.0.1';
/**
 * @const {number} port
 * @description The TCP port number on which the server will listen for incoming connections.
 * Port 3000 is a common development port for Node.js applications.
 * Ensure this port is not already in use to avoid EADDRINUSE errors.
 * @default 3000
 */
// Define the server listening port
const port = 3000;

/**
 * @const {http.Server} server
 * @description The HTTP server instance created by http.createServer().
 * Handles all incoming HTTP requests with a fixed "Hello, World!" response.
 *
 * The request handler callback is invoked for every incoming HTTP request,
 * regardless of the HTTP method (GET, POST, PUT, DELETE, etc.) or URL path.
 * It always responds with:
 * - Status Code: 200 (OK)
 * - Content-Type: text/plain
 * - Body: "Hello, World!\n"
 *
 * @param {http.IncomingMessage} req - The incoming HTTP request object containing
 *   request headers, method, URL, and stream data. Not used in this handler.
 * @param {http.ServerResponse} res - The HTTP response object used to send data
 *   back to the client, including status code, headers, and body content.
 */
// Create the HTTP server with a request handler that responds to all requests
const server = http.createServer((req, res) => {
  // Set the HTTP response status code to 200 (OK)
  res.statusCode = 200;
  // Set the response content type to plain text
  res.setHeader('Content-Type', 'text/plain');
  // Send the response body and signal that the response is complete
  res.end('Hello, World!\n');
});

/**
 * @description Starts the HTTP server, binding it to the specified hostname and port.
 * Once the server is successfully bound, the callback logs the server URL to the console.
 *
 * @listens {number} port - The port number to bind to (3000)
 * @listens {string} hostname - The hostname to bind to ('127.0.0.1')
 * @callback listenCallback
 * @description Called when the server has been bound and is ready to accept connections.
 * Logs the server URL to stdout for developer confirmation.
 */
// Start listening for incoming connections on the specified hostname and port
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
