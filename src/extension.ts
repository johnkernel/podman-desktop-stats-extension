import { window, ExtensionContext } from '@podman-desktop/api';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

async function getPodmanStats(): Promise<any[]> {
  try {
    const { stdout } = await execAsync('podman stats --no-stream --format json');
    return JSON.parse(stdout);
  } catch (err) {
    console.error("Errore durante l'esecuzione di podman stats:", err);
    return [];
  }
}

function loadRefreshRate(): number {
  try {
    const configPath = path.join(__dirname, '..', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return config.refreshRate ?? 5000;
  } catch (err) {
    console.warn('Impossibile leggere config.json, uso valore di default.');
    return 5000;
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const panel = window.createWebviewPanel('podmanStats', 'Podman Stats');
  panel.webview.html = getHtml();

  async function sendStats() {
    const stats = await getPodmanStats();
    panel.webview.postMessage({ type: 'update', data: stats });
  }

  const refreshRate = loadRefreshRate();

  setTimeout(sendStats, 500);
  setInterval(sendStats, refreshRate);
}

function getHtml(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f8f9fa;
            color: #212529;
          }

          h2 {
            color: #0d6efd;
          }

          .table-container {
            overflow-x: auto;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            border-radius: 5px;
            overflow: hidden;
          }

          th, td {
            padding: 12px 15px;
            border: 1px solid #dee2e6;
            text-align: left;
          }

          th {
            background-color: #e9ecef;
            font-weight: bold;
          }

          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h2>Podman Stats</h2>
        <div id="table-container" class="table-container">Caricamento...</div>

        <script>
          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'update') {
              const stats = message.data;
              if (!Array.isArray(stats) || stats.length === 0) {
                document.getElementById('table-container').innerText = 'Nessun dato disponibile.';
                return;
              }

              const keys = Object.keys(stats[0]);
              let html = '<table><thead><tr>';
              for (const key of keys) {
                html += '<th>' + key + '</th>';
              }
              html += '</tr></thead><tbody>';

              for (const row of stats) {
                html += '<tr>';
                for (const key of keys) {
                  html += '<td>' + row[key] + '</td>';
                }
                html += '</tr>';
              }

              html += '</tbody></table>';
              document.getElementById('table-container').innerHTML = html;
            }
          });
        </script>
      </body>
    </html>
  `;
}
