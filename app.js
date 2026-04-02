"use strict";
const songData = [
    { id: 1,  title: "Enjoy Enjaami",        artist: "Dhee ft. Arivu",      album: "Enjoy Enjaami",           genre: "Folk Rap",    duration: "4:22", favorite: true,  playCount: 85, emoji: "🌿", color: "#27ae60" },
    { id: 2,  title: "Kannaana Kanney",       artist: "D. Imman",            album: "Viswasam",                genre: "Melody",      duration: "4:45", favorite: true,  playCount: 72, emoji: "💛", color: "#f39c12" },
    { id: 3,  title: "Rowdy Baby",            artist: "Dhanush & Dhee",      album: "Maari 2",                 genre: "Folk",        duration: "3:58", favorite: false, playCount: 91, emoji: "💃", color: "#e94560" },
    { id: 4,  title: "Vaa Machan",            artist: "Yuvan Shankar Raja",  album: "Darling",                 genre: "Hip Hop",     duration: "3:12", favorite: false, playCount: 38, emoji: "🎤", color: "#9b59b6" },
    { id: 5,  title: "Kanave Kanave",         artist: "Clinton Cerejo",      album: "David",                   genre: "Melody",      duration: "4:31", favorite: true,  playCount: 55, emoji: "🌙", color: "#2980b9" },
    { id: 6,  title: "Usure Pogudhey",        artist: "AR Rahman",           album: "Raavanan",                genre: "Classical",   duration: "5:10", favorite: false, playCount: 43, emoji: "🪔", color: "#c0392b" },
    { id: 7,  title: "Aalaporaan Thamizhan",  artist: "AR Rahman",           album: "Mersal",                  genre: "Mass",        duration: "4:02", favorite: true,  playCount: 78, emoji: "🦁", color: "#e67e22" },
    { id: 8,  title: "Mazhai Kuruvi",         artist: "AR Rahman",           album: "Chekka Chivantha Vaanam", genre: "Melody",      duration: "4:18", favorite: false, playCount: 29, emoji: "🌧️", color: "#16a085" },
    { id: 9,  title: "Kaaney Kaaney",         artist: "Yuvan Shankar Raja",  album: "Kadhal Kondein",          genre: "Melody",      duration: "5:22", favorite: true,  playCount: 61, emoji: "❤️", color: "#8e44ad" },
    { id: 10, title: "Naattu Naattu",         artist: "MM Keeravaani",       album: "RRR",                     genre: "Folk Dance",  duration: "3:46", favorite: true,  playCount: 99, emoji: "🥁", color: "#d35400" },
    { id: 11, title: "Nenjukkul Peidhidum",   artist: "Harris Jayaraj",      album: "Vaaranam Aayiram",        genre: "Melody",      duration: "4:55", favorite: false, playCount: 47, emoji: "🌧", color: "#1abc9c" },
    { id: 12, title: "Vaathi Coming",         artist: "Anirudh Ravichander", album: "Master",                  genre: "Mass",        duration: "3:34", favorite: true,  playCount: 88, emoji: "🔥", color: "#f1c40f" },
];
const myPlaylist = {
    name: "Tamil Hits Playlist",
    songs: songData,
    createdDate: new Date("2025-01-01"),
    songCount: songData.length
};
// Recently played tuple - fixed size of 5
let recentlyPlayed = [1, 3, 7, 10, 12];
let currentSongId = null;
let isPlaying = false;
let currentSort = "title";
let progressTimer = null;
let elapsedSeconds = 0;
function filterByGenre(songs, genre) {
    if (genre === "")
        return songs;
    return songs.filter((s) => s.genre === genre);
}
function filterByArtist(songs, artist) {
    if (artist === "")
        return songs;
    return songs.filter((s) => s.artist === artist);
}
function searchSongs(songs, query) {
    if (query === "")
        return songs;
    const q = query.toLowerCase();
    return songs.filter((s) => s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q));
}
function sortBy(songs, key) {
    return [...songs].sort((a, b) => {
        if (key === "duration") {
            const toSec = (d) => {
                const parts = d.split(":");
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            };
            return toSec(a.duration) - toSec(b.duration);
        }
        if (key === "playCount")
            return b.playCount - a.playCount;
        if (key === "favorite")
            return (b.favorite === a.favorite ? 0 : b.favorite ? 1 : -1);
        return String(a[key]).localeCompare(String(b[key]));
    });
}
function playSong(id) {
    var _a, _b, _c, _d;
    const song = songData.find((s) => s.id === id);
    if (!song)
        return;
    currentSongId = id;
    isPlaying = true;
    song.playCount++;
    // Update recently played tuple (max 5)
    const filtered = recentlyPlayed.filter((rid) => rid !== id);
    filtered.unshift(id);
    recentlyPlayed = [filtered[0], (_a = filtered[1]) !== null && _a !== void 0 ? _a : id, (_b = filtered[2]) !== null && _b !== void 0 ? _b : id, (_c = filtered[3]) !== null && _c !== void 0 ? _c : id, (_d = filtered[4]) !== null && _d !== void 0 ? _d : id];
    updateNowPlaying(song);
    renderSongs();
    renderRecentlyPlayed();
    startProgressTimer(song.duration);
}
function togglePlay() {
    if (currentSongId === null)
        return;
    isPlaying = !isPlaying;
    document.getElementById("playBtn").textContent = isPlaying ? "⏸ Pause" : "▶ Play";
}
function prevSong() {
    const idx = songData.findIndex((s) => s.id === currentSongId);
    const prevIdx = (idx - 1 + songData.length) % songData.length;
    playSong(songData[prevIdx].id);
}
function nextSong() {
    const idx = songData.findIndex((s) => s.id === currentSongId);
    const nextIdx = (idx + 1) % songData.length;
    playSong(songData[nextIdx].id);
}
function startProgressTimer(duration) {
    if (progressTimer !== null)
        clearInterval(progressTimer);
    elapsedSeconds = 0;
    const parts = duration.split(":");
    const totalSecs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    progressTimer = window.setInterval(() => {
        if (!isPlaying)
            return;
        elapsedSeconds++;
        if (elapsedSeconds >= totalSecs) {
            elapsedSeconds = 0;
            nextSong();
            return;
        }
        const pct = Math.floor((elapsedSeconds / totalSecs) * 100);
        const bar = document.getElementById("progressBar");
        if (bar)
            bar.style.width = pct + "%";
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = elapsedSeconds % 60;
        const timeEl = document.getElementById("currentTime");
        if (timeEl)
            timeEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
    }, 1000);
}
function updateNowPlaying(song) {
    document.getElementById("npEmoji").textContent = song.emoji;
    document.getElementById("npEmoji").style.background = song.color + "33";
    document.getElementById("npTitle").textContent = song.title;
    document.getElementById("npArtist").textContent = song.artist;
    document.getElementById("npAlbum").textContent = song.album;
    document.getElementById("npDuration").textContent = song.duration;
    document.getElementById("npGenre").textContent = song.genre;
    document.getElementById("playBtn").textContent = "⏸ Pause";
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("currentTime").textContent = "0:00";
}
function renderSongs() {
    const query = document.getElementById("searchInput").value;
    const genre = document.getElementById("genreSelect").value;
    const artist = document.getElementById("artistSelect").value;
    let result = myPlaylist.songs;
    result = searchSongs(result, query);
    result = filterByGenre(result, genre);
    result = filterByArtist(result, artist);
    result = sortBy(result, currentSort);
    const grid = document.getElementById("songsGrid");
    const countEl = document.getElementById("songCount");
    countEl.textContent = `Showing ${result.length} of ${myPlaylist.songCount} songs`;
    if (result.length === 0) {
        grid.innerHTML = `<p style="color:#888; padding:20px; grid-column:1/-1;">No songs found.</p>`;
        return;
    }
    grid.innerHTML = result.map((s) => `
    <div class="song-card ${currentSongId === s.id ? "active" : ""}" onclick="playSong(${s.id})">
      <div class="cover" style="background:${s.color}22;">${s.emoji}</div>
      <div class="song-info">
        <p class="song-title">${s.title}</p>
        <p class="song-artist">${s.artist}</p>
        <p class="song-album">${s.album}</p>
        <div class="song-meta">
          <span class="genre-badge">${s.genre}</span>
          <span class="duration">${s.duration}</span>
          <span>${s.favorite ? "❤️" : "🤍"}</span>
          <span class="plays">▶ ${s.playCount}</span>
        </div>
      </div>
    </div>
  `).join("");
}
function renderRecentlyPlayed() {
    const container = document.getElementById("recentList");
    container.innerHTML = recentlyPlayed.map((id) => {
        const s = songData.find((x) => x.id === id);
        if (!s)
            return "";
        return `
      <div class="recent-item" onclick="playSong(${s.id})">
        <span class="recent-emoji">${s.emoji}</span>
        <div>
          <p class="recent-title">${s.title}</p>
          <p class="recent-artist">${s.artist}</p>
        </div>
      </div>`;
    }).join("");
}
function populateDropdowns() {
    const genres = [...new Set(songData.map((s) => s.genre))].sort();
    const artists = [...new Set(songData.map((s) => s.artist))].sort();
    const genreEl = document.getElementById("genreSelect");
    const artistEl = document.getElementById("artistSelect");
    genres.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        genreEl.appendChild(opt);
    });
    artists.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        artistEl.appendChild(opt);
    });
}
function setSort(key, btn) {
    currentSort = key;
    document.querySelectorAll(".sort-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderSongs();
}
populateDropdowns();
renderSongs();
renderRecentlyPlayed();
playSong(1);
