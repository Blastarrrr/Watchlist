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

  const box = document.createElement("div");
  box.className = "anime";
  box.dataset.rating = rating;
  box.innerHTML = `
    <div class="menu">⋮</div>
    <img src="${image}" alt="${title} thumbnail">
    <h3>${title}</h3>
    <p>Status: ${status}</p>
    <p>Episodes: ${episodes}</p>
    <p>Rating: ${rating}</p>
    <div class="controls">
      <button onclick="editAnime(this)">Edit</button>
      <button onclick="deleteAnime(this)">Delete</button>
    </div>
  `;
  document.getElementById("animeGrid").appendChild(box);

  document.getElementById("animeName").value = "";
  document.getElementById("animeStatus").value = "Watching";
}

function deleteAnime(btn) {
  btn.closest(".anime").remove();
}

function editAnime(btn) {
  const box = btn.closest(".anime");
  const newName = prompt("Edit anime name:", box.querySelector("h3").textContent);
  if (newName) {
    box.querySelector("h3").textContent = newName;
  }
}

function sortByRating() {
  const grid = document.getElementById("animeGrid");
  const cards = Array.from(grid.children);
  cards.sort((a, b) => parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating));
  grid.innerHTML = "";
  cards.forEach(card => grid.appendChild(card));
}
