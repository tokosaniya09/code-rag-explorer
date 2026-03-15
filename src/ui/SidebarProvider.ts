import * as vscode from "vscode";
import { CodeVectorStore } from "../indexer/vectorStore";
import { ChatGenerator } from "../indexer/chatGenerator";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri, private store: CodeVectorStore) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onSearch": {
          const results = await this.store.search(data.value);
          webviewView.webview.postMessage({ type: "search-results", results });
          break;
        }
        case "openFile": {
          const openPath = vscode.Uri.file(data.path);
          const doc = await vscode.workspace.openTextDocument(openPath);
          const editor = await vscode.window.showTextDocument(doc);
          
          const range = new vscode.Range(data.line - 1, 0, data.line - 1, 0);
          editor.selection = new vscode.Selection(range.start, range.end);
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
          break;
        }
        case "askQuestion": {
            const results = await this.store.search(data.value);
            const contextText = results.documents[0].join("\n---\n");
            
            const generator = new ChatGenerator();
            const answer = await generator.generateAnswer(data.value, contextText);
            
            webviewView.webview.postMessage({ type: "ai-response", answer });
            break;
        }}
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; padding: 10px; color: var(--vscode-foreground); }
          input { width: 100%; padding: 8px; margin-bottom: 10px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); }
          .result-item { border-bottom: 1px solid #444; padding: 10px 0; cursor: pointer; }
          .result-item:hover { background: var(--vscode-list-hoverBackground); }
          .file-path { font-size: 0.8em; color: #aaa; margin-bottom: 4px; }
          .snippet { font-family: 'Courier New', monospace; font-size: 0.9em; white-space: pre-wrap; background: #1e1e1e; padding: 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <input type="text" id="searchInput" placeholder="Search by meaning (e.g., 'db ingestion')...">
        <div id="results"></div>

        <script>
          const vscode = acquireVsCodeApi();
          const searchInput = document.getElementById('searchInput');
          const resultsDiv = document.getElementById('results');

          searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              vscode.postMessage({ type: 'onSearch', value: searchInput.value });
            }
          });

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'search-results') {
              resultsDiv.innerHTML = '';
              message.results.metadatas[0].forEach((meta, i) => {
                const div = document.createElement('div');
                div.className = 'result-item';
                div.innerHTML = \`
                  <div class="file-path">\${meta.source} : Line \${meta.startLine}</div>
                  <div class="snippet">\${message.results.documents[0][i].substring(0, 150)}...</div>
                \`;
                div.onclick = () => vscode.postMessage({ 
                  type: 'openFile', 
                  path: meta.source, 
                  line: meta.startLine 
                });
                resultsDiv.appendChild(div);
              });
            }
          });
        </script>
      </body>
      </html>`;
  }
}