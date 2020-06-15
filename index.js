const http = require('http');
const port = process.env.PORT || 3000;


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Oddle Hello!'
  res.write(msg);
  res.end();
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
