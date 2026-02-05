const fs = require('fs').promises;
const path = require('path');

async function copyFileSafe(src, dest) {
	await fs.mkdir(path.dirname(dest), { recursive: true });
	await fs.copyFile(src, dest);
}

async function copyDirRecursive(srcDir, destDir) {
	await fs.mkdir(destDir, { recursive: true });
	const entries = await fs.readdir(srcDir, { withFileTypes: true });
	for (const entry of entries) {
		const srcPath = path.join(srcDir, entry.name);
		const destPath = path.join(destDir, entry.name);
		if (entry.isDirectory()) {
			await copyDirRecursive(srcPath, destPath);
		} else if (entry.isFile()) {
			await copyFileSafe(srcPath, destPath);
		}
	}
}

(async () => {
	try {
		const cwd = process.cwd();
		const targetRoot = path.resolve(cwd, 'build');
		const backendPath = path.join(cwd, 'backend');
		const frontendDistPath = path.join(cwd, 'frontend', 'dist');
		const publicDestPath = path.join(targetRoot, 'public');

		console.log('--- Starte Build-Vorbereitung ---');

		const backendEntries = [
			{ type: 'dir', name: 'src' },
			{ type: 'file', name: 'package.json' },
			{ type: 'file', name: 'bun.lock' },
			{ type: 'file', name: 'tsconfig.json' }
		];

		for (const e of backendEntries) {
			const srcPath = path.join(backendPath, e.name);
			const destPath = path.join(targetRoot, e.name);

			try {
				const stat = await fs.stat(srcPath);
				if (e.type === 'dir' && stat.isDirectory()) {
					console.log(`[Backend] Kopiere Verzeichnis: ${e.name}`);
					await copyDirRecursive(srcPath, destPath);
				} else if (e.type === 'file' && stat.isFile()) {
					console.log(`[Backend] Kopiere Datei: ${e.name}`);
					await copyFileSafe(srcPath, destPath);
				}
			} catch (err) {
				if (err.code === 'ENOENT') {
					console.warn(`[Backend] Übersprungen (nicht gefunden): ${e.name}`);
				} else {
					throw err;
				}
			}
		}

		console.log('--- Kopiere Frontend Assets ---');
		try {
			await fs.stat(frontendDistPath);

			await fs.rm(publicDestPath, { recursive: true, force: true });

			console.log(`[Frontend] Kopiere ${frontendDistPath} → ${publicDestPath}`);
			await copyDirRecursive(frontendDistPath, publicDestPath);
		} catch (err) {
			if (err.code === 'ENOENT') {
				console.warn(`[Frontend] Warnung: Dist-Ordner nicht gefunden unter ${frontendDistPath}`);
			} else {
				throw err;
			}
		}

		console.log('------------------------------------');
		console.log(`Erfolg! Build abgeschlossen in: ${targetRoot}`);
	} catch (err) {
		console.error('Kritischer Fehler während des Kopiervorgangs:', err);
		process.exit(1);
	}
})();