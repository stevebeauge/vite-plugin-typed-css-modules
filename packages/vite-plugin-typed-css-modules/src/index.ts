import { transform } from "lightningcss";
import * as fs from "node:fs";
import path from "node:path";
import type { PluginOption } from "vite";

function extractClassnames(code: string, sourceFile: string): string[] | null {
    // Strips all scss comments. This may still be an invalid CSS, but we only care about class names.
    // This prevents having to preprocess scss files.
    const strippedCode = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

    const { exports } = transform({
        code: Buffer.from(strippedCode),
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
    let consumerRoot: string | undefined;
    return {
        name: "vite-plugin-css-types",
        enforce: "pre",
        configResolved(config) {
            consumerRoot = config.root;
        },
        async transform(code, id) {
            if (!consumerRoot) {
                throw new Error("consumerRoot is not set");
            }
            if (id.endsWith(".css") || id.endsWith(".scss")) {
                const exports = extractClassnames(code, id);

                if (!exports) return null;

                const target = `${id}.d.ts`;

                const definitions = generateTypeDefinitions(exports);

                await fs.promises.writeFile(target, definitions, "utf-8");

                this.info(
                    `Generated types for ${path.relative(consumerRoot, id)} at ${path.relative(consumerRoot, target)}`,
                );
            }
            return null;
        },
    };
}

export default typedCssModules;
