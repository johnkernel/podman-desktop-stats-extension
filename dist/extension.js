"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const api_1 = require("@podman-desktop/api");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function getPodmanStats() {
    try {
        const { stdout } = await execAsync('podman stats --no-stream --format json');
        return JSON.parse(stdout);
    }
    catch (err) {
        console.error("Errore durante l'esecuzione di podman stats:", err);
        return [];
    }
}
function loadRefreshRate() {
    try {
        const configPath = path.join(__dirname, '..', 'config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return config.refreshRate ?? 5000;
    }
    catch (err) {
        console.warn('Impossibile leggere config.json, uso valore di default.');
        return 5000;
    }
}
async function activate(context) {
    const panel = api_1.window.createWebviewPanel('podmanStats', 'Podman Stats');
    panel.webview.html = getHtml();
    async function sendStats() {
        const stats = await getPodmanStats();
        panel.webview.postMessage({ type: 'update', data: stats });
    }
    const refreshRate = loadRefreshRate();
    setTimeout(sendStats, 500);
    setInterval(sendStats, refreshRate);
}
function getHtml() {
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
