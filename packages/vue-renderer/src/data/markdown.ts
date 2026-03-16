

import MarkdownIt from 'markdown-it';

class MarkdownRenderer {
  private originalClassMap = new Map<string, any>();

  private markdownIt = new MarkdownIt({
    highlight: (str, lang) => {
      if (lang === 'html') {
        const iframe = document.createElement('iframe');
        iframe.classList.add('html-view');
        iframe.srcdoc = str;
        iframe.sandbox.add('');
        return iframe.outerHTML;
      }
      return str;
    },
  });

  render(value: string, tagClassMap?: Record<string, string[]>): string {
    if (tagClassMap) {
      this.applyTagClassMap(tagClassMap);
    }
    const htmlString = this.markdownIt.render(value);
    this.unapplyTagClassMap();
    return htmlString;
  }

  private applyTagClassMap(tagClassMap: Record<string, string[]>) {
    Object.entries(tagClassMap).forEach(([tag, classes]) => {
      let tokenName: string | undefined;
      switch (tag) {
        case 'p':
          tokenName = 'paragraph';
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          tokenName = 'heading';
          break;
        case 'ul':
          tokenName = 'bullet_list';
          break;
        case 'ol':
          tokenName = 'ordered_list';
          break;
        case 'li':
          tokenName = 'list_item';
          break;
        case 'a':
          tokenName = 'link';
          break;
        case 'strong':
          tokenName = 'strong';
          break;
        case 'em':
          tokenName = 'em';
          break;
      }

      if (!tokenName) {
        return;
      }

      const key = `${tokenName}_open`;
      if(this.originalClassMap.has(key)){
        return;
      }

      const original = this.markdownIt.renderer.rules[key];
      this.originalClassMap.set(key, original);

      this.markdownIt.renderer.rules[key] = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        for (const clazz of classes) {
          token.attrJoin('class', clazz);
        }

        if (original) {
          return original.call(this, tokens, idx, options, env, self);
        } else {
          return self.renderToken(tokens, idx, options);
        }
      };
    });
  }

  private unapplyTagClassMap() {
    this.originalClassMap.forEach((original, key) => {
      if (original) {
        this.markdownIt.renderer.rules[key] = original;
      } else {
        delete this.markdownIt.renderer.rules[key];
      }
    });
    this.originalClassMap.clear();
  }
}

let markdownRenderer: MarkdownRenderer | null = null;

export function useMarkdownRenderer(): MarkdownRenderer {
  if (!markdownRenderer) {
    markdownRenderer = new MarkdownRenderer();
  }
  return markdownRenderer;
}
