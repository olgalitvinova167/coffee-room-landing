import { createServerFn } from "@tanstack/react-start";
import { enquirySchema, enquiryResultSchema } from "./enquiry";

export const sendEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { deliverEnquiry } = await import("./enquiry-service.server");
    return enquiryResultSchema.parse(
      await deliverEnquiry(data, {
        botToken: process.env["TELEGRAM_ENQUIRY_BOT_TOKEN"],
        chatId: process.env["TELEGRAM_ENQUIRY_CHAT_ID"],
      }),
    );
  });
