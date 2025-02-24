import { transform } from "lightningcss";
import * as fs from "node:fs";
import path from "node:path";
import type { PluginOption } from "vite";

function extractClassnames(code: string, sourceFile: string): string[] | null {
    const { exports } = transform({
        code: Buffer.from(code),
        filename: sourceFile,
        cssModules: true,
    });
    if (!exports) return [];
    return Object.keys(exports);
}

function generateTypeDefinitions(exports: string[]): string {
    const typeDefinitions = exports.map((key) => `  readonly "${key}": string;`).join("\n");

    const content = `declare const styles: {
  ${typeDefinitions}
};
export default styles;
  `;

    return content;
}

function typedCssModules(): PluginOption {
    return {
        name: "vite-plugin-css-types",
        enforce: "pre", // Exécuter après le traitement des CSS
        async transform(code, id) {
            if (id.endsWith(".css") || id.endsWith(".scss")) {
                const exports = extractClassnames(code, id);

                if (!exports) return null;

                const target = `${id}.d.ts`;

                const definitions = generateTypeDefinitions(exports);

                await fs.promises.writeFile(target, definitions, "utf-8");

                this.info(`Generated types for ${path.relative(__dirname, id)} at ${path.relative(__dirname, target)}`);
            }
            return null;
        },
    };
}

export default typedCssModules;
