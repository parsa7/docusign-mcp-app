#!/usr/bin/env -S node --experimental-strip-types
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SAMPLES, type Sample } from "./sample-agreements.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "samples");
mkdirSync(OUT_DIR, { recursive: true });

function renderOne(sample: Sample): Promise<string> {
  return new Promise((resolve, reject) => {
    const path = join(OUT_DIR, sample.filename);
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      info: {
        Title: sample.title,
        Author: sample.party1,
        Subject: `Agreement between ${sample.party1} and ${sample.party2}`,
      },
    });

    const stream = createWriteStream(path);
    doc.pipe(stream);

    doc.font("Times-Bold").fontSize(14).text(sample.title, { align: "center" });
    doc.moveDown();

    doc.font("Times-Roman").fontSize(11);
    doc.text(`Effective Date: ${sample.effectiveDate}`);
    doc.text(`Parties: ${sample.party1}; ${sample.party2}`);
    doc.moveDown();

    for (const para of sample.body.split(/\n\n+/)) {
      doc.text(para.trim(), { align: "justify", paragraphGap: 6 });
    }

    doc.moveDown(2);
    doc.font("Times-Bold").text("AGREED AND ACCEPTED:");
    doc.moveDown();
    doc.font("Times-Roman");
    doc.text(`${sample.party1}`);
    doc.text("By: ____________________________________");
    doc.text("Name:");
    doc.text("Title:");
    doc.text("Date:");
    doc.moveDown();
    doc.text(`${sample.party2}`);
    doc.text("By: ____________________________________");
    doc.text("Name:");
    doc.text("Title:");
    doc.text("Date:");

    doc.end();
    stream.on("finish", () => resolve(path));
    stream.on("error", reject);
  });
}

async function main() {
  for (const sample of SAMPLES) {
    const path = await renderOne(sample);
    console.log(`wrote ${path}`);
  }
  console.log(`\n${SAMPLES.length} sample agreements written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
