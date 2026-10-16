const fs = require("fs");
const path = require("path");

const IGNORE_DIRS = ["node_modules", ".git", ".expo", ".agents", ".claude", "assets"];
const ALLOWED_EXTS = [".ts", ".tsx", ".js", ".json", ".md"];
const OUTPUT_FILE = "project_export.txt";

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkSync(filepath, filelist);
      }
    } else {
      if (ALLOWED_EXTS.includes(path.extname(file))) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
}

try {
  const files = walkSync(".");
  let output = "";
  for (const file of files) {
    if (file === OUTPUT_FILE || file === "export.js" || file.includes("package-lock.json") || file.includes("skills-lock.json")) continue;
    output += `\n================================================================================\n`;
    output += `FILE: ${file.replace(/\\/g, '/')}\n`;
    output += `================================================================================\n\n`;
    output += fs.readFileSync(file, "utf8") + "\n";
  }
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  console.log(`✅ Експорт завершено! Файли збережено у ${OUTPUT_FILE}`);
} catch (err) {
  console.error("❌ Помилка експорту:", err);
}
