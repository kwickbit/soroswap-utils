import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const checkFile = async (path: string): Promise<string[]> => {
    const content = await readFile(path, "utf8");
    const exports = content.match(/^export\s.+/gmv) ?? [];

    return exports
        .filter((exp) => !exp.includes('} from "') && !exp.includes("export type"))
        .map((exp) => {
            const precedingBlock = content.slice(0, content.indexOf(exp));
            const hasTypedoc = precedingBlock.endsWith("*/\n");

            const { length: lineNumber } = precedingBlock.split("\n");

            return hasTypedoc
                ? undefined
                : `${path}:${lineNumber} - Export missing typedoc comment`;
        })
        .filter(Boolean) as string[];
};

const checkFiles = async (): Promise<boolean> => {
    const { stdout } = await execAsync("git diff --cached --name-only");
    const files = stdout
        .split("\n")
        .filter((file) => file && file.endsWith(".ts") && file.startsWith("src/"));

    if (files.length === 0) return true;

    const fileIssues = await Promise.all(files.map(checkFile));
    const issues = fileIssues.flat();

    if (issues.length > 0) {
        console.error("Documentation issues found:", issues);

        return false;
    }

    return true;
};

process.exit((await checkFiles()) ? 0 : 1);
