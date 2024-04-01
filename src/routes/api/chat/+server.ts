import { StreamingTextResponse, type Message } from "ai";

import type { RequestHandler } from "./$types";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { GOOGLE_API_KEY } from "$env/static/private";
import { BytesOutputParser } from "@langchain/core/output_parsers";
/*
 * Before running this, you should make sure you have created a
 * Google Cloud Project that has `generativelanguage` API enabled.
 *
 * You will also need to generate an API key and set
 * an environment variable GOOGLE_API_KEY
 *
 */

// Text
const model = new ChatGoogleGenerativeAI({
	modelName: "gemini-pro",
	maxOutputTokens: 2048,
	apiKey: GOOGLE_API_KEY,
}).pipe(new BytesOutputParser());

export const POST = (async ({ request }) => {
	// Extract the `prompt` from the body of the request
	const { messages } = await request.json();
	// Convert the response into a friendly text-stream
	const stream = await model.stream(
		(messages as Message[]).map((m) =>
			m.role == "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
		)
	);
	// Respond with the stream
	return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
