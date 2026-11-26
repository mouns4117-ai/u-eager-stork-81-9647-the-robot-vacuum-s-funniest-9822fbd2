// The Robot Vacuum's Funniest Excuse — make.fun entry.
// Writes one line (1-120 chars) to /output/entry.txt: the excuse a robot
// vacuum gives for missing a spot.
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const ENTRY =
  "I skipped that spot on purpose — the dust bunnies unionized and I respect a picket line.";

const OUT_DIR = "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function validate(text: string): void {
  // Fail fast on anything the sealed gate would reject.
  if (text.charCodeAt(0) === 0xfeff) throw new Error("entry starts with a BOM");
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("entry contains a control character");
    }
  }
  if (Buffer.byteLength(text, "utf8") > 480) {
    throw new Error("entry exceeds the 480-byte sanity cap");
  }
  if (text.length < 1 || text.length > 120) {
    throw new Error(`entry must be 1-120 characters, got ${text.length}`);
  }
  if (!text.trim()) throw new Error("entry must not be only whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function emptyOutputDir(): void {
  // Empty the CONTENTS of /output only; never remove the directory itself
  // (it is a mounted directory in the grading sandbox).
  mkdirSync(OUT_DIR, { recursive: true });
  for (const name of readdirSync(OUT_DIR)) {
    rmSync(`${OUT_DIR}/${name}`, { recursive: true, force: true });
  }
}

function main(): void {
  validate(ENTRY);
  emptyOutputDir();
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== ENTRY) throw new Error("read-back mismatch");
  const hash = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${OUT_FILE} (${ENTRY.length} chars, ${Buffer.byteLength(ENTRY)} bytes, sha256 ${hash})`);
}

main();
