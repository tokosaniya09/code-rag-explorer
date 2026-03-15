import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class WorkspaceCrawler {
    async getAllJavaFiles(folderPath: string): Promise<string[]> {
        let results: string[] = [];
        const list = fs.readdirSync(folderPath);

        for (const file of list) {
            const fullPath = path.join(folderPath, file);
            const stat = fs.statSync(fullPath);

            if (file === 'node_modules' || file.startsWith('.')) continue;

            if (stat && stat.isDirectory()) {
                results = results.concat(await this.getAllJavaFiles(fullPath));
            } else if (file.endsWith('.java')) {
                results.push(fullPath);
            }
        }
        return results;
    }
}