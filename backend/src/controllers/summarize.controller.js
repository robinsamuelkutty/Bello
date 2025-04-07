import dotenv from "dotenv";

dotenv.config();

export const summarizeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

   
    const sentences = text.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);

    if (sentences.length === 0) {
      return res.status(400).json({ error: "No valid sentences found" });
    }

  
    const summary =
      sentences.length > 3
        ? `${sentences[0]}. ${sentences[Math.floor(sentences.length / 2)]}. ${sentences[sentences.length - 1]}.`
        : sentences.join(". ") + ".";

    res.json({ summary });
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({ error: "Failed to summarize text" });
  }
};
