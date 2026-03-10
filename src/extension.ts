import * as vscode from 'vscode';
import { JavaParser } from './ingestion/parser';
import { CodeVectorStore } from './indexer/vectorStore';

export async function activate(context: vscode.ExtensionContext) {
    const parser = new JavaParser();
    const store = new CodeVectorStore();
    await parser.initialize();

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

    // Command: Search
    let searchCmd = vscode.commands.registerCommand('code-rag-explorer.search', async () => {
        const query = await vscode.window.showInputBox({ prompt: "What are you looking for?" });
        if (query) {
            const results = await store.search(query);
            // In the next step, we will build the UI to show these results
            console.log(results);
        }
    });

    context.subscriptions.push(indexCmd, searchCmd);
}