import axios from "axios";

type LLMResponse = {
  commentary: string;
  timestamp: number;
  source: string;
};

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class LLMService {
  private static instance: LLMService;
  private apiKey: string;

  private constructor() {
    this.apiKey = OPENAI_API_KEY || "";
    if (!this.apiKey) {
      console.warn("OpenAI API key is not set. Please check your .env file.");
    }
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  async analyzeImage(imageBase64: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not set");
    }

    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error("Invalid base64 image data");
    }

    try {
      // Clean and prepare the base64 data
      let cleanedBase64 = imageBase64;
      if (imageBase64.includes("base64,")) {
        cleanedBase64 = imageBase64.split("base64,")[1];
      }
      cleanedBase64 = cleanedBase64
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/\s/g, "");

      // Determine the correct prefix
      let prefix = "data:image/jpeg;base64,";
      if (cleanedBase64.startsWith("iVBOR")) {
        prefix = "data:image/png;base64,";
      }
      const dataUrl = `${prefix}${cleanedBase64}`;

      console.log("[LLMService] Sending image to OpenAI...");
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You're experiencing what I'm seeing. Describe or comment on this moment from your point of view.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: dataUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[LLMService] Received response from OpenAI");
      return {
        commentary: response.data.choices[0].message.content,
        timestamp: Date.now(),
        source: "OpenAI",
      };
    } catch (error: any) {
      console.error("[LLMService] Error analyzing image:", error.message);
      if (error.response) {
        console.error("[LLMService] Error response:", error.response.data);
      }
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }

  async analyzeVideo(videoUri: string): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not set");
    }

    const formData = new FormData();
    formData.append("file", {
      uri: videoUri,
      name: "video.mp4",
      type: "video/mp4",
    } as any);
    formData.append("model", "gpt-4o");
    formData.append(
      "prompt",
      "You are experiencing this video. Please describe what you see and what you understand from it."
    );

    try {
      console.log("[LLMService] Uploading video to LLM...");
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Video analysis failed: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      console.log("[LLMService] Video upload complete. Awaiting response...");
      const data = await response.json();
      console.log("[LLMService] LLM response:", data);
      return {
        commentary: data.choices?.[0]?.message?.content || "",
        timestamp: Date.now(),
        source: "OpenAI",
      };
    } catch (error: any) {
      console.error("[LLMService] Error analyzing video:", error.message);
      throw new Error(`Failed to analyze video: ${error.message}`);
    }
  }

  async analyzeVideoFrames(imageBase64Array: string[]): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not set");
    }

    if (!Array.isArray(imageBase64Array) || imageBase64Array.length === 0) {
      throw new Error("No frames provided for video analysis");
    }

    try {
      const contentArr = [
        {
          type: "text",
          text: "Here are several frames from a video. Please summarize what is happening in this sequence.",
        },
        ...imageBase64Array.map((imageBase64) => {
          let cleanedBase64 = imageBase64;
          if (imageBase64.includes("base64,")) {
            cleanedBase64 = imageBase64.split("base64,")[1];
          }
          cleanedBase64 = cleanedBase64
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\s/g, "");

          let prefix = "data:image/jpeg;base64,";
          if (cleanedBase64.startsWith("iVBOR")) {
            prefix = "data:image/png;base64,";
          }
          const dataUrl = `${prefix}${cleanedBase64}`;
          return {
            type: "image_url",
            image_url: { url: dataUrl },
          };
        }),
      ];

      console.log("[LLMService] Sending video frames to OpenAI...");
      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: contentArr,
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[LLMService] Received response from OpenAI");
      return {
        commentary: response.data.choices[0].message.content,
        timestamp: Date.now(),
        source: "OpenAI",
      };
    } catch (error: any) {
      console.error(
        "[LLMService] Error analyzing video frames:",
        error.message
      );
      if (error.response) {
        console.error("[LLMService] Error response:", error.response.data);
      }
      throw new Error(`Failed to analyze video frames: ${error.message}`);
    }
  }
}
