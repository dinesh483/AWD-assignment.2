
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  favorite: boolean;
  playCount: number;
  emoji: string;
  color: string;
}

interface Playlist {
  name: string;
  songs: Song[];
  createdDate: Date;
  songCount: number;
}

// Fixed tuple type for Recently Played (exactly 5 songs)
type RecentlyPlayedTuple = [number, number, number, number, number];


const songData: Song[] = [
  { id: 1,  title: "Blinding Lights",   artist: "The Weeknd",    album: "After Hours",     genre: "Pop",       duration: "3:22", favorite: true,  playCount: 45, emoji: "🌃", color: "#e94560" },
  { id: 2,  title: "Levitating",        artist: "Dua Lipa",      album: "Future Nostalgia",genre: "Pop",       duration: "3:23", favorite: false, playCount: 32, emoji: "🪐", color: "#9b59b6" },
  { id: 3,  title: "Stay",              artist: "Kid LAROI",     album: "FXXX LOVE",       genre: "Hip Hop",   duration: "2:21", favorite: true,  playCount: 28, emoji: "🎤", color: "#e67e22" },
  { id: 4,  title: "Peaches",           artist: "Justin Bieber", album: "Justice",         genre: "R&B",       duration: "3:18", favorite: false, playCount: 19, emoji: "🍑", color: "#f39c12" },
  { id: 5,  title: "Good 4 U",          artist: "Olivia Rodrigo",album: "SOUR",            genre: "Pop Rock",  duration: "2:58", favorite: true,  playCount: 37, emoji: "💚", color: "#27ae60" },
  { id: 6,  title: "Montero",           artist: "Lil Nas X",     album: "Montero",         genre: "Hip Hop",   duration: "2:17", favorite: false, playCount: 22, emoji: "🔥", color: "#c0392b" },
  { id: 7,  title: "drivers license",   artist: "Olivia Rodrigo",album: "SOUR",            genre: "Pop",       duration: "4:02", favorite: true,  playCount: 41, emoji: "🚗", color: "#2980b9" },
  { id: 8,  title: "Butter",            artist: "BTS",           album: "Butter",          genre: "K-Pop",     duration: "2:44", favorite: false, playCount: 15, emoji: "🧈", color: "#f1c40f" },
  { id: 9,  title: "Industry Baby",     artist: "Lil Nas X",     album: "Montero",         genre: "Hip Hop",   duration: "3:32", favorite: false, playCount: 26, emoji: "🏭", color: "#1abc9c" },
  { id: 10, title: "Save Your Tears",   artist: "The Weeknd",    album: "After Hours",     genre: "Synth Pop", duration: "3:35", favorite: true,  playCount: 33, emoji: "💧", color: "#8e44ad" },
  { id: 11, title: "Heat Waves",        artist: "Glass Animals", album: "Dreamland",       genre: "Indie Pop", duration: "3:59", favorite: false, playCount: 29, emoji: "🌊", color: "#16a085" },
  { id: 12, title: "Bad Habits",        artist: "Ed Sheeran",    album: "Equal",           genre: "Pop",       duration: "3:51", favorite: true,  playCount: 38, emoji: "🎸", color: "#d35400" },
];

const myPlaylist: Playlist = {
  name: "My Playlist",
  songs: songData,
  createdDate: new Date("2025-01-01"),
  songCount: songData.length
};

// Recently played tuple - fixed size of 5
let recentlyPlayed: RecentlyPlayedTuple = [1, 5, 7, 10, 12];
let currentSongId: number | null = null;
let isPlaying: boolean = false;
let currentSort: keyof Song = "title";
let progressTimer: number | null = null;
let elapsedSeconds: number = 0;

function filterByGenre(songs: Song[], genre: string): Song[] {
  if (genre === "") return songs;
  return songs.filter((s: Song) => s.genre === genre);
}

function filterByArtist(songs: Song[], artist: string): Song[] {
  if (artist === "") return songs;
  return songs.filter((s: Song) => s.artist === artist);
}

function searchSongs(songs: Song[], query: string): Song[] {
  if (query === "") return songs;
  const q: string = query.toLowerCase();
  return songs.filter((s: Song) =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q) ||
    s.album.toLowerCase().includes(q)
  );
}

function sortBy(songs: Song[], key: keyof Song): Song[] {
  return [...songs].sort((a: Song, b: Song) => {
    if (key === "duration") {
      const toSec = (d: string): number => {
        const parts: string[] = d.split(":");
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      };
      return toSec(a.duration) - toSec(b.duration);
    }
    if (key === "playCount") return (b.playCount as number) - (a.playCount as number);
    if (key === "favorite") return (b.favorite === a.favorite ? 0 : b.favorite ? 1 : -1);
    return String(a[key]).localeCompare(String(b[key]));
  });
}

function playSong(id: number): void {
  const song: Song | undefined = songData.find((s: Song) => s.id === id);
  if (!song) return;

  currentSongId = id;
  isPlaying = true;
  song.playCount++;

  // Update recently played tuple (max 5)
  const filtered: number[] = recentlyPlayed.filter((rid: number) => rid !== id);
  filtered.unshift(id);
  recentlyPlayed = [filtered[0], filtered[1] ?? id, filtered[2] ?? id, filtered[3] ?? id, filtered[4] ?? id] as RecentlyPlayedTuple;

  updateNowPlaying(song);
  renderSongs();
  renderRecentlyPlayed();
  startProgressTimer(song.duration);
}

