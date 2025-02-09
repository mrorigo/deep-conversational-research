import https from "https";
import http from "http"; // Required if you need to handle http URLs as well
import { URL } from "url";
import { JSDOM } from "jsdom";

interface SearchResult {
  title: string;
  href: string;
  body: string;
}

interface DDGSParams {
  headers?: Record<string, string>;
  proxy?: string;
  timeout?: number;
  verify?: boolean;
}

const defaultHeaders = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive",
  "Sec-Ch-Ua":
    '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Referer: "https://lite.duckduckgo.com/",
  Origin: "https://lite.duckduckgo.com",
  "Content-Type": "application/x-www-form-urlencoded",
};

class DuckDuckGoSearch {
  private headers: Record<string, string>;
  private proxy: string | undefined;
  private timeout: number;
  private verify: boolean;
  private sleepTimestamp: number;

  constructor(params: DDGSParams = {}) {
    this.headers = { ...defaultHeaders, ...params.headers };
    this.proxy = params.proxy;
    this.timeout = params.timeout || 10;
    this.verify = params.verify !== false;
    this.sleepTimestamp = 0.0;
  }

  private async _sleep(sleeptime: number = 0.75): Promise<void> {
    const delay = !this.sleepTimestamp
      ? 0.0
      : Date.now() / 1000 - this.sleepTimestamp >= 20
        ? 0.0
        : sleeptime;
    this.sleepTimestamp = Date.now() / 1000;
    await new Promise((resolve) => setTimeout(resolve, delay * 1000));
  }

  private async _get_url(
    method: string,
    urlStr: string,
    params?: Record<string, string>,
    data?: Record<string, string>,
  ): Promise<string> {
    await this._sleep();

    const url = new URL(urlStr);
    const protocol = url.protocol === "https:" ? https : http;
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: this.headers,
    };

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          if (
            res.statusCode &&
            (res.statusCode < 200 || res.statusCode >= 300)
          ) {
            reject(new Error(`HTTP error! Status: ${res.statusCode}`));
            return;
          }
          resolve(body);
        });
      });

      req.on("error", (error) => {
        console.error("Error during _get_url:", error);
        reject(error);
      });

      if (data) {
        req.write(new URLSearchParams(data).toString());
      }

      req.end();
    });
  }

  private _extract_vqd(html: string, keywords: string): string {
    const vqdRegex = /vqd=['"]?([^'"]+)['"]?/;
    const match = html.match(vqdRegex);
    if (match && match[1]) {
      return match[1];
    }
    throw new Error(`Could not extract vqd for keywords: ${keywords}`);
  }

  private _normalize(rawHtml: string): string {
    if (!rawHtml) {
      return "";
    }
    const strippedHtml = rawHtml.replace(/<[^>]*>/g, "");
    return this._unescapeHtml(strippedHtml);
  }

  private _normalize_url(url: string): string {
    if (!url) {
      return "";
    }
    return decodeURIComponent(url).replace(/ /g, "+");
  }

  private _unescapeHtml(safe: string) {
    return safe
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  async text(
    keywords: string,
    region: string = "wt-wt",
    safesearch: string = "moderate",
    timelimit: string | null = null,
    backend: string = "auto",
    max_results: number | null = null,
  ): Promise<SearchResult[]> {
    return await this._text_lite(keywords, region, timelimit, max_results);
  }

  private async _text_lite(
    keywords: string,
    region: string = "wt-wt",
    timelimit: string | null = null,
    max_results: number | null = null,
  ): Promise<SearchResult[]> {
    if (!keywords) {
      throw new Error("Keywords are mandatory.");
    }

    let payload: Record<string, string> = {
      q: keywords,
      kl: region,
      df: timelimit || "",
    };

    const cache = new Set<string>();
    const results: SearchResult[] = [];
    let s = 0; // Start parameter for pagination

    for (let i = 0; i < 5; i++) {
      payload["s"] = s.toString();
      const respContent = await this._get_url(
        "POST",
        "https://lite.duckduckgo.com/lite/",
        undefined,
        payload,
      );

      if (respContent.includes("No more results.")) {
        break;
      }

      const dom = new JSDOM(respContent);
      const elements = dom.window.document.querySelectorAll(
        "table:last-of-type tr",
      );

      if (!elements || elements.length === 0) {
        console.log("No result rows found.");
        break;
      }

      for (let j = 0; j < elements.length; j++) {
        const row = elements[j];

        const linkElement = row.querySelector("a.result-link");
        if (linkElement) {
          const href = linkElement.getAttribute("href");
          if (href && !cache.has(href)) {
            cache.add(href);
            const title = linkElement.textContent || "";

            const snippetElement =
              row.nextElementSibling?.querySelector(".result-snippet");
            const body = snippetElement ? snippetElement.textContent || "" : "";

            results.push({
              title: this._normalize(title),
              href: this._normalize_url(href),
              body: this._normalize(body),
            });

            if (max_results && results.length >= max_results) {
              return results;
            }
          }
        }
      }

      //Find the "Next Page" button
      const nextForm = dom.window.document.querySelector("form.next_form");
      if (!nextForm) {
        console.log("Next page form not found.");
        break;
      }
      const sInput = nextForm.querySelector('input[name="s"]');
      if (!sInput) {
        console.log("Next page 's' input not found.");
        break;
      }
      const next_s = sInput.getAttribute("value");

      if (!next_s) {
        console.log("Next page 's' value not found.");
        break;
      }
      s = parseInt(next_s, 10);
      if (isNaN(s)) {
        console.log("Could not parse next 's' value.");
        break;
      }
    }

    return results;
  }
}

export default DuckDuckGoSearch;
