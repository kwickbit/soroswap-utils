/* eslint-disable */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface FunctionInfo {
    readonly isValid: boolean;
    readonly line: number;
    readonly params: readonly string[];
    readonly typeDoc?: string;
}

interface ModuleMap {
    readonly [path: string]: { readonly [funcName: string]: FunctionInfo };
}

const parseExports = (block: string): readonly string[] => {
    const fromIndex = block.lastIndexOf("from");

    return block
        .slice(0, fromIndex)
        .replaceAll(/[{}]/gu, "")
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length > 0);
};

const getTypeDocumentBlock = (lines: readonly string[], lineNumber: number): string | undefined => {
    const commentLines: string[] = [];

    let currentLine = lineNumber - 1;

    while (currentLine >= 0 && lines[currentLine]?.trimStart().startsWith("*")) {
        commentLines.unshift(lines[currentLine]?.trim() ?? "");
        currentLine--;
    }

    if (currentLine >= 0 && lines[currentLine]?.trimStart().startsWith("/**")) {
        commentLines.unshift(lines[currentLine]?.trim() ?? "");

        return commentLines.join("\n");
    }

    return undefined;
};

const findParameters = (lines: readonly string[], lineIndex: number): readonly string[] => {
    let content = lines[lineIndex] as string;
    let nextIndex = lineIndex + 1;

    while (!content.includes(")") && nextIndex < lines.length) {
        content += lines[nextIndex];
        nextIndex++;
    }

    const parameterMatch = /\((.*?)\)/v.exec(content);

    return (
        parameterMatch?.[1]
            .split(",")
            .map((p) => p.trim().split(":")[0].trim().replace("?", ""))
            .filter((p) => p !== "") ?? []
    );
};

const validateDocumentationBlock = (
    typeDocument: string | undefined,
    parameters: readonly string[],
): boolean => {
    if (!typeDocument) return false;

    if (!typeDocument.includes("@returns")) return false;

    if (!parameters.every((parameter) => typeDocument.includes(`@param ${parameter}`))) {
        console.log("Missing @param documentation for:", parameters);
        return false;
    }

    const descriptionMatch = /\/\*\*\n\s*\*\s*([^@]*)/.exec(typeDocument);
    const description = descriptionMatch?.[1]?.trim();

    return Boolean(description && description.split(/\s+/v).length >= 6);
};

const getFunctionInfo = (lines: readonly string[], name: string): FunctionInfo | undefined => {
    const lineIndex = lines.findIndex((line) => line.includes(`const ${name} =`));

    if (lineIndex < 0) return undefined;

    const parameters = findParameters(lines, lineIndex);
    const typeDocument = getTypeDocumentBlock(lines, lineIndex);

    return {
        isValid: validateDocumentationBlock(typeDocument, parameters),
        line: lineIndex + 1,
        params: parameters,
        typeDoc: typeDocument,
    };
};

const processModule = async (
    path: string,
    functionNames: readonly string[],
): Promise<{ readonly [key: string]: FunctionInfo }> => {
    const content = await readFile(join("src", `${path}.ts`), "utf8");
    const lines = content.split("\n");

    const entries = functionNames
        .map((name): [string, FunctionInfo] | undefined => {
            const info = getFunctionInfo(lines, name);

            return info ? [name, info] : undefined;
        })
        .filter((entry): entry is [string, FunctionInfo] => entry !== undefined);

    return Object.fromEntries(entries);
};

const printResults = (moduleMap: ModuleMap): void => {
    const functionResults = Object.values(moduleMap).flatMap((module) =>
        Object.entries(module).map(([name, info]) => [name, info.isValid] as const),
    );

    const report = Object.fromEntries(functionResults);

    Object.entries(report).forEach(([name, isValid]) => {
        console.log(`${isValid ? "\u001B[32m✓" : "\u001B[31m✗"} ${name}\u001B[0m`);
    });

    process.exit(Object.values(report).every(Boolean) ? 0 : 1);
};

void (async () => {
    const content = await readFile(join("src", "index.ts"), "utf8");

    const moduleExports = Object.fromEntries(
        content
            .split("export {")
            .slice(1)
            .map((block) => {
                const fromIndex = block.lastIndexOf("from");
                const path = /"(?<path>[^"]+)"/v.exec(block.slice(fromIndex))?.groups?.path ?? "";

                return [path, parseExports(block)] as const;
            })
            .filter(([path]) => path.length > 0),
    );

    const results: ModuleMap = Object.fromEntries(
        await Promise.all(
            Object.entries(moduleExports).map(
                async ([path, names]): Promise<[string, { [key: string]: FunctionInfo }]> => [
                    path,
                    await processModule(path, names),
                ],
            ),
        ),
    );

    printResults(results);
})();
