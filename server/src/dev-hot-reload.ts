import { watch } from 'fs';
import { join } from 'path';
import { readFile } from 'fs';
import { createServer } from 'http';
import * as socketIO from 'socket.io';
import { debounce } from 'lodash';
import { Application } from 'express';

type Options = {
  port: number;
  watchDir: string;
  route: string | string[] | RegExp;
  subDir?: string;
};

/**
 * Hot reloader initiator
 */
const devHotReload = (app: Application, options: Options) => {
  const port = options?.port || 9009;
  const watchDir = options?.watchDir || '.';
  const route = options?.route || '/*';
  const subDir = options?.subDir || '';

  /**
   * Inline script to be injected into index.html file.
   */
  const inlineScript = () =>
    `\n\n<!-- HOT RELOADER -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
<script>
  (function(_io) {
    console.log('Hot reload is enabled');
    var socket = _io.connect('http://localhost:${port}');
    socket.on('reload', function() {
      location.reload();
    });
  })(io);
</script>
<!-- /HOT RELOADER -->\n`;

  // Create http server for socket.io
  const server = createServer();

  // Define socket.io config
  const io = socketIO(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
  });

  // Files watcher handler
  const watchHandler = debounce((event, path: string) => {
    if (path.startsWith(subDir)) {
      console.log('[dev-hot-reload] Sends reload request to client ...');
      io.sockets.emit('reload');
    }
  }, 200);

  // Intercept index.html and append socket.io script
  app.get(route, (req, res) => {
    console.log(
      '[dev-hot-reload] Intercepting index.html and appending socket ...'
    );

    readFile(join(watchDir, subDir, 'index.html'), 'utf8', (err, data) => {
      if (err) throw new Error(err.toString());

      const indexHtml = data.replace('</body>', `${inlineScript()}\n</body>`);

      res.send(indexHtml);
    });
  });

  // Start client files watcher
  watch(join(watchDir), { recursive: true }, watchHandler);

  // Start socket server
  server.listen(port);
};

export default devHotReload;
