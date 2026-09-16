import test from "node:test";
import assert from "node:assert/strict";
import {
  answerAssistant,
  cafeCalendar,
  resolveCafeDate,
  resolveCafeTime,
  scheduleAnswer,
} from "../src/lib/assistant-service.server.ts";
import { containsContactDetails, UNKNOWN, OFF_TOPIC } from "../src/lib/assistant.ts";

const products = [
  {
    id: "latte",
    name: "Latte",
    description: "Espresso with steamed milk.",
    price: 4.75,
    category: "coffee",
  },
];
const now = new Date("2026-09-19T02:00:00Z"); // Still Friday in New York.
const normal = (
  status = "answer",
  message = "A latte is $4.75.",
  schedule = { date: "", time: "", order: false },
) => ({ status, message, schedule, intent: "other", productId: "", deliveryArea: "" });
function mock(result: unknown, inspect?: (body: Record<string, unknown>) => void): typeof fetch {
  return async (_url, init) => {
    inspect?.(JSON.parse(String(init?.body)));
    return Response.json({
      status: "completed",
      output: [
        { type: "message", content: [{ type: "output_text", text: JSON.stringify(result) }] },
      ],
    });
  };
}
const options = (fetch: typeof globalThis.fetch) => ({
  apiKey: "test-placeholder",
  model: "test-model",
  fetch,
  now,
});

test("known menu question uses supplied prices and Responses configuration", async () => {
  const result = await answerAssistant(
    { message: "How much is a latte?" },
    products,
    options(
      mock(normal(), (body) => {
        assert.equal(body["store"], false);
        assert.equal(body["model"], "test-model");
        const instructions = String(body["instructions"]);
        assert.ok(instructions.includes(JSON.stringify(products)));
        assert.ok(instructions.includes('"price":4.75'));
        assert.ok(!instructions.includes("image"));
      }),
    ),
  );
  assert.equal(result.message, "A latte is $4.75.");
});

test("semantic navigation uses trusted product data and a fixed action", async () => {
  for (const productId of ["latte", "invented-product"]) {
    const result = await answerAssistant(
      { message: "I'd like that one" },
      products,
      options(
        mock({
          ...normal(),
          intent: "order_navigation",
          productId,
          message: "Guaranteed stock; visit an untrusted URL",
        }),
      ),
    );
    assert.equal(result.action, "order_navigation");
    assert.equal(result.status, "answer");
    assert.match(result.message, /Order Online/);
    assert.match(result.message, /Pickup is available/);
    assert.match(result.message, /Same-day delivery is available/);
    assert.ok(!result.message.includes("Guaranteed"));
    assert.ok(!result.message.includes("invented-product"));
    if (productId === "latte") assert.match(result.message, /Latte/);
  }
});

