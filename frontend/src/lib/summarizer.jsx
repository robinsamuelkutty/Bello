export default function summarizeText(messages, sentenceCount = 2) {
    // Ensure messages is a string before processing
    let text = "";

    if (Array.isArray(messages)) {
        text = messages.join(" ");
    } else if (typeof messages === "string") {
        text = messages;
    } else {
        console.error("Invalid messages format:", messages);
        return "Error: Unable to summarize message.";
    }

    if (!text.trim()) return "No content to summarize.";

    // Split text into sentences using improved regex
    let sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

    // Tokenize words and create a frequency map
    let wordFrequencies = {};
    let words = text.toLowerCase().match(/\b\w+\b/g);

    if (words) {
        words.forEach(word => {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
        });
    }

    // Score sentences based on word frequencies
    let sentenceScores = sentences.map(sentence => {
        let score = 0;
        let wordsInSentence = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        wordsInSentence.forEach(word => {
            score += wordFrequencies[word] || 0;
        });
        return { sentence, score };
    });

    // Sort sentences by score and select top ones
    sentenceScores.sort((a, b) => b.score - a.score);
    let summary = sentenceScores.slice(0, sentenceCount).map(s => s.sentence).join(" ");

    return summary.trim();
}
