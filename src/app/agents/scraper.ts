// Feature 1: URL Scraper Agent — fetches and extracts clean text from web pages
import { generateWithAI } from '@/app/lib/ai-client';
import { generateId } from '@/app/lib/utils';
import type { AgentMessage } from '@/app/types';

export interface ScraperResult {
  extractedContent: string;
  messages: AgentMessage[];
}

/**
 * Fetch a URL and extract its meaningful text content.
 * Uses a lightweight HTML→text approach, then optionally cleans via LLM.
 */
export async function scrapeUrl(url: string): Promise<ScraperResult> {
  const messages: AgentMessage[] = [];

  messages.push({
    id: generateId(),
    from: 'scraper',
    to: 'user',
    message: `Scraping content from: ${url}`,
    timestamp: new Date(),
    type: 'info',
  });

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ContentFactory-Scraper/1.0',
        Accept: 'text/html,application/xhtml+xml,text/plain',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    let cleanText: string;

    if (contentType.includes('text/plain')) {
      cleanText = rawText;
    } else {
      // Strip HTML tags and extract text content
      cleanText = rawText
        // Remove script and style blocks
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, ' ')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Truncate if too long (keep first 5000 chars to avoid overwhelming the LLM)
    if (cleanText.length > 5000) {
      cleanText = cleanText.substring(0, 5000) + '\n\n[Content truncated for processing]';
    }

    if (cleanText.length < 50) {
      throw new Error('Could not extract meaningful content from the URL. The page may be JavaScript-rendered.');
    }

    // Use LLM to clean and extract the main article content
    messages.push({
      id: generateId(),
      from: 'scraper',
      to: 'scraper',
      message: 'Cleaning and extracting main content from raw page text...',
      timestamp: new Date(),
      type: 'action',
    });

    const prompt = `Extract ONLY the main article/content from this raw web page text. Remove navigation, ads, sidebars, and boilerplate. Return clean, readable text preserving the original structure:\n\n${cleanText.substring(0, 4000)}`;

    const extractedContent = await generateWithAI(prompt);

    messages.push({
      id: generateId(),
      from: 'scraper',
      to: 'researcher',
      message: `Successfully extracted ${extractedContent.split(/\s+/).length} words from ${url}`,
      timestamp: new Date(),
      type: 'approval',
    });

    return { extractedContent, messages };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    messages.push({
      id: generateId(),
      from: 'scraper',
      to: 'user',
      message: `Scraping failed: ${errorMsg}`,
      timestamp: new Date(),
      type: 'rejection',
    });

    throw error;
  }
}
