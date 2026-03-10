import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';

export class MavenIngestor {
    private parser = new XMLParser();

    parsePom(pomPath: string) {
        const xmlData = fs.readFileSync(pomPath, 'utf-8');
        const jsonObj = this.parser.parse(xmlData);
        
        // Extracting GroupID, ArtifactID, and Version [cite: 80]
        return {
            groupId: jsonObj.project.groupId || jsonObj.project.parent?.groupId,
            artifactId: jsonObj.project.artifactId,
            version: jsonObj.project.version,
            dependencies: jsonObj.project.dependencies?.dependency || []
        };
    }
}