import { describe, expect, it } from "vitest";
import { showChatForCountry } from "../lib/chat-region";

describe("chat interface visibility", () => {
  it("hides the interface in the UK and EU, including EU overseas territories", () => {
    for (const country of ["GB", "IE", "FR", "DE", "ES", "PT", "CY", "MT"]) {
      expect(showChatForCountry(country)).toBe(false);
    }
  });

  it("shows the interface elsewhere and hides it when the lookup is unknown", () => {
    for (const country of ["US", "CA", "MX", "BR", "CO", "KR", "JP"]) {
      expect(showChatForCountry(country)).toBe(true);
    }
    for (const country of [null, undefined, "", "zz", "USA"]) {
      expect(showChatForCountry(country)).toBe(false);
    }
  });
});