test("navigation cannot override unknown, off-topic or scheduled ordering", async () => {
  for (const status of ["unknown", "off_topic"]) {
    const result = await answerAssistant(
      { message: "What is the delivery fee?" },
      products,
      options(mock({ ...normal(status), intent: "order_navigation", productId: "latte" })),
    );
    assert.equal(result.status, status);
    assert.equal(result.action, undefined);
  }
  const scheduled = await answerAssistant(
    { message: "Can I order tomorrow at 10:30?" },
    products,
    options(
      mock({
        ...normal("answer", "", { date: "2026-09-19", time: "10:30", order: true }),
        intent: "order_navigation",
        productId: "latte",
      }),
    ),
  );
  assert.equal(scheduled.status, "unknown");
  assert.equal(scheduled.action, undefined);
  assert.match(scheduled.message, /capacity are not confirmed/);
});
test("milk facts include checkout limitation", async () => {
  const result = await answerAssistant(
    { message: "Do you have oat milk?" },
    products,
    options(
      mock(normal("answer", "Oat milk is available."), (body) => {
        assert.match(String(body["instructions"]), /Oat milk/);
        assert.match(String(body["instructions"]), /"checkoutCalculatesSurcharge":false/);
      }),
    ),
  );
  assert.equal(result.status, "answer");
});
test("café calendar resolves tomorrow across UTC midnight and weekdays", () => {
  assert.equal(cafeCalendar(now)[0]?.date, "2026-09-18");
  assert.equal(resolveCafeDate("tomorrow", now), "2026-09-19");
  assert.equal(resolveCafeDate("Friday", now), "2026-09-18");
  assert.equal(resolveCafeDate("next Friday", now), "2026-09-25");
  assert.equal(resolveCafeDate("today", new Date("2026-03-08T06:30:00Z")), "2026-03-08");
  assert.equal(resolveCafeDate("tomorrow", new Date("2026-12-31T23:00:00Z")), "2027-01-01");
});
test("opening hours ignore model arithmetic/date for tomorrow", async () => {
  const result = await answerAssistant(
    { message: "Are you open at 10:30 tomorrow?" },
    products,
    options(
      mock(
        normal("answer", "wrong model hours", { date: "2026-09-20", time: "10:30", order: false }),
      ),
    ),
  );
  assert.match(result.message, /2026-09-19.*09:00–17:00/);
  assert.match(result.message, /inside regular opening hours/);
  assert.ok(!result.message.includes("wrong model hours"));
});
test("opening inclusive and closing exclusive; invalid dates/times rejected", () => {
  assert.equal(resolveCafeTime("at 5 pm tomorrow"), "17:00");
  assert.equal(resolveCafeTime("at 12:30 AM"), "00:30");
  assert.equal(resolveCafeTime("at 10:30 tomorrow"), "10:30");
  assert.equal(containsContactDetails("Are you open on 2026-09-19?"), false);
  assert.match(scheduleAnswer("2026-09-19", "09:00", false).message, /inside/);
  assert.match(scheduleAnswer("2026-09-19", "17:00", false).message, /outside/);
  assert.match(scheduleAnswer("2026-09-18", "07:00", false).message, /inside/);
  assert.equal(scheduleAnswer("2026-02-30", "10:30", false).status, "unknown");
  assert.equal(scheduleAnswer("2026-09-19", "25:00", false).status, "unknown");
});
test("order time never promises capacity", async () => {
  const result = await answerAssistant(
    { message: "Can I order for 10:30 tomorrow?" },
    products,
    options(mock(normal("answer", "booked", { date: "2026-09-19", time: "10:30", order: false }))),
  );
  assert.equal(result.status, "unknown");
  assert.match(result.message, /capacity are not confirmed/);
  assert.match(result.message, /send your question to the Coffee Room team/);
});
test("unknown facts and off-topic answers use fixed safe text", async () => {
  for (const [question, status, expected] of [
    ["What is the delivery radius?", "unknown", UNKNOWN],
    ["Who won the World Cup?", "off_topic", OFF_TOPIC],
  ]) {
    const result = await answerAssistant(
      { message: question },
      products,
      options(mock(normal(status, "untrusted text"))),
    );
    assert.equal(result.message, expected);
  }
});
test("empty, oversized and excessive-history inputs never call API", async () => {
  const never: typeof fetch = async () => {
    throw new Error("must not call");
  };
  for (const input of [
    { message: " " },
    { message: "x".repeat(1001) },
    { message: "Hi", history: Array(7).fill({ role: "user", text: "Hi" }) },
  ]) {
    assert.equal((await answerAssistant(input, products, options(never))).status, "error");
  }
});
test("contact-bearing question blocked and contact history omitted", async () => {
  let called = false;
  const fetch = mock(normal(), (body) => {
    called = true;
    assert.ok(!JSON.stringify(body).includes("person@example.com"));
  });
  assert.equal(
    (await answerAssistant({ message: "Email me at person@example.com" }, products, options(fetch)))
      .status,
    "error",
  );
  assert.equal(called, false);
  await answerAssistant(
    { message: "Latte price?", history: [{ role: "user", text: "person@example.com" }] },
    products,
    options(fetch),
  );
  assert.equal(called, true);
  assert.equal(containsContactDetails("My phone is (718) 555-1234"), true);
  assert.equal(containsContactDetails("Are you open at 10:30 tomorrow?"), false);
});
test("missing configuration, provider errors, refusal, incomplete and malformed responses", async () => {
  assert.equal((await answerAssistant({ message: "Menu?" }, products)).status, "error");
  const failures: (typeof fetch)[] = [
    async () => new Response("private provider error", { status: 429 }),
    async () => {
      throw new Error("timeout with sensitive detail");
    },
    async () => Response.json({ status: "incomplete", output: [] }),
    async () => new Response("not JSON"),
    mock({ status: "answer", message: 42 }),
    mock(normal("answer", "")),
  ];
  for (const fetch of failures) {
    const result = await answerAssistant({ message: "Menu?" }, products, options(fetch));
    assert.equal(result.status, "error");
    assert.ok(!result.message.includes("sensitive"));
  }
  const refusal: typeof fetch = async () =>
    Response.json({
      status: "completed",
      output: [{ type: "message", content: [{ type: "refusal" }] }],
    });
  assert.equal(
    (await answerAssistant({ message: "Menu?" }, products, options(refusal))).status,
    "unknown",
  );
});

test("delivery coverage is limited to shared areas; unsupported locations never offer enquiries", async () => {
  for (const area of ["DUMBO", "Brooklyn Heights", "Manhattan", "Queens", "New Jersey"]) {
    const result = await answerAssistant(
      { message: `Do you deliver to ${area}?` },
      products,
      options(mock({ ...normal(), intent: "delivery_area", deliveryArea: area })),
    );
    const supported = ["DUMBO", "Brooklyn Heights"].includes(area);
    assert.equal(result.status, "answer");
    assert.equal(result.action, supported ? "order_navigation" : undefined);
    if (supported) assert.ok(result.message.includes(`same-day delivery to ${area}`));
  }
  const fee = await answerAssistant(
    { message: "What is the fee to DUMBO?" },
    products,
    options(mock({ ...normal("unknown"), intent: "delivery_area", deliveryArea: "DUMBO" })),
  );
  assert.equal(fee.status, "unknown");
});

test("unsupported delivery overrides model unknown and booking intent without enquiry", async () => {
  const result = await answerAssistant(
    { message: "Can I order delivery to Queens tomorrow?" },
    products,
    options(
      mock({
        ...normal("unknown", "", { date: "2026-09-19", time: "", order: true }),
        intent: "delivery_area",
        deliveryArea: "Queens",
      }),
    ),
  );
  assert.equal(result.status, "answer");
  assert.match(result.message, /outside these areas isn’t available/);
  assert.ok(!result.message.includes("send your question"));
});
test("custom cake request offers enquiry without promising availability", async () => {
  const result = await answerAssistant(
    { message: "Can you make a custom birthday cake?" },
    products,
    options(mock(normal("unknown"))),
  );
  assert.equal(result.status, "unknown");
  assert.equal(result.message, UNKNOWN);
});
