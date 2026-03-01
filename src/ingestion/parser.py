import tree_sitter as tsjava
from tree_sitter import Language, Parser

JAVA_LANGUAGE = Language(tsjava.language())

class CodeParser:
    def __init__(self):
        self.parser = Parser(JAVA_LANGUAGE)

    def get_methods(self, file_path: str):
        """Extracts method blocks from a .java file using Tree-sitter."""
        with open(file_path, 'r', encoding='utf-8') as f:
            code_content = f.read()

        tree = self.parser.parse(bytes(code_content, 'utf8'))

        query = JAVA_LANGUAGE.query("""
            (method_declaration
                name: (identifier) @method_name
                body: (block) @method_body)
        """)

        captures = query.captures(tree.root_node)

        methods = []
        for node, tag in captures:
            if tag == "method_full":
                methods.append({
                    "text": node.text.decode('utf-8'),
                    "metadata": {
                        "file_path": file_path,
                        "start_line": node.start_point[0] + 1,
                        "end_line": node.end_point[0] + 1
                    }
                })
        return methods