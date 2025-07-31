# Podman Stats Extension for Podman Desktop

Questa estensione per Podman Desktop mostra in tempo reale le statistiche dei container tramite un pannello WebView. Utilizza il comando `podman stats` per ottenere i dati e li visualizza in una tabella HTML interattiva.

## 🧩 Funzionalità

- Visualizzazione live delle statistiche dei container Podman
- Interfaccia HTML responsive e leggibile
- Aggiornamento automatico con intervallo configurabile
- Integrazione semplice con Podman Desktop

## ⚙️ Requisiti

- Podman installato e accessibile da terminale
- Podman Desktop
- Node.js e npm (per sviluppo e packaging dell'estensione)

## 📦 Installazione

1. Clona o scarica questa estensione nella directory delle estensioni di Podman Desktop.
2. Assicurati che il file `config.json` sia presente nella root dell'estensione (vedi sezione Configurazione).
3. Avvia o ricarica Podman Desktop per attivare l'estensione.

## 🛠️ Configurazione

Puoi personalizzare la frequenza di aggiornamento creando un file `config.json` nella root dell'estensione con il seguente contenuto:

```json
{
  "refreshRate": 5000
}
