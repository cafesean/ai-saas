import { ChunkingStrategies } from "@/constants/knowledgeBase";

export interface ChunkMetadata {
  chunkIndex: number;
  startChar: number;
  endChar: number;
  chunkingStrategy: string;
  pageNumber?: number;
  section?: string;
}

export interface TextChunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkingOptions {
  strategy: string;
  chunkSize: number;
  chunkOverlap: number;
}

export class ChunkingService {
  static async chunkText(text: string, options: ChunkingOptions): Promise<TextChunk[]> {
    switch (options.strategy) {
      case ChunkingStrategies.FIXED_LENGTH:
        return this.fixedLengthChunking(text, options);
      case ChunkingStrategies.SEMANTIC:
        return this.semanticChunking(text, options);
      case ChunkingStrategies.SENTENCE:
        return this.sentenceChunking(text, options);
      case ChunkingStrategies.PARAGRAPH:
        return this.paragraphChunking(text, options);
      default:
        return this.fixedLengthChunking(text, options);
    }
  }

  /**
   * Fixed-length chunking with character overlap
   */
  private static fixedLengthChunking(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, chunkOverlap } = options;
    const chunks: TextChunk[] = [];
    let chunkIndex = 0;

    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      const endIndex = Math.min(i + chunkSize, text.length);
      const content = text.slice(i, endIndex).trim();

      if (content.length > 0) {
        chunks.push({
          content,
          metadata: {
            chunkIndex,
            startChar: i,
            endChar: endIndex,
            chunkingStrategy: ChunkingStrategies.FIXED_LENGTH,
          },
        });
        chunkIndex++;
      }

