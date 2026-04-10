// Feature 2: Content Analytics Utility
import type { ContentAnalytics } from '@/app/types';

/** Calculate Flesch Reading Ease score */
function fleschReadingEase(totalWords: number, totalSentences: number, totalSyllables: number): number {
  if (totalWords === 0 || totalSentences === 0) return 0;
  const score = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/** Approximate syllable count for a word */
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  let count = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);
  return count ? count.length : 1;
}

/** Map Flesch score to reading level label */
function getReadingLevel(score: number): string {
  if (score >= 90) return 'Very Easy (5th Grade)';
  if (score >= 80) return 'Easy (6th Grade)';
  if (score >= 70) return 'Fairly Easy (7th Grade)';
  if (score >= 60) return 'Standard (8th–9th Grade)';
  if (score >= 50) return 'Fairly Difficult (10th–12th Grade)';
  if (score >= 30) return 'Difficult (College)';
  return 'Very Difficult (Graduate)';
}

/** Extract top keywords (excluding common stop words) */
function extractKeywords(text: string, topN: number = 8): { word: string; count: number }[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'shall', 'can', 'it', 'its',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we',
    'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'our', 'their', 'not', 'no', 'so', 'if', 'as', 'up', 'out',
    'about', 'into', 'than', 'then', 'just', 'more', 'also', 'very',
  ]);

  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  const freq: Record<string, number> = {};

  for (const word of words) {
    if (!stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

/** Analyze a content string and return analytics */
export function analyzeContent(text: string): ContentAnalytics {
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const fleschScore = fleschReadingEase(wordCount, sentenceCount, totalSyllables);

  return {
    wordCount,
    charCount: text.length,
    readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    readingLevel: getReadingLevel(fleschScore),
    fleschScore,
    sentenceCount,
    avgWordsPerSentence: sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0,
    topKeywords: extractKeywords(text),
  };
}
