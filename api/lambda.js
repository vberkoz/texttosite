// index.mjs (Node.js 20.x runtime)
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event));

    // 1. **Parse the request body.**
    //    API Gateway v2 passes the POST body as a string in event.body.
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        // Handle case where body is not valid JSON
        requestBody = {};
    }

    // 2. **Access the prompts from the parsed body.**
    //    Use the parsed body (requestBody) instead of the top-level event.
    const systemPrompt = requestBody.system || "You are a helpful assistant.";
    const userPrompt = requestBody.user || "Hello!";

    const command = new ConverseCommand({
      modelId: "amazon.nova-micro-v1:0",
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: "user",
          content: [{ text: userPrompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const response = await client.send(command);

    // Extract text from the response
    const output =
      response.output?.message?.content
        ?.map((c) => c.text)
        .join(" ") || "";

    return {
      statusCode: 200,
      body: JSON.stringify({ output }),
    };
  } catch (err) {
    console.error("Error calling Bedrock:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
