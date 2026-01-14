/**
 * Glaze Advanced Scrubber v1.6
 * Robust multi-pattern detection without lastIndex side effects.
 */

export class GlazeScrubber {
  private patterns: Record<string, RegExp> = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    openai_key: /sk-[a-zA-Z0-9]{48}/g,
    aws_key: /AKIA[0-9A-Z]{16}/g,
    credit_card: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
    iban: /[A-Z]{2}\d{2}[A-Z0-9]{11,30}/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g
  };

  scrub(text: string): { cleanText: string; foundLeaks: string[] } {
    let cleanText = text;
    const foundLeaks: string[] = [];

    for (const [type, pattern] of Object.entries(this.patterns)) {
      // Check if any match exists without moving the pointer
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        foundLeaks.push(type);
        // Standardize: Replace all occurrences
        cleanText = cleanText.replace(pattern, `[REDACTED_${type.toUpperCase()}]`);
      }
    }

    return { cleanText: cleanText, foundLeaks: foundLeaks };
  }
}