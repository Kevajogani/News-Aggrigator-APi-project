const API_KEY = "bafc7f2a383142a483ee32f5c498fe5f";
const baseURL = "https://newsapi.org/v2/";

window.addEventListener("load", () => fetchLatestNews());

let latestArticles = []; // Store articles globally

async function fetchLatestNews() {
    try {
        const res = await fetch(`${baseURL}top-headlines?country=us&language=en&category=general&apiKey=${API_KEY}`);
        const data = await res.json();
        if (data.articles) {
            latestArticles = data.articles; // Store articles globally
            bindData(data.articles);
        }
    } catch (error) {
        console.error("Error fetching latest news:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cardscontainer");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;

        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    cardClone.querySelector("#news-img").src = article.urlToImage;
    cardClone.querySelector("#news-title").innerText = article.title;
    //cardClone.querySelector("#news-desc").innerText = article.description || "No description available";

    const summarizeBtn = cardClone.querySelector(".summary-btn");
    summarizeBtn.setAttribute("data-title", article.title); // Store the title for lookup
    summarizeBtn.addEventListener("click", () => summarizeArticle(article.title));
}

function closeSummaryPanel() {
    document.getElementById("summary-panel").style.right = "-400px";
}

function summarizeArticle(title) {
    const summaryPanel = document.getElementById("summary-panel");
    const summaryText = document.getElementById("summary-text");

    summaryText.innerHTML = "🔄 Summarizing... Please wait.";
    summaryPanel.style.right = "0"; // Show the summary panel

    // Find the article from stored articles list
    const article = latestArticles.find(article => article.title === title);

    if (!article || !article.description) {
        summaryText.innerHTML = "⚠️ No summary available.";
        return;
    }

    let text = article.description.trim();

    if (text.length < 10) {
        summaryText.innerHTML = "⚠️ Not enough content to summarize.";
        return;
    }

    // Split by "." to get full sentences
    let sentences = text.match(/[^.]+[.]/g) || [];

    // Ensure at least 4 sentences
    while (sentences.length < 4) {
        sentences.push("...");
    }

    // Display in the summary panel
    summaryText.innerHTML = `
        <strong>${article.title}</strong><br><br>
        🔹 ${sentences[0].trim()}<br>
        🔹 ${sentences[1].trim()}<br>
        🔹 ${sentences[2].trim()}<br>
        🔹 ${sentences[3].trim()}
    `;
}


