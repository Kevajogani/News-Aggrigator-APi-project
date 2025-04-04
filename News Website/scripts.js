const API_KEY = "bafc7f2a383142a483ee32f5c498fe5f";
const baseURL = "https://newsapi.org/v2/";

let latestArticles = []; // Store articles globally

window.addEventListener("load", () => fetchLatestNews());

async function fetchLatestNews(category = "general") {
    try {
        const res = await fetch(`${baseURL}top-headlines?country=us&language=en&category=${category}&apiKey=${API_KEY}`);
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
    const newsImage = cardClone.querySelector("#news-img");
    newsImage.src = article.urlToImage;

    // Remove redirection and replace it with a simple highlight effect
    newsImage.addEventListener("click", () => {
        newsImage.style.border = "4px solid var(--accent-color)";
        setTimeout(() => {
            newsImage.style.border = "none";
        }, 1000); // Highlight effect for 1 second
    });

    cardClone.querySelector("#news-title").innerText = article.title;
    cardClone.querySelector("#news-desc").innerText = article.description || "No description available";

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

    let text = article.description;
    let sentences = [];
    let index = 0;

    while (sentences.length < 4 && index < text.length) {
        let nextDot = text.indexOf(".", index + 1);
        if (nextDot === -1) break;

        if (nextDot - index <= 100 || sentences.length === 0) {
            sentences.push(text.slice(index, nextDot + 1).trim());
        }
        index = nextDot + 1;
    }

    while (sentences.length < 4) {
        sentences.push("...");
    }

    summaryText.innerHTML = `
        <strong>${article.title}</strong><br><br>
        🔹 ${sentences[0]}<br>
        🔹 ${sentences[1]}<br>
        🔹 ${sentences[2]}<br>
        🔹 ${sentences[3]}
    `;
}

document.querySelectorAll(".category").forEach(categoryBtn => {
    categoryBtn.addEventListener("click", function () {
        const category = this.getAttribute("data-category");
        fetchLatestNews(category);
    });
});