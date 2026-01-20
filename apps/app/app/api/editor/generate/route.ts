import { currentOrganizationId } from "@repo/backend/auth/utils";
import { streamText } from "ai";
import { database } from "@/lib/database";

export const POST = async (request: Request): Promise<Response> => {
  const { prompt, option, command } = (await request.json()) as {
    prompt: string;
    option: "continue" | "fix" | "improve" | "longer" | "shorter" | "zap";
    command?: string;
  };
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const organization = await database.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!organization.stripeSubscriptionId) {
    return new Response(
      "You need to upgrade your account to use the AI Assistant.",
      {
        status: 402,
      }
    );
  }

  let system: string;

  switch (option) {
    case "continue":
      system = [
        "You are an AI writing assistant that continues existing text based on context from prior text.",
        "Give more weight/priority to the later characters than the beginning ones.",
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences.",
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    case "improve":
      system = [
        "You are an AI writing assistant that improves existing text.",
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences.",
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    case "shorter":
      system = [
        "You are an AI writing assistant that shortens existing text.",
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    case "longer":
      system = [
        "You are an AI writing assistant that lengthens existing text.",
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    case "fix":
      system = [
        "You are an AI writing assistant that fixes grammar and spelling errors in existing text.",
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences.",
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    case "zap":
      system = [
        "You are an AI writing assistant that generates text based on a prompt.",
        `You have to execute this command for the text selected by user: ${command}`,
        "Use Markdown formatting when appropriate.",
      ].join(" ");
      break;
    default:
      throw new Error("Invalid option");
  }

  const response = streamText({
    model: "openai/gpt-5-nano",
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    system,
    prompt,
  });

  return response.toUIMessageStreamResponse();
};
