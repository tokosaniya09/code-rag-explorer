import * as path from 'path';
import * as dotenv from 'dotenv';
import * as vscode from 'vscode';
import { JavaParser } from './ingestion/parser';
import { CodeVectorStore } from './indexer/vectorStore';
import { SidebarProvider } from './ui/SidebarProvider'; 

export async function activate(context: vscode.ExtensionContext) {
    dotenv.config({ path: path.join(context.extensionPath, '.env') });
    console.log(">>> Token loaded successfully. Length:", process.env.HF_TOKEN?.length);

    const parser = new JavaParser();
    const store = new CodeVectorStore();
    await parser.initialize();

    const sidebarProvider = new SidebarProvider(context.extensionUri, store);
    
    const sidebarRegistration = vscode.window.registerWebviewViewProvider(
        "code-rag-explorer-sidebar",
        sidebarProvider
    );

    let indexCmd = vscode.commands.registerCommand('code-rag-explorer.indexWorkspace', async () => {
        console.log(">>> Indexing command triggered"); 
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error(">>> No active editor found!"); 
            return;
        }

        try {
            const code = editor.document.getText();
            console.log(">>> Code length:", code.length); 
            const chunks = parser.parseCode(code, editor.document.fileName);
            console.log(">>> Chunks created:", chunks.length); 
            
            await store.addCodeChunks(chunks);
            vscode.window.showInformationMessage("Code indexed!");
        } catch (err) {
            console.error(">>> INDEXING FAILED:", err); 
            vscode.window.showErrorMessage("Indexing failed: " + err);
        }
    });

    let searchCmd = vscode.commands.registerCommand('code-rag-explorer.search', async () => {
        const query = await vscode.window.showInputBox({ prompt: "What are you looking for?" });
        if (query) {
            const results = await store.search(query);
            console.log(results);
        }
    });

    context.subscriptions.push(
        sidebarRegistration, 
        indexCmd, 
        searchCmd
    );
}

export function deactivate() {}