import { transform } from "lightningcss";
import * as fs from "node:fs";
import path from "node:path";
import sass from "sass-embedded";
import type { PluginOption } from "vite";

interface ExtractClassnamesOptions {
    preprocessor?: "scss";
}

async function extractClassnames(
    code: string,
    sourceFile: string,
    options: ExtractClassnamesOptions = {},
): Promise<string[] | null> {
    let processedCode: string;

    if (options.preprocessor === "scss") {
        processedCode = sass.compile(sourceFile).css.toString();
    } else {
        processedCode = code;
    }

    const { exports } = transform({
        code: Buffer.from(processedCode),
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
            if (!id.startsWith(consumerRoot) || id.includes("node_modules")) {
                return null;
            }
            if (id.endsWith(".css") || id.endsWith(".scss")) {
                const preprocessor = id.endsWith(".scss") ? "scss" : undefined;
                const exports = await extractClassnames(code, id, { preprocessor });

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
