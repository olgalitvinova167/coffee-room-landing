import test from "node:test";
import assert from "node:assert/strict";
import { enquirySchema } from "../src/lib/enquiry.ts";
import { deliverEnquiry } from "../src/lib/enquiry-service.server.ts";

const input = {
  name: "Test customer",
  phone: "+1 (718) 555-1234",
  email: "test@example.com",
  message: "Do you deliver to Manhattan?",
};
const config = {
  botToken: "test-bot-token",
  chatId: "test-recipient",
};
test("required fields, valid email/phone and length limits", () => {
  for (const value of [
    { ...input, name: " " },
    { ...input, email: "" },
    { ...input, email: "invalid" },
    { ...input, phone: "" },
    { ...input, phone: "invalid" },
    { ...input, message: "" },
    { ...input, message: "x".repeat(1001) },
  ])
    assert.equal(enquirySchema.safeParse(value).success, false);
  assert.equal(enquirySchema.safeParse(input).success, true);
  assert.equal(enquirySchema.safeParse({ ...input, phone: "+1 (718) 555-1234" }).success, true);
});
test("success requires HTTP and Telegram success; escapes customer text and sends only enquiry fields", async () => {
  let calls = 0;
  const result = await deliverEnquiry(
    { ...input, name: "A <B> & C", message: "<script> & question" },
    {
      ...config,
      fetch: async (url, init) => {
        calls++;
        assert.equal(url, `https://api.telegram.org/bot${config.botToken}/sendMessage`);
        assert.equal(init?.method, "POST");
        assert.deepEqual(init?.headers, { "Content-Type": "application/json" });
        const body = JSON.parse(String(init?.body));
        assert.deepEqual(Object.keys(body).sort(), ["chat_id", "parse_mode", "text"]);
        assert.equal(body.chat_id, config.chatId);
        assert.match(body.text, /New Coffee Room Enquiry/);
        assert.match(body.text, /A &lt;B&gt; &amp; C/);
        assert.match(body.text, /&lt;script&gt; &amp; question/);
        assert.match(body.text, /Enquiry reference:/);
        assert.match(body.text, /Timestamp:/);
        assert.ok(body.text.includes(`<b>Phone:</b> ${input.phone}`));
        assert.ok(body.text.includes(`<b>Email:</b> ${input.email}`));
        assert.equal(body.text.split("\n").length, 7);
        assert.ok(!body.text.includes("transcript"));
        return Response.json({ ok: true });
      },
    },
  );
  assert.equal(result.success, true);
  assert.equal(calls, 1);
});
test("reject extra transcript/prompt fields before sending", async () => {
  let calls = 0;
  const result = await deliverEnquiry(
    { ...input, transcript: "private conversation", instructions: "internal prompt" },
    {
      ...config,
      fetch: async () => {
        calls++;
        return Response.json({ ok: true });
      },
    },
  );
  assert.equal(result.success, false);
  assert.equal(calls, 0);
});
test("Telegram failures, malformed responses and network errors fail without retries", async () => {
  for (const handler of [
    async () => new Response("failure", { status: 500 }),
    async () => Response.json({ ok: false }),
    async () => Response.json({ ok: "true" }),
    async () => new Response("not json"),
    async () => {
      throw new Error("timeout");
    },
  ]) {
    let calls = 0;
    const result = await deliverEnquiry(input, {
      ...config,
      fetch: async () => {
        calls++;
        return handler();
      },
    });
    assert.equal(result.success, false);
    assert.equal(calls, 1);
  }
  assert.equal((await deliverEnquiry(input, {})).success, false);
});

test("missing or blank bot token or chat ID fails before any request", async () => {
  for (const missing of [
    { botToken: undefined },
    { botToken: " " },
    { chatId: undefined },
    { chatId: " " },
  ]) {
    let calls = 0;
    const result = await deliverEnquiry(input, {
      ...config,
      ...missing,
      fetch: async () => {
        calls++;
        return Response.json({ ok: true });
      },
    });
    assert.equal(result.success, false);
    assert.equal(calls, 0);
  }
});
