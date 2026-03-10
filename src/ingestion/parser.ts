import * as Parser from 'web-tree-sitter';
import * as path from 'path';

export class JavaParser {
    private parser!: Parser;

    async initialize() {
        await Parser.init();
        this.parser = new Parser();
        // You'll need to download the tree-sitter-java.wasm file
        const Lang = await Parser.Language.load(path.join(__dirname, '../../parsers/tree-sitter-java.wasm'));
        this.parser.setLanguage(Lang);
    }

    /**
     * Extracts methods and classes as logical units (CAST strategy)[cite: 31, 32].
     */
    parseCode(code: string, filePath: string) {
        const tree = this.parser.parse(code);
        const chunks: any[] = [];

        // Query to find method declarations [cite: 14]
        const query = this.parser.getLanguage().query(`
            (method_declaration
                name: (identifier) @name
                body: (block) @body) @method
        `);

        const captures = query.captures(tree.rootNode);

        for (const capture of captures) {
            if (capture.name === 'method') {
                const node = capture.node;
                chunks.push({
                    content: code.substring(node.startIndex, node.endIndex),
                    metadata: {
                        source: filePath,
                        startLine: node.startPosition.row + 1,
                        endLine: node.endPosition.row + 1,
                        type: 'method'
                    }
                });
            }
        }
        return chunks;
    }
}