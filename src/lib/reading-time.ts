export function countWordsFromText(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function computeArticleReadingTimeMinutes(
  summary?: string,
  blocks?: Array<{ type?: string; data?: any }>
): number {
  const parts: string[] = [];
  if (summary) parts.push(summary);

  if (Array.isArray(blocks)) {
    for (const block of blocks) {
      if (block?.data?.title) parts.push(String(block.data.title));
      if (block?.data?.text) parts.push(String(block.data.text));
      if (block?.data?.attribution) parts.push(String(block.data.attribution));
      if (Array.isArray(block?.data?.items)) {
        for (const item of block.data.items) {
          if (typeof item === 'string') {
            parts.push(item);
          } else if (item && (item.title || item.content)) {
            parts.push(`${item.title || ''} ${item.content || ''}`);
          }
        }
      }
    }
  }

  const wordCount = countWordsFromText(parts.join(' '));
  // Standard reading rate: ~180 words per minute
  return Math.max(1, Math.ceil(wordCount / 180));
}

export function formatReadingTime(minutes: number, locale: string): string {
  const mins = Math.max(1, Math.round(minutes));
  if (locale === 'ar') {
    if (mins === 1) return 'قراءة في دقيقة واحدة';
    if (mins === 2) return 'قراءة في دقيقتين';
    if (mins >= 3 && mins <= 10) return `قراءة في ${mins} دقائق`;
    return `قراءة في ${mins} دقيقة`;
  }
  return `${mins} min read`;
}
