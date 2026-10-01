// Runs `vitest run` for the workspace in the current directory.
//
// On Windows, Vitest loads two copies of itself when the working directory has a
// lower-case drive letter ("c:\..." instead of "C:\..."), and every suite then fails with
// "Vitest failed to find the current suite". Some shells and editors start processes that
// way, so normalise the drive letter and start Vitest from there.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());

const require = createRequire(path.join(cwd, 'package.json'));
const packageJsonPath = require.resolve('vitest/package.json');
const { bin } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const vitestBin = path.join(path.dirname(packageJsonPath), typeof bin === 'string' ? bin : bin.vitest);

const { status } = spawnSync(process.execPath, [vitestBin, 'run', ...process.argv.slice(2)], {
	cwd,
	stdio: 'inherit'
});
process.exit(status ?? 1);