      // Break if we've reached the end
      if (endIndex >= text.length) break;
    }

    return chunks;
  }

  /**
   * Semantic chunking based on content similarity and meaning
   */
  private static semanticChunking(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, chunkOverlap } = options;
    const chunks: TextChunk[] = [];
    
    // Split by paragraphs first as semantic boundaries
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    let currentChunk = "";
    let chunkStartChar = 0;
    let chunkIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      const potentialChunk = currentChunk + (currentChunk ? "\n\n" : "") + paragraph;

      // If adding this paragraph would exceed chunk size, finalize current chunk
      if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            chunkIndex,
            startChar: chunkStartChar,
            endChar: chunkStartChar + currentChunk.length,
            chunkingStrategy: ChunkingStrategies.SEMANTIC,
          },
        });

        chunkIndex++;
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
        currentChunk = overlapText + (overlapText ? "\n\n" : "") + paragraph;
        chunkStartChar = chunkStartChar + currentChunk.length - overlapText.length - paragraph.length;
      } else {
        currentChunk = potentialChunk;
        if (i === 0) {
          chunkStartChar = text.indexOf(paragraph);
        }
      }
    }

    // Add the final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          chunkIndex,
          startChar: chunkStartChar,
          endChar: chunkStartChar + currentChunk.length,
          chunkingStrategy: ChunkingStrategies.SEMANTIC,
        },
      });
    }

    return chunks;
  }

  /**
   * Sentence-based chunking
   */
  private static sentenceChunking(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, chunkOverlap } = options;
    const chunks: TextChunk[] = [];
    
    // Split by sentences using a more sophisticated regex
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    let currentChunk = "";
    let chunkStartChar = 0;
    let chunkIndex = 0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const potentialChunk = currentChunk + (currentChunk ? " " : "") + sentence;

      if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            chunkIndex,
            startChar: chunkStartChar,
            endChar: chunkStartChar + currentChunk.length,
            chunkingStrategy: ChunkingStrategies.SENTENCE,
          },
        });

        chunkIndex++;
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
        currentChunk = overlapText + (overlapText ? " " : "") + sentence;
        chunkStartChar = chunkStartChar + currentChunk.length - overlapText.length - sentence.length;
      } else {
        currentChunk = potentialChunk;
        if (i === 0) {
          chunkStartChar = text.indexOf(sentence);
        }
      }
    }

    // Add the final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          chunkIndex,
          startChar: chunkStartChar,
          endChar: chunkStartChar + currentChunk.length,
          chunkingStrategy: ChunkingStrategies.SENTENCE,
        },
      });
    }

    return chunks;
  }

  /**
   * Paragraph-based chunking
   */
  private static paragraphChunking(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, chunkOverlap } = options;
    const chunks: TextChunk[] = [];
    
    // Split by paragraphs (double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    let currentChunk = "";
    let chunkStartChar = 0;
    let chunkIndex = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      const potentialChunk = currentChunk + (currentChunk ? "\n\n" : "") + paragraph;

      // If this paragraph alone exceeds chunk size, split it
      if (paragraph.length > chunkSize) {
        // First, add current chunk if it exists
        if (currentChunk.trim().length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: {
              chunkIndex,
              startChar: chunkStartChar,
              endChar: chunkStartChar + currentChunk.length,
              chunkingStrategy: ChunkingStrategies.PARAGRAPH,
            },
          });
          chunkIndex++;
        }

        // Split the large paragraph using fixed-length chunking
        const paragraphChunks = this.fixedLengthChunking(paragraph, {
          ...options,
          strategy: ChunkingStrategies.PARAGRAPH,
        });

        chunks.push(...paragraphChunks.map(chunk => ({
          ...chunk,
          metadata: {
            ...chunk.metadata,
            chunkIndex: chunkIndex++,
            chunkingStrategy: ChunkingStrategies.PARAGRAPH,
          },
        })));

        currentChunk = "";
        chunkStartChar = text.indexOf(paragraphs[i + 1] || "", chunkStartChar);
      } else if (potentialChunk.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            chunkIndex,
            startChar: chunkStartChar,
            endChar: chunkStartChar + currentChunk.length,
            chunkingStrategy: ChunkingStrategies.PARAGRAPH,
          },
        });

        chunkIndex++;
        
        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
        currentChunk = overlapText + (overlapText ? "\n\n" : "") + paragraph;
        chunkStartChar = chunkStartChar + currentChunk.length - overlapText.length - paragraph.length;
      } else {
        currentChunk = potentialChunk;
        if (i === 0) {
          chunkStartChar = text.indexOf(paragraph);
        }
      }
    }

    // Add the final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          chunkIndex,
          startChar: chunkStartChar,
          endChar: chunkStartChar + currentChunk.length,
          chunkingStrategy: ChunkingStrategies.PARAGRAPH,
        },
      });
    }

    return chunks;
  }

  /**
   * Get overlap text from the end of a chunk
   */
  private static getOverlapText(text: string, overlapSize: number): string {
    if (overlapSize <= 0 || text.length <= overlapSize) {
      return text;
    }

    // Try to break at word boundaries
    const overlapText = text.slice(-overlapSize);
    const firstSpaceIndex = overlapText.indexOf(" ");
    
    if (firstSpaceIndex > 0) {
      return overlapText.slice(firstSpaceIndex + 1);
    }
    
    return overlapText;
  }

  /**
   * Estimate the number of chunks for given text and options
   */
  static estimateChunkCount(text: string, options: ChunkingOptions): number {
    const { strategy, chunkSize, chunkOverlap } = options;
    
    switch (strategy) {
      case ChunkingStrategies.FIXED_LENGTH:
        return Math.ceil(text.length / (chunkSize - chunkOverlap));
      
      case ChunkingStrategies.SEMANTIC:
      case ChunkingStrategies.PARAGRAPH:
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const avgParagraphLength = text.length / paragraphs.length;
        return Math.ceil(avgParagraphLength > chunkSize ? 
          text.length / (chunkSize - chunkOverlap) : 
          paragraphs.length / 2);
      
      case ChunkingStrategies.SENTENCE:
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = text.length / sentences.length;
        return Math.ceil(avgSentenceLength > chunkSize ? 
          text.length / (chunkSize - chunkOverlap) : 
          sentences.length / 3);
      
      default:
        return Math.ceil(text.length / (chunkSize - chunkOverlap));
    }
  }

  /**
   * Validate chunking options
   */
  static validateOptions(options: ChunkingOptions): string[] {
    const errors: string[] = [];

    if (options.chunkSize < 100) {
      errors.push("Chunk size must be at least 100 characters");
    }

    if (options.chunkSize > 10000) {
      errors.push("Chunk size cannot exceed 10,000 characters");
    }

    if (options.chunkOverlap < 0) {
      errors.push("Chunk overlap cannot be negative");
    }

    if (options.chunkOverlap >= options.chunkSize) {
      errors.push("Chunk overlap must be less than chunk size");
    }

    if (!Object.values(ChunkingStrategies).includes(options.strategy as any)) {
      errors.push("Invalid chunking strategy");
    }

    return errors;
  }
}