// Leonida Trophy Atlas — hand-in program (Node 22, standard library only).
// The guide itself is app/: plain static files that open at app/index.html with no build step and
// no network request. Its trophy list and guides live in app/data/trophies.json; the screenshots
// that show it off live in screenshots/. This program copies both folders beside this file into
// /output and writes /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library. vendor/makefun-frontend.ts is the kit's copy and must stay unchanged: the
// scorer rebuilds the dossier with its own copy and compares the two byte for byte.
// POST.json is not copied: the house reads it from the repository at the submitted commit.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB; app/ at most 993 files
// and directories and 48 MiB in all. The dossier text is capped at 160 KiB by the library.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
