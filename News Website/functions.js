const API_KEY = "bafc7f2a383142a483ee32f5c498fe5f";
const baseURL = "https://newsapi.org/v2/";
let latestArticles = [];

window.addEventListener("load", fetchLatestNews);

async function fetchNews(endpoint, query = "") {
    const url = `${baseURL}${endpoint}?${query}&apiKey=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.articles) {
            latestArticles = data.articles;
            bindData(data.articles);
        }
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function fetchLatestNews() {
    fetchNews("top-headlines", "country=us&language=en&category=general");
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cardscontainer");
    const newsCardTemplate = document.getElementById("template-news-card");
    cardsContainer.innerHTML = "";

    articles.forEach(article => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const summarizeBtn = cardClone.querySelector(".summary-btn");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = `${article.title.slice(0, 60)}...`;
    //newsDesc.innerHTML = `${article.description ? article.description.slice(0, 150) : ''}...`;

    const date = new Date(article.publishedAt).toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => window.open(article.url, "_blank"));
    summarizeBtn.setAttribute("data-title", article.title);
    summarizeBtn.addEventListener("click", () => summarizeArticle(article.title));
}

function summarizeArticle(title) {
    const summaryPanel = document.getElementById("summary-panel");
    const summaryText = document.getElementById("summary-text");

    summaryText.innerHTML = "🔄 Summarizing... Please wait.";
    summaryPanel.style.right = "0";

    const article = latestArticles.find(article => article.title === title);
    if (!article || !article.description) {
        summaryText.innerHTML = "⚠️ No summary available.";
        return;
    }

    let sentences = article.description.match(/[^.]+[.]/g) || [];
    while (sentences.length < 4) sentences.push("...");

    summaryText.innerHTML = `
        <strong>${article.title}</strong><br><br>
        🔹 ${sentences.slice(0, 4).map(s => s.trim()).join("<br>🔹 ")}
    `;
}

document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-text").value;
    if (query) fetchNews("everything", `q=${query}&sortBy=publishedAt&language=en`);
});

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews("everything", `q=${id}&sortBy=publishedAt&language=en`);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = document.getElementById(id);
    curSelectedNav.classList.add("active");
}
window.addEventListener("load", closePanelOnOutsideClick);

function closeSummaryPanel() {
    document.getElementById("summary-panel").style.right = "-400px";
}
function closePanelOnOutsideClick() {
    document.addEventListener("click", function(event) {
        const summaryPanel = document.getElementById("summary-panel");

        // If panel is open and the clicked element is NOT inside the panel or the summary button
        if (summaryPanel.style.right === "0px" && !event.target.closest("#summary-panel") && !event.target.classList.contains("summary-btn")) {
            closeSummaryPanel();
        }
    });
}

// Function to close the summary panel
function closeSummaryPanel() {
    document.getElementById("summary-panel").style.right = "-400px";
}

