import { z } from "zod";

const validPhone = (value: string) =>
  /^\+?[\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ""));
export const enquirySchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name.").max(80),
    phone: z
      .string()
      .trim()
      .max(40)
      .refine(validPhone, "Please enter a valid phone number with 7–15 digits."),
    email: z.string().trim().max(254).email("Please enter a valid email address."),
    message: z.string().trim().min(1, "Please enter your message.").max(1000),
  })
  .strict();
export type Enquiry = z.infer<typeof enquirySchema>;
export const enquiryResultSchema = z.discriminatedUnion("success", [
  z.object({ success: z.literal(true), reference: z.string() }),
  z.object({ success: z.literal(false), message: z.string() }),
]);
export type EnquiryResult = z.infer<typeof enquiryResultSchema>;
export const ENQUIRY_ERROR =
  "We could not confirm that your enquiry was sent. Your details are still here. You can retry; if the first attempt arrived, retrying may send a duplicate.";
