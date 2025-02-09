import DuckDuckGoSearch from "./research/ddgs";

async function main() {
  const ddgs = new DuckDuckGoSearch({
    // proxy: 'http://your-proxy:8080', // Optional proxy
    timeout: 15, // Optional timeout
  });

  try {
    const results = await ddgs.text(
      "OpenAI",
      "wt-wt",
      "moderate",
      null,
      "html",
      10,
    );

    if (results && results.length > 0) {
      console.log("Search Results:");
      results.forEach((result: any, index: number) => {
        console.log(`${index + 1}. Title: ${result.title}`);
        console.log(`   URL: ${result.href}`);
        console.log(`   Body: ${result.body}`);
        console.log("---");
      });
    } else {
      console.log("No results found.");
    }
  } catch (error: any) {
    console.error("An error occurred:", error.message);
  }
}

main();
