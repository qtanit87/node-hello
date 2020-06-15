const http = require('http');
const port = process.env.PORT || 3000;
const appinfo = require('./package.json');
const appinfo = require('./environment.json');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Oddle Hello!'
  res.write(`${msg} ${appinfo.name}-${appinfo.version} ${environment.envname}`);
  res.end();
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