function togglePlay(): void {
  if (currentSongId === null) return;
  isPlaying = !isPlaying;
  (document.getElementById("playBtn") as HTMLButtonElement).textContent = isPlaying ? "⏸ Pause" : "▶ Play";
}

function prevSong(): void {
  const idx: number = songData.findIndex((s: Song) => s.id === currentSongId);
  const prevIdx: number = (idx - 1 + songData.length) % songData.length;
  playSong(songData[prevIdx].id);
}

function nextSong(): void {
  const idx: number = songData.findIndex((s: Song) => s.id === currentSongId);
  const nextIdx: number = (idx + 1) % songData.length;
  playSong(songData[nextIdx].id);
}

function startProgressTimer(duration: string): void {
  if (progressTimer !== null) clearInterval(progressTimer);
  elapsedSeconds = 0;
  const parts: string[] = duration.split(":");
  const totalSecs: number = parseInt(parts[0]) * 60 + parseInt(parts[1]);

  progressTimer = window.setInterval(() => {
    if (!isPlaying) return;
    elapsedSeconds++;
    if (elapsedSeconds >= totalSecs) {
      elapsedSeconds = 0;
      nextSong();
      return;
    }
    const pct: number = Math.floor((elapsedSeconds / totalSecs) * 100);
    const bar = document.getElementById("progressBar") as HTMLDivElement;
    if (bar) bar.style.width = pct + "%";

    const mins: number = Math.floor(elapsedSeconds / 60);
    const secs: number = elapsedSeconds % 60;
    const timeEl = document.getElementById("currentTime") as HTMLSpanElement;
    if (timeEl) timeEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
  }, 1000);
}

function updateNowPlaying(song: Song): void {
  (document.getElementById("npEmoji") as HTMLDivElement).textContent = song.emoji;
  (document.getElementById("npEmoji") as HTMLDivElement).style.background = song.color + "33";
  (document.getElementById("npTitle") as HTMLHeadingElement).textContent = song.title;
  (document.getElementById("npArtist") as HTMLParagraphElement).textContent = song.artist;
  (document.getElementById("npAlbum") as HTMLParagraphElement).textContent = song.album;
  (document.getElementById("npDuration") as HTMLSpanElement).textContent = song.duration;
  (document.getElementById("npGenre") as HTMLSpanElement).textContent = song.genre;
  (document.getElementById("playBtn") as HTMLButtonElement).textContent = "⏸ Pause";
  (document.getElementById("progressBar") as HTMLDivElement).style.width = "0%";
  (document.getElementById("currentTime") as HTMLSpanElement).textContent = "0:00";
}

function renderSongs(): void {
  const query: string = (document.getElementById("searchInput") as HTMLInputElement).value;
  const genre: string = (document.getElementById("genreSelect") as HTMLSelectElement).value;
  const artist: string = (document.getElementById("artistSelect") as HTMLSelectElement).value;

  let result: Song[] = myPlaylist.songs;
  result = searchSongs(result, query);
  result = filterByGenre(result, genre);
  result = filterByArtist(result, artist);
  result = sortBy(result, currentSort);

  const grid = document.getElementById("songsGrid") as HTMLDivElement;
  const countEl = document.getElementById("songCount") as HTMLSpanElement;
  countEl.textContent = `Showing ${result.length} of ${myPlaylist.songCount} songs`;

  if (result.length === 0) {
    grid.innerHTML = `<p style="color:#888; padding:20px; grid-column:1/-1;">No songs found.</p>`;
    return;
  }

  grid.innerHTML = result.map((s: Song) => `
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

function renderRecentlyPlayed(): void {
  const container = document.getElementById("recentList") as HTMLDivElement;
  container.innerHTML = recentlyPlayed.map((id: number) => {
    const s: Song | undefined = songData.find((x: Song) => x.id === id);
    if (!s) return "";
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

function populateDropdowns(): void {
  const genres: string[] = [...new Set(songData.map((s: Song) => s.genre))].sort();
  const artists: string[] = [...new Set(songData.map((s: Song) => s.artist))].sort();

  const genreEl = document.getElementById("genreSelect") as HTMLSelectElement;
  const artistEl = document.getElementById("artistSelect") as HTMLSelectElement;

  genres.forEach((g: string) => {
    const opt: HTMLOptionElement = document.createElement("option");
    opt.value = g; opt.textContent = g;
    genreEl.appendChild(opt);
  });

  artists.forEach((a: string) => {
    const opt: HTMLOptionElement = document.createElement("option");
    opt.value = a; opt.textContent = a;
    artistEl.appendChild(opt);
  });
}

function setSort(key: keyof Song, btn: HTMLButtonElement): void {
  currentSort = key;
  document.querySelectorAll<HTMLButtonElement>(".sort-btn").forEach((b: HTMLButtonElement) => b.classList.remove("active"));
  btn.classList.add("active");
  renderSongs();
}

populateDropdowns();
renderSongs();
renderRecentlyPlayed();
playSong(1);
