/**
 * GLAZE PROXY - Core Gateway v2.0
 * Clean, production-ready version for Enterprise AI Security.
 * All logs and logic in Universal English.
 */

import { GlazeScrubber } from './scrubber';

export interface Env {
  OPENAI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Utility: Clean environment variables from potential corruption or invisible characters.
 */
const sanitizeEnvVar = (str: string | undefined): string => {
  if (!str) return "";
  return str.replace(/[^\x20-\x7E]/g, "").trim();
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 2. Security: Only allow POST requests for processing
    if (request.method !== "POST") {
      return new Response("Glaze Proxy Active", { status: 200, headers: CORS_HEADERS });
    }

    try {
      // 3. Request Validation
      const bodyText = await request.text();
      if (!bodyText) throw new Error("Empty payload");

      const { prompt, platform } = JSON.parse(bodyText) as { prompt: string, platform: string };
      if (!prompt) throw new Error("Missing 'prompt' in request body");

      // 4. Scrubbing Logic
      const scrubber = new GlazeScrubber();
      const { cleanText, foundLeaks } = scrubber.scrub(prompt);

      // 5. Audit Logging (Background Task)
      const supabaseUrl = sanitizeEnvVar(env.SUPABASE_URL);
      const supabaseKey = sanitizeEnvVar(env.SUPABASE_ANON_KEY);

      if (foundLeaks.length > 0 && supabaseUrl && supabaseKey) {
        ctx.waitUntil(
          fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
            method: "POST",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              "Prefer": "return=minimal"
            },
            body: JSON.stringify(foundLeaks.map(type => ({ 
              leak_type: type,
              status: "masked",             // Action effectuée
              provider: platform || "unknown" // Provenance dynamique (ex: chatgpt.com)
            })))
          }).then(res => {
            if (!res.ok) console.error(`[Supabase Error] Status: ${res.status}`);
          }).catch(err => console.error("[Supabase Connection Error]", err.message))
        );
      }

      // 6. AI Integration (OpenAI)
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sanitizeEnvVar(env.OPENAI_API_KEY)}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: cleanText }]
        })
      });

      if (!aiResponse.ok) {
        const errorDetail = await aiResponse.text();
        throw new Error(`OpenAI API failed: ${errorDetail}`);
      }

      const aiData: any = await aiResponse.json();
      const aiAnswer = aiData.choices?.[0]?.message?.content || "No AI response generated.";

      // 7. Success Response
      return new Response(JSON.stringify({
        secured_text: cleanText,     // The redacted version ([REDACTED_IBAN])
        ai_answer: aiAnswer,        // The GPT response
        leaks_blocked: foundLeaks.length,
        status: "success"
      }), { 
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" } 
      });

    } catch (err: any) {
      console.error("[Proxy Critical Error]", err.message);
      
      return new Response(JSON.stringify({ 
        error: "Internal Server Error", 
        details: err.message 
      }), { 
        status: 500, 
        headers: CORS_HEADERS 
      });
    }
  },
};