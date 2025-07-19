// Toggle controls menu on ⋮ click
document.body.addEventListener("click", function (e) {
  if (e.target.classList.contains("menu")) {
    const controls = e.target.closest(".card").querySelector(".controls");
    controls.classList.toggle("show");
  }
});

// Load saved watchlist on page load
window.onload = function () {
  loadSavedList();
};

// Save current lists to localStorage
function saveList() {
  const animeCards = Array.from(document.querySelectorAll("#animeGrid .card.anime")).map(card => ({
    title: card.querySelector("h3").textContent,
    status: card.querySelector("p.status").textContent.replace('Status: ', ''),
    episodes: card.querySelector("p.episodes").textContent.replace('Episodes: ', ''),
    rating: card.querySelector("p.rating").textContent.replace('Rating: ', ''),
    image: card.querySelector("img").src
  }));
  const mangaCards = Array.from(document.querySelectorAll("#mangaGrid .card.manga")).map(card => ({
    title: card.querySelector("h3").textContent,
    status: card.querySelector("p.status").textContent.replace('Status: ', ''),
    chapters: card.querySelector("p.chapters").textContent.replace('Chapters: ', ''),
    rating: card.querySelector("p.rating").textContent.replace('Rating: ', ''),
    image: card.querySelector("img").src
  }));

  localStorage.setItem("animeList", JSON.stringify(animeCards));
  localStorage.setItem("mangaList", JSON.stringify(mangaCards));
}

// Load and render saved lists
function loadSavedList() {
  const savedAnime = JSON.parse(localStorage.getItem("animeList") || "[]");
  savedAnime.forEach(a => addCardToGrid('anime', a));

  const savedManga = JSON.parse(localStorage.getItem("mangaList") || "[]");
  savedManga.forEach(m => addCardToGrid('manga', m));
}

// Helper: add a card (anime or manga) to correct grid
function addCardToGrid(type, data) {
  const box = document.createElement("div");
  box.className = `card ${type}`;
  box.innerHTML = `
    <div class="menu">⋮</div>
    <img src="${data.image}" alt="${data.title} thumbnail" />
    <h3>${data.title}</h3>
    <p class="status">Status: ${data.status}</p>
    <p class="${type === 'anime' ? 'episodes' : 'chapters'}">${type === 'anime' ? 'Episodes' : 'Chapters'}: ${type === 'anime' ? data.episodes : data.chapters}</p>
    <p class="rating">Rating: ${data.rating}</p>
    <div class="controls">
      <button onclick="editCard(this)">Edit</button>
      <button onclick="deleteCard(this)">Delete</button>
    </div>
  `;
  document.getElementById(type + "Grid").appendChild(box);
}

// Fetch anime info from Jikan API
async function fetchAnimeInfo(title) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
  const data = await res.json();
  if (data.data.length > 0) {
    const anime = data.data[0];
    return {
      title: anime.title,
      image: anime.images.jpg.image_url,
      episodes: anime.episodes ?? 'N/A',
      rating: anime.score ?? 0,
      status: "" // you will add on your own input
    };
  }
  return { title, image: '', episodes: 'N/A', rating: 0, status: "" };
}

// Fetch manga info from Jikan API
async function fetchMangaInfo(title) {
  const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=1`);
  const data = await res.json();
  if (data.data.length > 0) {
    const manga = data.data[0];
    return {
      title: manga.title,
      image: manga.images.jpg.image_url,
      chapters: manga.chapters ?? 'N/A',
      rating: manga.score ?? 0,
      status: ""
    };
  }
  return { title, image: '', chapters: 'N/A', rating: 0, status: "" };
}

// Add anime from input fields
async function addAnime() {
  const name = document.getElementById("animeName").value.trim();
  const status = document.getElementById("animeStatus").value;
  if (!name) return alert("Please enter an anime name");

  const data = await fetchAnimeInfo(name);
  data.status = status;

  addCardToGrid('anime', data);
  saveList();

  document.getElementById("animeName").value = "";
  document.getElementById("animeStatus").value = "Watching";
}

// Add manga from input fields
async function addManga() {
  const name = document.getElementById("mangaName").value.trim();
  const status = document.getElementById("mangaStatus").value;
  if (!name) return alert("Please enter a manga name");

  const data = await fetchMangaInfo(name);
  data.status = status;

  addCardToGrid('manga', data);
  saveList();

  document.getElementById("mangaName").value = "";
  document.getElementById("mangaStatus").value = "Reading";
}

// Delete a card (anime or manga)
function deleteCard(btn) {
  btn.closest(".card").remove();
  saveList();
}

// Edit card title and save
function editCard(btn) {
  const card = btn.closest(".card");
  const newName = prompt("Edit title:", card.querySelector("h3").textContent);
  if (newName && newName.trim() !== "") {
    card.querySelector("h3").textContent = newName.trim();
    saveList();
  }
}
