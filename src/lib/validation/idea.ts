import { z } from "zod";

export const ideaPreviewSchema = z.string().trim().min(20, "Write at least 20 characters for the public preview.").max(5000, "Keep the public preview below 5,000 characters.");
