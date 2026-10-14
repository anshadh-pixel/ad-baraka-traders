import localtunnel from 'localtunnel';

const SUBDOMAIN = 'adbarakatraders';
const PORT = 5173;

async function runTunnel() {
  console.log(`Connecting tunnel for 127.0.0.1:${PORT} with subdomain "${SUBDOMAIN}"...`);
  try {
    const tunnel = await localtunnel({
      port: PORT,
      subdomain: SUBDOMAIN,
      local_host: '127.0.0.1' // Explicitly bind IPv4 to prevent 502 Bad Gateway on Windows!
    });

    console.log(`[ONLINE] Tunnel URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3s...');
      setTimeout(runTunnel, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err?.message || err);
      setTimeout(runTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to open tunnel, retrying in 5s...', err?.message || err);
    setTimeout(runTunnel, 5000);
  }
}

runTunnel();
