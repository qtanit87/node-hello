const http = require('http');
const port = process.env.PORT || 3000;
const appinfo = require('./package.json');
const dotenv = require('dotenv');
dotenv.config();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Hello World!'
  res.write(`${msg} ${appinfo.name}-${appinfo.version} ${process.env.environment}`);
  res.end();
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
