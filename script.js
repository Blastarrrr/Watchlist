document.body.addEventListener("click", function (e) {
  if (e.target.classList.contains("menu")) {
    const controls = e.target.closest(".anime").querySelector(".controls");
    controls.classList.toggle("show");
  }
});

async function fetchAnimeInfo(title) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
  const data = await res.json();
  if (data.data.length > 0) {
    const anime = data.data[0];
    return {
      title: anime.title,
      image: anime.images.jpg.image_url,
      episodes: anime.episodes ?? 'N/A',
      rating: anime.score ?? 0
    };
  }
  return { title, image: '', episodes: 'N/A', rating: 0 };
}

async function addAnime() {
  const name = document.getElementById("animeName").value.trim();
  const status = document.getElementById("animeStatus").value;
  if (!name) return;

  const { title, image, episodes, rating } = await fetchAnimeInfo(name);

  // Add to DOM
  addAnimeToDOM({ title, image, episodes, rating, status });

  saveWatchlist();

  document.getElementById("animeName").value = "";
  document.getElementById("animeStatus").value = "Watching";
}

function addAnimeToDOM(anime) {
  const box = document.createElement("div");
  box.className = "anime";
  box.dataset.rating = anime.rating;
  box.innerHTML = `
    <div class="menu">⋮</div>
    <img src="${anime.image}" alt="${anime.title} thumbnail">
    <h3>${anime.title}</h3>
    <p>Status: ${anime.status}</p>
    <p>Episodes: ${anime.episodes}</p>
    <p>Rating: ${anime.rating}</p>
    <div class="controls">
      <button onclick="editAnime(this)">Edit</button>
      <button onclick="deleteAnime(this)">Delete</button>
    </div>
  `;
  document.getElementById("animeGrid").appendChild(box);
}

function deleteAnime(btn) {
  btn.closest(".anime").remove();
  saveWatchlist();
}

function editAnime(btn) {
  const box = btn.closest(".anime");
  const newName = prompt("Edit anime name:", box.querySelector("h3").textContent);
  if (newName) {
    box.querySelector("h3").textContent = newName;
    saveWatchlist();
  }
}

function saveWatchlist() {
  const grid = document.getElementById("animeGrid");
  const animes = [];
  grid.querySelectorAll(".anime").forEach(box => {
    animes.push({
      title: box.querySelector("h3").textContent,
      image: box.querySelector("img").src,
      episodes: box.querySelector("p:nth-of-type(2)").textContent.replace("Episodes: ", ""),
      rating: parseFloat(box.dataset.rating),
      status: box.querySelector("p:nth-of-type(1)").textContent.replace("Status: ", "")
    });
  });
  localStorage.setItem("animeWatchlist", JSON.stringify(animes));
}

function loadWatchlist() {
  const stored = localStorage.getItem("animeWatchlist");
  if (stored) {
    const animes = JSON.parse(stored);
    animes.forEach(addAnimeToDOM);
  }
}

// Load watchlist on page load
window.onload = loadWatchlist;
