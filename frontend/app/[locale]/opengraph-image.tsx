import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { isLocale } from "@/i18n/config";

/*
 * The picture shown when a link to the site is shared (WhatsApp, Instagram,
 * Facebook, iMessage…): the Yllka logo on the brand's sand colour.
 */

export const alt = "Yllka — Hair & Makeup";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const taglines = { sq: "Flokë & Make-up", en: "Hair & Makeup" };
const footers = { sq: "Rezervoni terminin online", en: "Book your appointment online" };

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "sq";
  const logo = await readFile(join(process.cwd(), "public/brand/yllka-logo.png"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#eaddca",
          color: "#111111",
        }}
      >
        <img src={`data:image/png;base64,${logo.toString("base64")}`} alt="" width={520} style={{ objectFit: "contain" }} />
        <div style={{ marginTop: 36, fontSize: 30, letterSpacing: 12, textTransform: "uppercase" }}>
          {taglines[locale]}
        </div>
        <div style={{ position: "absolute", bottom: 48, width: 64, height: 1, background: "#111111" }} />
        <div style={{ position: "absolute", bottom: 64, fontSize: 22, letterSpacing: 4, color: "#5f574e" }}>
          {footers[locale]}
        </div>
      </div>
    ),
    size,
  );
}
