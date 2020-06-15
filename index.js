const http = require('http');
const port = process.env.PORT || 3000;
const appinfo = require('./package.json');
//const envinfo = require('./environment.json');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  const msg = 'Hello Node!\n'
  res.write(`${msg} ${appinfo.name}-${appinfo.version}`);
  res.end();
});


server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
