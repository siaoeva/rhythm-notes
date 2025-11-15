export const summarizeText = (text, maxLength) => {
    if (!text) return '';

    const sentences = text.split('. ');
    let summary = '';
    let currentLength = 0;

    for (let sentence of sentences) {
        if (currentLength + sentence.length <= maxLength) {
            summary += sentence + '. ';
            currentLength += sentence.length + 2; // accounting for the period and space
        } else {
            break;
        }
    }

    return summary.trim();
};

export const extractKeywords = (text) => {
    const words = text.split(/\s+/);
    const wordFrequency = {};

    words.forEach(word => {
        word = word.toLowerCase().replace(/[.,!?;]$/, '');
        if (word) {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
    });

    const sortedKeywords = Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .map(([word]) => word);

    return sortedKeywords.slice(0, 10); // return top 10 keywords
};