import { expect, test } from "vitest";
import { leadRequest } from "./lead-request";
import { emptySettings } from "./demo-settings";
const base = {
  name: "Caffè del Porto",
  location: "https://demo.example/",
  settings: emptySettings(),
};
test("contact is in the email body, never in the shared preview", () => {
  const request = leadRequest({
    ...base,
    method: "email",
    contact: "cliente@example.com",
  });
  const params = new URL(request.href).searchParams;
  expect(params.get("body")).toContain("cliente@example.com");
  const preview = request.body.split("senza logo: ")[1];
  expect(decodeURIComponent(preview)).not.toContain("cliente@example.com");
  expect(request.href).toContain("mailto:alfredoforte.web@gmail.com?");
});
test("invalid contacts and multiline injection are rejected", () => {
  for (const contact of ["", "invalid", "a@b.com\nBcc: other@example.com"])
    expect(() => leadRequest({ ...base, method: "email", contact })).toThrow();
  expect(() =>
    leadRequest({ ...base, method: "whatsapp", contact: "123" }),
  ).toThrow();
  expect(
    leadRequest({ ...base, method: "whatsapp", contact: "+39 333 123 4567" })
      .body,
  ).toContain("WhatsApp");
});
