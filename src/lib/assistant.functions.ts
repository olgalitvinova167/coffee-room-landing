import { createServerFn } from "@tanstack/react-start";
import { assistantInputSchema, assistantResultSchema } from "./assistant";

export const askCoffeeRoom = createServerFn({ method: "POST" })
  .validator((input: unknown) => assistantInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { answerAssistant } = await import("./assistant-service.server");
    const { MENU_ITEMS } = await import("../data/menu");
    const result = await answerAssistant(
      data,
      MENU_ITEMS.map(({ id, name, description, price, category }) => ({
        id,
        name,
        description,
        price,
        category,
      })),
      {
        apiKey: process.env["OPENAI_API_KEY"],
        model: process.env["OPENAI_MODEL"],
      },
    );
    return assistantResultSchema.parse(result);
  });
