import cheerio from 'cheerio';

export type ParsedBlogContent = {
  sections: { title: string; body: string }[];
  quote?: string;
  gallery: string[];
  readTime?: string;
  excerpt?: string;
  topics: string[];
};

const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

const buildExcerpt = (text: string, maxLength = 160) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  const safeTrim = lastSpace > 60 ? trimmed.slice(0, lastSpace) : trimmed;
  return `${safeTrim.trim()}...`;
};

const buildReadTime = (text: string) => {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  if (!words) return '';
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

export const parseBlogHtml = (html: string): ParsedBlogContent => {
  const $ = cheerio.load(html || '');
  const fullText = normalizeText($.text());

  const headings = $('h1, h2, h3').toArray();
  const sections =
    headings.length > 0
      ? headings
          .map((heading, index) => {
            const title = normalizeText($(heading).text()) || `Section ${index + 1}`;
            const bodyParts: string[] = [];
            let cursor = $(heading).next();

            while (cursor.length && !cursor.is('h1, h2, h3')) {
              if (cursor.is('p, li, blockquote')) {
                const text = normalizeText(cursor.text());
                if (text) bodyParts.push(text);
              }
              cursor = cursor.next();
            }

            return {
              title,
              body: bodyParts.join('\n\n').trim(),
            };
          })
          .filter((section) => section.title || section.body)
      : fullText
        ? [
            {
              title: 'Overview',
              body: fullText,
            },
          ]
        : [];

  const quote = normalizeText($('blockquote').first().text());
  const gallery = Array.from(
    new Set(
      $('img')
        .map((_index, image) => $(image).attr('src') || '')
        .get()
        .filter(Boolean)
    )
  );
  const topics = Array.from(new Set(fullText.match(/#\w+/g) || []));

  return {
    sections,
    quote: quote || undefined,
    gallery,
    readTime: buildReadTime(fullText) || undefined,
    excerpt: buildExcerpt(fullText) || undefined,
    topics,
  };
};
