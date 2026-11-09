const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9341;
  const url = 'https://Mariebridal.synology.me:5001/d/s/1AZ3JIhLeiwmqAILz5t0yy5I66DKJib8/p8a9n-lzkvfuUP9z65o-hmDrdJ5QC1Xz-db0gg1PqoQ0';
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--ignore-certificate-errors',
    '--no-sandbox',
    '--disable-gpu',
    url
  ]);

  await new Promise(r => setTimeout(r, 3000));

  http.get(`http://127.0.0.1:${port}/json`, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', async () => {
      try {
        const targets = JSON.parse(body);
        const page = targets.find(t => t.type === 'page' && t.url.includes('synology'));
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        let msgId = 1;

        const sendCmd = (method, params = {}) => new Promise((resolve) => {
          const id = msgId++;
          const handler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === id) {
              ws.removeEventListener('message', handler);
              resolve(data.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });

        ws.onopen = async () => {
          await sendCmd('Runtime.enable');
          await new Promise(r => setTimeout(r, 8000));

          // Get the download URLs for all files in AB 15 TO
          const urlsRes = await sendCmd('Runtime.evaluate', {
            expression: `
              (async function() {
                const driveWin = window.SYNO.SDS.Drive.Window;
                const store = driveWin.getStoreMgr().getActiveStore();
                const nav = driveWin.getNavigation();

                function waitForStore() {
                  return new Promise((resolve) => {
                    const cb = () => {
                      store.un('load', cb);
                      resolve(store.data.items.map(i => i.data));
                    };
                    store.on('load', cb);
                  });
                }

                // Enter AB 15 TO
                const folder0 = store.getById("982340051056765415");
                const wait1 = waitForStore();
                nav.appendPath({ id: folder0.data.file_id, text: folder0.data.name });
                await wait1;

                const files = store.data.items;
                return files.map(file => {
                  const o = window.SYNO.SDS.Drive.Utils.getPathId(file.get("file_id"));
                  const s = file.get("name");
                  const n = Ext.apply({
                    params: {
                      files: [o],
                      force_download: false,
                      download_type: "download"
                    }
                  }, window.SYNO.SDS.Drive.WebAPIDesc.download_files);
                  const downloadUrl = window.SYNO.API.GetBaseURL(n, true, s);
                  return {
                    name: s,
                    file_id: file.get("file_id"),
                    size: file.get("size"),
                    url: downloadUrl
                  };
                });
              })()
            `,
            returnByValue: true,
            awaitPromise: true
          });

          const fileList = urlsRes.result?.value || [];
          console.log(`Found ${fileList.length} files in AB 15 TO`);

          // Save URLs to a json file
          const albumDir = path.join(__dirname, '..', 'client', 'public', 'photos', 'album');
          fs.mkdirSync(albumDir, { recursive: true });
          fs.writeFileSync(path.join(albumDir, 'album_urls.json'), JSON.stringify(fileList, null, 2));

          // Now download each file chunk by chunk or full
          for (let i = 0; i < fileList.length; i++) {
            const item = fileList[i];
            const cleanName = item.name.toLowerCase().replace(/\s+/g, '-');
            const destPath = path.join(albumDir, cleanName);
            if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000000) {
              console.log(`[${i+1}/${fileList.length}] Already exists: ${cleanName}`);
              continue;
            }

            console.log(`[${i+1}/${fileList.length}] Downloading ${item.name} (${Math.round(item.size/1024/1024)} MB)...`);
            
            // Download via fetch in browser in base64 chunks or buffer
            const dlRes = await sendCmd('Runtime.evaluate', {
              expression: `
                (async function() {
                  const resp = await fetch('${item.url}');
                  const blob = await resp.blob();
                  return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                  });
                })()
              `,
              returnByValue: true,
              awaitPromise: true,
              timeout: 60000
            });

            if (dlRes.result?.value) {
              const buffer = Buffer.from(dlRes.result.value, 'base64');
              fs.writeFileSync(destPath, buffer);
              console.log(`  -> Saved ${cleanName} (${buffer.length} bytes)`);
            } else {
              console.error(`  -> Failed to download ${item.name}`, dlRes);
            }
          }

          console.log('Finished downloading album files!');
          ws.close();
          chrome.kill();
        };
      } catch (e) {
        console.error(e);
        chrome.kill();
      }
    });
  });
}

main();
