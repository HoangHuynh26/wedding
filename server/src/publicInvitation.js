const path = require('node:path');
const express = require('express');
const api = require('./app');

const site = express();
const assets = path.resolve(__dirname, '../../client/dist');
const port = Number(process.env.INVITATION_PORT || 5173);

site.disable('x-powered-by');
site.get('/api/health', api);
site.post('/api/rsvp', api);
site.use('/api', (req, res) => res.sendStatus(404));

site.use(express.static(assets));
site.get('*', (req, res) => res.sendFile(path.join(assets, 'index.html')));

for (const address of ['127.0.0.1', '::1']) {
  site.listen(port, address, () => console.log('Invitation listening on', address, port));
}
