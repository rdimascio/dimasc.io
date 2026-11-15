import { describe, expect, it } from "bun:test";

import { inlineStylesheet } from "../src/inline-css";

const CSS = '@font-face{font-family:"Instrument Serif Fallback";size-adjust:88.7%}body{color:red}';

describe("inlineStylesheet", () => {
  it("swaps the stylesheet link for an inline style block", () => {
    const html = '<head><link rel="stylesheet" href="/styles.css"/></head><body></body>';
    const out = inlineStylesheet(html, CSS);
    expect(out).not.toContain('href="/styles.css"');
    expect(out).toContain(`<style>${CSS}</style>`);
    expect(out).toContain("Instrument Serif Fallback");
  });

  it("leaves pages with no stylesheet link alone", () => {
    const html = "<head></head><body>hi</body>";
    expect(inlineStylesheet(html, CSS)).toBe(html);
  });

  it("cannot be broken out of by a closing style tag in the css", () => {
    const out = inlineStylesheet('<link rel="stylesheet" href="/styles.css"/>', "a{}</style><script>x</script>");
    expect(out.match(/<\/style>/g)?.length).toBe(1);
    expect(out.endsWith("</style>")).toBe(true);
  });

  it("keeps $ patterns in the css as written", () => {
    const css = 'a::after{content:"$&"}';
    expect(inlineStylesheet('<link rel="stylesheet" href="/styles.css"/>', css)).toBe(`<style>${css}</style>`);
  });
});
