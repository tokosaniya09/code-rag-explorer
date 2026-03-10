import * as vscode from 'vscode';
import { JavaParser } from './ingestion/parser';
import { CodeVectorStore } from './indexer/vectorStore';
import { SidebarProvider } from './ui/SidebarProvider'; // 1. Import the new provider

export async function activate(context: vscode.ExtensionContext) {
    // 2. Initialize our core logic engines
    const parser = new JavaParser();
    const store = new CodeVectorStore();
    await parser.initialize();

    // 3. Setup the Sidebar UI
    const sidebarProvider = new SidebarProvider(context.extensionUri, store);
    
    // 4. Register the Sidebar Provider
    // The ID "code-rag-explorer-sidebar" MUST match the ID in your package.json
    const sidebarRegistration = vscode.window.registerWebviewViewProvider(
        "code-rag-explorer-sidebar",
        sidebarProvider
    );

    // Command: Indexing
    let indexCmd = vscode.commands.registerCommand('code-rag-explorer.indexWorkspace', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const code = editor.document.getText();
        const chunks = parser.parseCode(code, editor.document.fileName);
        
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Indexing Code...",
        }, async () => {
            await store.addCodeChunks(chunks);
        });
        vscode.window.showInformationMessage("Code indexed!");
    });

    // Command: Search (Standard Input Box version)
    let searchCmd = vscode.commands.registerCommand('code-rag-explorer.search', async () => {
        const query = await vscode.window.showInputBox({ prompt: "What are you looking for?" });
        if (query) {
            const results = await store.search(query);
            console.log(results);
        }
    });

    // 5. Push everything into context.subscriptions so VS Code can clean up when deactivated
    context.subscriptions.push(
        sidebarRegistration, 
        indexCmd, 
        searchCmd
    );
}

export function deactivate() {}