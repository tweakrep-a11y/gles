"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Film,
  Search,
  Bookmark,
  History,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Settings,
  X,
  ExternalLink,
  Sliders,
  Send,
  Eye,
  CheckCircle2,
  Tv,
  Maximize2,
  ArrowLeft,
  Share2,
  Heart,
  Grid,
  List,
  ArrowUpDown,
  Filter,
  Check,
  Star,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Radio,
  SlidersHorizontal,
  Flame,
  Volume2,
  MonitorPlay
} from "lucide-react";

interface MangaItem {
  id: string;
  title: string;
  coverImage: string;
  genre: string;
  type: "MANGA" | "MANHWA" | "MANHUA";
  latestChapter: string;
  latestChapterDate: string;
  status: "Ongoing" | "Completed";
  synopsis: string;
  author: string;
  artist: string;
  rating: number;
  totalChapters: number;
  source: string;
}

interface ChapterItem {
  number: number;
  title: string;
  date: string;
  isRead?: boolean;
}

interface AnimeItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  coverImage: string;
  bannerImage?: string;
  genre: string;
  episode: string;
  releaseDate: string;
  status: "Ongoing" | "Completed";
  rating: string;
  isHd: boolean;
  synopsis: string;
  studio: string;
  season: string;
  totalEpisodes: number;
  broadcastSchedule: string;
  source: string;
}

interface EpisodeItem {
  number: number;
  title: string;
  duration: string;
  date: string;
  thumbnail: string;
  progressPercent?: number;
}

const MANGA_SOURCES = [
  { id: "komikcast", label: "VoraToon" },
  { id: "shinigami", label: "Shinigami" },
  { id: "westmanga", label: "Westmanga" },
  { id: "komikindo", label: "Komikindo" },
  { id: "ikiru", label: "Ikiru" },
  { id: "doujindesu", label: "DoujinDesu" }
];

const ANIME_SOURCES = [
  { id: "default", label: "Anime X Nonton" },
  { id: "animeku", label: "Animeku" },
  { id: "animeloverz", label: "Animeloverz" },
  { id: "dramora", label: "Dramora" },
  { id: "drakorku", label: "Drakorku" }
];

const SAMPLE_MANGAS: MangaItem[] = [
  {
    id: "solo-leveling-ragnarok",
    title: "Solo Leveling: Ragnarok",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80",
    genre: "Action · Fantasy · Hunter · System",
    type: "MANHWA",
    latestChapter: "Chapter 42",
    latestChapterDate: "10 mnt lalu",
    status: "Ongoing",
    synopsis: "Pewaris takhta Shadow Monarch, Sung Suho, memulai perjalanan menaklukkan dungeon dimensi baru yang mengancam bumi. Saat pintu gerbang surgawi terbuka kembali dan dewa-dewa asing mulai mendekat, kekuatan kegelapan bangkit kembali dalam darah penerus tahta agung.",
    author: "Daul",
    artist: "Redice Studio",
    rating: 4.94,
    totalChapters: 42,
    source: "VoraToon"
  },
  {
    id: "nano-machine",
    title: "Nano Machine",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80",
    genre: "Murim · Action · Sci-Fi · Reincarnation",
    type: "MANHWA",
    latestChapter: "Chapter 235",
    latestChapterDate: "35 mnt lalu",
    status: "Ongoing",
    synopsis: "Cheon Yeo-Woon mendapatkan suntikan mesin nano dari keturunan masa depannya yang mengubah takdirnya di sekte iblis. Menghadapi konspirasi para tetua dan musuh berbahaya di dunia persilatan, ia memadukan seni bela diri legendaris dengan teknologi masa depan tak tertandingi.",
    author: "Jeolmu Hyeon",
    artist: "GGBG",
    rating: 4.88,
    totalChapters: 235,
    source: "Shinigami"
  },
  {
    id: "omniscient-reader",
    title: "Omniscient Reader's Viewpoint",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
    genre: "Action · Apocalyptic · Drama · Mystery",
    type: "MANHWA",
    latestChapter: "Chapter 228",
    latestChapterDate: "8 mnt lalu",
    status: "Ongoing",
    synopsis: "Hanya Kim Dokja yang mengetahui akhir dari cerita novel epik 'Tiga Cara Bertahan Hidup di Dunia yang Hancur'. Ketika monster dan skenario kiamat menjadi kenyataan di Seoul, ia harus memimpin umat manusia dengan pengetahuan rahasianya.",
    author: "Sing Shong",
    artist: "Sleepy-C",
    rating: 4.97,
    totalChapters: 228,
    source: "VoraToon"
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80",
    genre: "Action · Supernatural · Shounen · Dark Fantasy",
    type: "MANGA",
    latestChapter: "Chapter 271 (End)",
    latestChapterDate: "Kemarin",
    status: "Completed",
    synopsis: "Pertarungan epik para penyihir jujutsu melawan raja kutukan Ryomen Sukuna dan manipulasi kenjaku untuk membentuk ulang peradaban dunia kutukan.",
    author: "Gege Akutami",
    artist: "Gege Akutami",
    rating: 4.82,
    totalChapters: 271,
    source: "Komikindo"
  }
];

const SAMPLE_ANIMES: AnimeItem[] = [
  {
    id: "frieren-beyond-journeys-end",
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: "葬送のフリーレン (Sousou no Frieren)",
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    genre: "Fantasy · Adventure · Drama · Slice of Life",
    episode: "Episode 28 (Selesai)",
    releaseDate: "2 jam lalu",
    status: "Completed",
    rating: "9.38",
    isHd: true,
    synopsis: "Penyihir elf Frieren mengalahkan Raja Iblis bersama kelompok pahlawannya setelah 10 tahun perjalanan. Sebagai elf yang berumur ribuan tahun, ia baru menyadari betapa singkat dan berharganya waktu manusia setelah rekan pahlawannya, Himmel, meninggal karena usia tua.",
    studio: "Madhouse",
    season: "Fall 2023 - Winter 2024",
    totalEpisodes: 28,
    broadcastSchedule: "Jumat, 22:00 WIB",
    source: "Anime X Nonton"
  },
  {
    id: "solo-leveling-anime",
    title: "Solo Leveling: Arise",
    japaneseTitle: "俺だけレベルアップな件",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80",
    genre: "Action · Fantasy · Supernatural",
    episode: "Episode 12 (Tamat Musim 1)",
    releaseDate: "Hari ini",
    status: "Completed",
    rating: "8.65",
    isHd: true,
    synopsis: "Di dunia di mana pemburu berkekuatan magis melawan monster berbahaya dari gate misterius, Sung Jinwoo adalah pemburu terlemah berperingkat E yang nyaris kehilangan nyawanya di Double Dungeon mematikan.",
    studio: "A-1 Pictures",
    season: "Winter 2024",
    totalEpisodes: 12,
    broadcastSchedule: "Minggu, 00:00 WIB",
    source: "Animeku"
  },
  {
    id: "demon-slayer-hashira",
    title: "Demon Slayer: Hashira Training Arc",
    japaneseTitle: "鬼滅の刃 柱稽古編",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop&q=80",
    genre: "Action · Fantasy · Historical · Shounen",
    episode: "Episode 8 (Selesai)",
    releaseDate: "Kemarin",
    status: "Completed",
    rating: "8.52",
    isHd: true,
    synopsis: "Tanjiro dan para pembasmi iblis mengikuti pelatihan intensif di bawah bimbingan para Hashira untuk bersiap menghadapi bentrokan terakhir melawan Kibutsuji Muzan di Infinity Castle.",
    studio: "ufotable",
    season: "Spring 2024",
    totalEpisodes: 8,
    broadcastSchedule: "Minggu, 23:15 WIB",
    source: "Animeloverz"
  }
];

export default function App() {
  // Navigation View: "home" | "manga_detail_v3" | "anime_detail_v1"
  const [viewMode, setViewMode] = useState<"home" | "manga_detail_v3" | "anime_detail_v1">("home");
  
  // Home states
  const [homeCategory, setHomeCategory] = useState<"manga" | "anime">("manga");
  const [activeMangaSource, setActiveMangaSource] = useState("komikcast");
  const [activeAnimeSource, setActiveAnimeSource] = useState("default");
  
  // Active Item for Details
  const [selectedManga, setSelectedManga] = useState<MangaItem>(SAMPLE_MANGAS[0]);
  const [selectedAnime, setSelectedAnime] = useState<AnimeItem>(SAMPLE_ANIMES[0]);

  // Detail View Sub-tabs
  const [mangaDetailTab, setMangaDetailTab] = useState<"chapters" | "info" | "similar">("chapters");
  const [animeDetailTab, setAnimeDetailTab] = useState<"episodes" | "server" | "details">("episodes");

  // Manga Detail Interactive Controls
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [chapterSortDesc, setChapterSortDesc] = useState(true);
  const [chapterLayoutGrid, setChapterLayoutGrid] = useState(false);
  const [mangaSynopsisExpanded, setMangaSynopsisExpanded] = useState(false);
  const [isMangaFavorite, setIsMangaFavorite] = useState(false);
  const [chapterReadStatus, setChapterReadStatus] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true, 42: true });

  // Anime Detail Interactive Controls
  const [episodeSearchQuery, setEpisodeSearchQuery] = useState("");
  const [episodeBatchFilter, setEpisodeBatchFilter] = useState<string>("all");
  const [episodeSortDesc, setEpisodeSortDesc] = useState(false);
  const [animeSynopsisExpanded, setAnimeSynopsisExpanded] = useState(false);
  const [isAnimeWatchlist, setIsAnimeWatchlist] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState("1080p Ultra HD");
  const [selectedServer, setSelectedServer] = useState("Server Alpha (Fast CDN)");

  // Modals & Popups
  const [readerOpen, setReaderOpen] = useState(false);
  const [activeReaderChapter, setActiveReaderChapter] = useState(1);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activePlayerEpisode, setActivePlayerEpisode] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Generate Sample Chapters for Selected Manga
  const generatedChapters: ChapterItem[] = useMemo(() => {
    const list: ChapterItem[] = [];
    const total = selectedManga.totalChapters;
    for (let i = total; i >= 1; i--) {
      list.push({
        number: i,
        title: `Chapter ${i}`,
        date: i === total ? "10 menit lalu" : i > total - 5 ? `${total - i} hari lalu` : `${total - i + 2} minggu lalu`,
        isRead: !!chapterReadStatus[i]
      });
    }
    return list;
  }, [selectedManga, chapterReadStatus]);

  // Filter & Sort Chapters
  const filteredChapters = useMemo(() => {
    let result = [...generatedChapters];
    if (chapterSearchQuery.trim()) {
      const q = chapterSearchQuery.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q) || c.number.toString().includes(q));
    }
    if (!chapterSortDesc) {
      result.reverse();
    }
    return result;
  }, [generatedChapters, chapterSearchQuery, chapterSortDesc]);

  // Generate Sample Episodes for Selected Anime
  const generatedEpisodes: EpisodeItem[] = useMemo(() => {
    const list: EpisodeItem[] = [];
    const total = selectedAnime.totalEpisodes;
    for (let i = 1; i <= total; i++) {
      list.push({
        number: i,
        title: `Episode ${i}: ${i === 1 ? "Awal Perjalanan yang Hilang" : i === total ? "Penyelesaian dan Janji Abadi" : "Menghadapi Bayangan Masa Lalu"}`,
        duration: "24:18",
        date: i === total ? "Baru saja" : `${total - i} minggu lalu`,
        thumbnail: selectedAnime.coverImage,
        progressPercent: i === 1 ? 100 : i === 2 ? 65 : 0
      });
    }
    return list;
  }, [selectedAnime]);

  // Filter & Sort Episodes
  const filteredEpisodes = useMemo(() => {
    let result = [...generatedEpisodes];
    if (episodeBatchFilter === "1-12") {
      result = result.filter(e => e.number >= 1 && e.number <= 12);
    } else if (episodeBatchFilter === "13-24") {
      result = result.filter(e => e.number >= 13 && e.number <= 24);
    } else if (episodeBatchFilter === "25+") {
      result = result.filter(e => e.number >= 25);
    }

    if (episodeSearchQuery.trim()) {
      const q = episodeSearchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.number.toString().includes(q));
    }

    if (episodeSortDesc) {
      result.reverse();
    }
    return result;
  }, [generatedEpisodes, episodeBatchFilter, episodeSearchQuery, episodeSortDesc]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans pb-24 md:pb-8 selection:bg-amber-500 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full bg-slate-900/90 text-white border border-white/20 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP APPLICATION APPBAR WITH VIEW SWITCHER */}
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base">MIKU APP</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  REDESIGN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Total UI/UX Overhaul Preview</p>
            </div>
          </div>

          {/* Quick View Mode Switcher Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("home")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                viewMode === "home"
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setViewMode("manga_detail_v3")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                viewMode === "manga_detail_v3"
                  ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="font-bold">Manga Detail V3</span>
            </button>

            <button
              onClick={() => setViewMode("anime_detail_v1")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                viewMode === "anime_detail_v1"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="font-bold">Detail Anime V1</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW MODE 1: BERANDA (HOME) */}
      {viewMode === "home" && (
        <main className="max-w-6xl mx-auto px-4 pt-4 space-y-6">
          {/* Subheader Switcher: Manga v3 vs Anime v2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHomeCategory("manga")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  homeCategory === "manga"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Manga (Home Style v3)
              </button>
              <button
                onClick={() => setHomeCategory("anime")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  homeCategory === "anime"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Anime (Home Anime v2)
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Klik pada kartu komik/anime untuk langsung membuka <span className="text-amber-300 font-semibold">Detail Redesign</span>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pratinjau Redesign Manga Detail V3 & Detail Anime V1</h4>
                <p className="text-xs text-slate-300">
                  Desain baru mengusung Compact Floating Header, sinopsis terfokus, serta tab bar interaktif lengkap dengan instant search & filter.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode("manga_detail_v3")}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              >
                Coba Manga V3
              </button>
              <button
                onClick={() => setViewMode("anime_detail_v1")}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                Coba Anime V1
              </button>
            </div>
          </div>

          {/* Source Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(homeCategory === "manga" ? MANGA_SOURCES : ANIME_SOURCES).map((src) => {
              const active = (homeCategory === "manga" ? activeMangaSource : activeAnimeSource) === src.id;
              return (
                <button
                  key={src.id}
                  onClick={() => {
                    if (homeCategory === "manga") setActiveMangaSource(src.id);
                    else setActiveAnimeSource(src.id);
                    showToast(`Sumber diganti ke ${src.label}`);
                  }}
                  className={`px-3.5 py-1.5 text-xs rounded-xl font-medium border transition-all whitespace-nowrap ${
                    active
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
                      : "bg-[#121824] border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {src.label}
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {homeCategory === "manga" ? (
              SAMPLE_MANGAS.map((manga) => (
                <div
                  key={manga.id}
                  onClick={() => {
                    setSelectedManga(manga);
                    setViewMode("manga_detail_v3");
                  }}
                  className="group relative bg-[#121824] border border-white/5 hover:border-rose-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/30"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30 uppercase">
                      {manga.type}
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] font-semibold text-rose-300 truncate">
                      {manga.latestChapter}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                      {manga.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{manga.genre}</p>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {manga.rating}
                      </span>
                      <span className="text-[10px] text-slate-500">{manga.source}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              SAMPLE_ANIMES.map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => {
                    setSelectedAnime(anime);
                    setViewMode("anime_detail_v1");
                  }}
                  className="group relative bg-[#121824] border border-white/5 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/30"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      HD 1080P
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-[11px] font-semibold text-emerald-300 truncate">
                      {anime.episode}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {anime.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{anime.genre}</p>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {anime.rating}
                      </span>
                      <span className="text-[10px] text-slate-500">{anime.studio}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* VIEW MODE 2: MANGA DETAIL V3 REDESIGN */}
      {viewMode === "manga_detail_v3" && (
        <main className="max-w-4xl mx-auto px-4 pt-2 space-y-4">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between py-1">
            <button
              onClick={() => setViewMode("home")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                Manga Detail V3 Redesigned
              </span>
            </div>
          </div>

          {/* 1. COMPACT FLOATING HERO HEADER */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141A29]/95 via-[#0D121F] to-[#0A0E18] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div
              className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none"
              style={{ backgroundImage: `url(${selectedManga.coverImage})` }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row gap-5 items-start">
              {/* Cover Poster with badges */}
              <div className="relative w-32 sm:w-40 aspect-[3/4.4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/15 mx-auto sm:mx-0">
                <img
                  src={selectedManga.coverImage}
                  alt={selectedManga.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-extrabold text-amber-400 border border-amber-500/30">
                  {selectedManga.type}
                </span>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {selectedManga.rating}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[9px]">
                    {selectedManga.status}
                  </span>
                </div>
              </div>

              {/* Title, Meta Tags, and Actions */}
              <div className="flex-1 w-full min-w-0">
                {/* Meta Chips */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Sumber: {selectedManga.source}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                    Total: {selectedManga.totalChapters} Chapter
                  </span>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Update Terbaru: {selectedManga.latestChapterDate}
                  </span>
                </div>

                {/* Manga Title */}
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                  {selectedManga.title}
                </h1>

                {/* Author & Artist */}
                <p className="text-xs text-slate-400 mt-1">
                  Karya <span className="text-slate-200 font-semibold">{selectedManga.author}</span> · Gambar oleh <span className="text-slate-200 font-semibold">{selectedManga.artist}</span>
                </p>

                {/* Quick Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <button
                    onClick={() => {
                      setActiveReaderChapter(selectedManga.totalChapters);
                      setReaderOpen(true);
                      showToast(`Membuka ${selectedManga.latestChapter}...`);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-transform active:scale-95"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lanjutkan {selectedManga.latestChapter}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveReaderChapter(1);
                      setReaderOpen(true);
                      showToast("Membuka Chapter 1...");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
                  >
                    <span>Ch. 1</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMangaFavorite(!isMangaFavorite);
                      showToast(!isMangaFavorite ? "Ditambahkan ke Favorit" : "Dihapus dari Favorit");
                    }}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isMangaFavorite
                        ? "bg-rose-500/20 border-rose-500 text-rose-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                    title="Favorit"
                  >
                    <Heart className={`w-4 h-4 ${isMangaFavorite ? "fill-rose-500" : ""}`} />
                  </button>

                  <button
                    onClick={() => {
                      showToast("Tautan manga disalin ke clipboard!");
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Focused Synopsis with Smooth Expand/Collapse */}
                <div className="mt-4 pt-3.5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      Sinopsis Singkat
                    </span>
                    <button
                      onClick={() => setMangaSynopsisExpanded(!mangaSynopsisExpanded)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
                    >
                      {mangaSynopsisExpanded ? (
                        <>Ringkas <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Baca Selengkapnya <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>

                  <p
                    className={`text-xs text-slate-300 leading-relaxed font-normal transition-all duration-300 ${
                      mangaSynopsisExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {selectedManga.synopsis}
                  </p>

                  {/* Genre Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedManga.genre.split("·").map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer transition-colors"
                        onClick={() => showToast(`Filter genre: ${g.trim()}`)}
                      >
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. INTERACTIVE MULTI-TAB NAVIGATOR */}
          <section className="bg-[#121824] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            {/* Tab Headers */}
            <div className="grid grid-cols-3 border-b border-white/10 text-xs font-bold bg-[#0D121E]">
              <button
                onClick={() => setMangaDetailTab("chapters")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  mangaDetailTab === "chapters"
                    ? "text-rose-400 bg-rose-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Daftar Chapter ({selectedManga.totalChapters})</span>
                {mangaDetailTab === "chapters" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                )}
              </button>

              <button
                onClick={() => setMangaDetailTab("info")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  mangaDetailTab === "info"
                    ? "text-rose-400 bg-rose-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Info & Statistik</span>
                {mangaDetailTab === "info" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                )}
              </button>

              <button
                onClick={() => setMangaDetailTab("similar")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  mangaDetailTab === "similar"
                    ? "text-rose-400 bg-rose-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Manga Serupa</span>
                {mangaDetailTab === "similar" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: CHAPTERS WITH SEARCH, SORT, AND FILTER */}
            {mangaDetailTab === "chapters" && (
              <div className="p-4 space-y-3">
                {/* Search Bar & Order Controls */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                  {/* Instant Chapter Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                      placeholder="Cari nomor chapter (misal: 42, 10)..."
                      className="w-full bg-[#0A0E18] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    {chapterSearchQuery && (
                      <button
                        onClick={() => setChapterSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Layout & Sort Toggle Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChapterSortDesc(!chapterSortDesc)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                      title="Urutkan Chapter"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>{chapterSortDesc ? "Terbaru" : "Terlama"}</span>
                    </button>

                    <button
                      onClick={() => setChapterLayoutGrid(!chapterLayoutGrid)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                      title={chapterLayoutGrid ? "Mode List" : "Mode Grid"}
                    >
                      {chapterLayoutGrid ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Chapter Quick Jump Helpers */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Ditemukan <strong className="text-white">{filteredChapters.length}</strong> chapter</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const allRead = Object.keys(chapterReadStatus).length === selectedManga.totalChapters;
                        const newStatus: Record<number, boolean> = {};
                        if (!allRead) {
                          for (let i = 1; i <= selectedManga.totalChapters; i++) newStatus[i] = true;
                        }
                        setChapterReadStatus(newStatus);
                        showToast(!allRead ? "Semua chapter ditandai dibaca" : "Status baca direset");
                      }}
                      className="text-rose-400 hover:underline"
                    >
                      Tandai Semua Dibaca
                    </button>
                  </div>
                </div>

                {/* Chapters List / Grid Rendering */}
                {filteredChapters.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada chapter yang cocok dengan kata kunci &quot;{chapterSearchQuery}&quot;
                  </div>
                ) : chapterLayoutGrid ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredChapters.map((ch) => (
                      <button
                        key={ch.number}
                        onClick={() => {
                          setActiveReaderChapter(ch.number);
                          setChapterReadStatus(prev => ({ ...prev, [ch.number]: true }));
                          setReaderOpen(true);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all hover:border-rose-500/60 ${
                          ch.isRead
                            ? "bg-[#0A0E18]/60 border-white/5 text-slate-400"
                            : "bg-[#141A28] border-white/10 text-white font-semibold"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-300">Ch. {ch.number}</span>
                          {ch.isRead && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-slate-500">{ch.date}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredChapters.map((ch) => (
                      <div
                        key={ch.number}
                        onClick={() => {
                          setActiveReaderChapter(ch.number);
                          setChapterReadStatus(prev => ({ ...prev, [ch.number]: true }));
                          setReaderOpen(true);
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:border-rose-500/50 hover:bg-[#161F30] ${
                          ch.isRead
                            ? "bg-[#0B0F1A] border-white/5 text-slate-400"
                            : "bg-[#141A28] border-white/10 text-white font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            ch.isRead ? "bg-white/5 text-slate-500" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {ch.number}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-xs font-semibold truncate ${ch.isRead ? "text-slate-400" : "text-white"}`}>
                              {selectedManga.title} {ch.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{ch.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {ch.isRead && (
                            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                              Sudah Dibaca
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Mengunduh ${ch.title}...`);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            title="Download Chapter"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: INFO & STATISTIK */}
            {mangaDetailTab === "info" && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0B0F1A] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Skor Komik</span>
                    <h4 className="text-lg font-black text-amber-400 mt-1 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {selectedManga.rating} / 5.0
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Berdasarkan 12.480 pembaca</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0F1A] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status Seri</span>
                    <h4 className="text-lg font-black text-emerald-400 mt-1">{selectedManga.status}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Rilis berkala tiap minggu</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0F1A] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Format</span>
                    <h4 className="text-lg font-black text-rose-300 mt-1">{selectedManga.type}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Full Color Webtoon</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0F1A] border border-white/5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Server Sumber</span>
                    <h4 className="text-lg font-black text-sky-400 mt-1">{selectedManga.source}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">DoH Cloudflare Aktif</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F1A] border border-white/5 space-y-2 text-xs">
                  <h4 className="font-bold text-white mb-2">Informasi Metadata Lengkap</h4>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Judul Asli</span>
                    <span className="text-white font-medium">{selectedManga.title}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Penulis (Author)</span>
                    <span className="text-white font-medium">{selectedManga.author}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Ilustrator (Artist)</span>
                    <span className="text-white font-medium">{selectedManga.artist}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Estimasi Waktu Baca</span>
                    <span className="text-white font-medium">~7 jam 15 menit</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Arah Baca Bawaan</span>
                    <span className="text-rose-300 font-semibold">Webtoon Scroll Vertikal</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MANGA SERUPA */}
            {mangaDetailTab === "similar" && (
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SAMPLE_MANGAS.filter(m => m.id !== selectedManga.id).map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => {
                        setSelectedManga(manga);
                        showToast(`Beralih ke ${manga.title}`);
                      }}
                      className="group p-2.5 rounded-xl bg-[#0B0F1A] border border-white/5 hover:border-rose-500/50 cursor-pointer transition-all"
                    >
                      <div className="aspect-[3/4] rounded-lg overflow-hidden relative mb-2">
                        <img
                          src={manga.coverImage}
                          alt={manga.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-amber-300">
                          {manga.latestChapter}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-rose-300 truncate">
                        {manga.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{manga.genre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW MODE 3: DETAIL ANIME V1 REDESIGN */}
      {viewMode === "anime_detail_v1" && (
        <main className="max-w-4xl mx-auto px-4 pt-2 space-y-4">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between py-1">
            <button
              onClick={() => setViewMode("home")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                Detail Anime V1 Redesigned
              </span>
            </div>
          </div>

          {/* 1. COMPACT FLOATING CINEMATIC HERO HEADER */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#101E25]/90 via-[#0C151B] to-[#0A0E18] p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
            {/* Ambient Background Blur Glow */}
            <div
              className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[110px] opacity-25 pointer-events-none"
              style={{ backgroundImage: `url(${selectedAnime.coverImage})` }}
            />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row gap-5 items-start">
              {/* Anime Poster with HD Badge */}
              <div className="relative w-32 sm:w-44 aspect-[3/4.4] rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/15 mx-auto sm:mx-0">
                <img
                  src={selectedAnime.coverImage}
                  alt={selectedAnime.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-extrabold tracking-wider border border-emerald-400/40">
                  FHD 1080P
                </span>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Star className="w-3 h-3 fill-amber-300" />
                    {selectedAnime.rating}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[9px]">
                    {selectedAnime.status}
                  </span>
                </div>
              </div>

              {/* Title, Meta Tags, and Actions */}
              <div className="flex-1 w-full min-w-0">
                {/* Meta Chips */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Studio: {selectedAnime.studio}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                    Musim: {selectedAnime.season}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {selectedAnime.broadcastSchedule}
                  </span>
                </div>

                {/* Anime Title */}
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                  {selectedAnime.title}
                </h1>
                {selectedAnime.japaneseTitle && (
                  <p className="text-xs text-slate-400 italic mt-0.5">
                    {selectedAnime.japaneseTitle}
                  </p>
                )}

                {/* Primary Watch CTA & Actions */}
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <button
                    onClick={() => {
                      setActivePlayerEpisode(1);
                      setPlayerOpen(true);
                      showToast(`Memutar Episode 1: ${selectedAnime.title}`);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Tonton Episode 1</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAnimeWatchlist(!isAnimeWatchlist);
                      showToast(!isAnimeWatchlist ? "Ditambahkan ke Daftar Tonton" : "Dihapus dari Daftar Tonton");
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isAnimeWatchlist
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isAnimeWatchlist ? "fill-emerald-400" : ""}`} />
                    <span>{isAnimeWatchlist ? "Tersimpan" : "Watchlist"}</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast("Pratinjau trailer resmi dimulai...");
                      setPlayerOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Trailer</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast("Tautan anime disalin ke clipboard!");
                    }}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Bagikan"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Focused Synopsis with Smooth Expand/Collapse */}
                <div className="mt-4 pt-3.5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Sinopsis Anime
                    </span>
                    <button
                      onClick={() => setAnimeSynopsisExpanded(!animeSynopsisExpanded)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
                    >
                      {animeSynopsisExpanded ? (
                        <>Ringkas <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Baca Selengkapnya <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>

                  <p
                    className={`text-xs text-slate-300 leading-relaxed font-normal transition-all duration-300 ${
                      animeSynopsisExpanded ? "" : "line-clamp-2"
                    }`}
                  >
                    {selectedAnime.synopsis}
                  </p>

                  {/* Genre Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedAnime.genre.split("·").map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer transition-colors"
                        onClick={() => showToast(`Filter genre: ${g.trim()}`)}
                      >
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. INTERACTIVE MULTI-TAB NAVIGATOR */}
          <section className="bg-[#121824] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            {/* Tab Headers */}
            <div className="grid grid-cols-3 border-b border-white/10 text-xs font-bold bg-[#0D121E]">
              <button
                onClick={() => setAnimeDetailTab("episodes")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  animeDetailTab === "episodes"
                    ? "text-emerald-400 bg-emerald-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Daftar Episode ({selectedAnime.totalEpisodes})</span>
                {animeDetailTab === "episodes" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setAnimeDetailTab("server")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  animeDetailTab === "server"
                    ? "text-emerald-400 bg-emerald-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Server & Kualitas</span>
                {animeDetailTab === "server" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setAnimeDetailTab("details")}
                className={`py-3.5 px-4 text-center transition-all relative ${
                  animeDetailTab === "details"
                    ? "text-emerald-400 bg-emerald-500/10 font-black"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>Jadwal & Info</span>
                {animeDetailTab === "details" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            {/* TAB CONTENT 1: EPISODES WITH BATCH SELECTOR & SEARCH */}
            {animeDetailTab === "episodes" && (
              <div className="p-4 space-y-3">
                {/* Batch Selector Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] text-slate-400 font-semibold shrink-0">Rentang:</span>
                  {[
                    { id: "all", label: "Semua Episode" },
                    { id: "1-12", label: "Episode 1 - 12" },
                    { id: "13-24", label: "Episode 13 - 24" },
                    { id: "25+", label: "Episode 25+" }
                  ].map((batch) => (
                    <button
                      key={batch.id}
                      onClick={() => setEpisodeBatchFilter(batch.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                        episodeBatchFilter === batch.id
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {batch.label}
                    </button>
                  ))}
                </div>

                {/* Episode Search & Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={episodeSearchQuery}
                      onChange={(e) => setEpisodeSearchQuery(e.target.value)}
                      placeholder="Cari nomor atau judul episode..."
                      className="w-full bg-[#0A0E18] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    {episodeSearchQuery && (
                      <button
                        onClick={() => setEpisodeSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setEpisodeSortDesc(!episodeSortDesc)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{episodeSortDesc ? "Terbaru Duluan" : "Episode 1 Duluan"}</span>
                  </button>
                </div>

                {/* Episode Cards Grid */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredEpisodes.map((ep) => (
                    <div
                      key={ep.number}
                      onClick={() => {
                        setActivePlayerEpisode(ep.number);
                        setPlayerOpen(true);
                      }}
                      className="group p-3 rounded-2xl bg-[#0B0F1A] border border-white/5 hover:border-emerald-500/50 hover:bg-[#111926] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-3.5"
                    >
                      {/* Video Thumbnail with duration overlay */}
                      <div className="relative w-full sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-black">
                        <img
                          src={ep.thumbnail}
                          alt={ep.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded text-white backdrop-blur-sm">
                          {ep.duration}
                        </span>

                        {/* Watched Progress Bar */}
                        {ep.progressPercent !== undefined && ep.progressPercent > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${ep.progressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Episode Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-emerald-400">
                            Episode {ep.number}
                          </span>
                          <span className="text-[10px] text-slate-500">· {ep.date}</span>
                          {ep.progressPercent === 100 && (
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                              Sudah Ditonton
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {ep.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          Tersedia dalam resolusi 1080p, 720p, dan 480p dengan subtitle Bahasa Indonesia resmi.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showToast(`Mengunduh Video Episode ${ep.number}...`);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                          title="Unduh Episode"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SERVER & KUALITAS STREAMING */}
            {animeDetailTab === "server" && (
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Pilih Server Pemutaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { name: "Server Alpha (Fast CDN)", speed: "Super Cepat", ping: "24 ms" },
                      { name: "Server Beta (Direct Mirror)", speed: "Stabil", ping: "45 ms" },
                      { name: "Server Mega (Google Stream)", speed: "Alternatif", ping: "68 ms" }
                    ].map((srv) => (
                      <button
                        key={srv.name}
                        onClick={() => {
                          setSelectedServer(srv.name);
                          showToast(`Server diubah ke ${srv.name}`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedServer === srv.name
                            ? "bg-emerald-500/20 border-emerald-500 text-white"
                            : "bg-[#0B0F1A] border-white/5 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{srv.name}</span>
                          {selectedServer === srv.name && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                          <span>{srv.speed}</span>
                          <span className="text-emerald-400 font-semibold">{srv.ping}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Resolusi Video Bawaan
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {["1080p Ultra HD", "720p HD", "480p SD", "360p Hemat"].map((res) => (
                      <button
                        key={res}
                        onClick={() => {
                          setSelectedResolution(res);
                          showToast(`Resolusi diubah ke ${res}`);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                          selectedResolution === res
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                            : "bg-[#0B0F1A] border-white/5 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F1A] border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h5 className="font-bold text-white">Audio & Subtitle</h5>
                      <p className="text-[11px] text-slate-400">Bahasa Jepang (Original) · Subtitle Indonesia Terverifikasi</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                    Softsub Aktif
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: JADWAL & INFO */}
            {animeDetailTab === "details" && (
              <div className="p-5 space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#0B0F1A] border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white">Jadwal Penayangan Episode Baru</h4>
                      <p className="text-[11px] text-slate-300">{selectedAnime.broadcastSchedule}</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    On Schedule
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0F1A] border border-white/5 space-y-2">
                  <h4 className="font-bold text-white mb-2">Informasi Produksi & Staf</h4>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Studio Animasi</span>
                    <span className="text-white font-medium">{selectedAnime.studio}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Musim Rilis</span>
                    <span className="text-white font-medium">{selectedAnime.season}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Durasi Per Episode</span>
                    <span className="text-white font-medium">~24 Menit</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Format Tayang</span>
                    <span className="text-white font-medium">TV Series (Simulcast)</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* WEBTOON READER MODAL */}
      {readerOpen && (
        <div className="fixed inset-0 z-50 bg-[#080B12] flex flex-col">
          <header className="px-4 py-3 bg-[#080B12]/95 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <button
                onClick={() => setReaderOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{selectedManga.title}</h4>
                <p className="text-xs text-rose-400">Chapter {activeReaderChapter}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Mode: Webtoon Scroll</span>
              <button
                onClick={() => setReaderOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full p-2 space-y-2 bg-black">
            {[1, 2, 3, 4, 5].map((pageNum) => (
              <div
                key={pageNum}
                className="relative w-full aspect-[2/3] bg-[#121824] rounded-lg overflow-hidden border border-white/5 flex items-center justify-center"
              >
                <img
                  src={selectedManga.coverImage}
                  alt={`Halaman ${pageNum}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white">
                  Halaman {pageNum} / 5 · Ch. {activeReaderChapter}
                </span>
              </div>
            ))}
          </div>

          <footer className="p-3 bg-[#080B12]/95 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 max-w-2xl mx-auto w-full">
            <button
              onClick={() => {
                if (activeReaderChapter > 1) {
                  setActiveReaderChapter(activeReaderChapter - 1);
                  showToast(`Chapter ${activeReaderChapter - 1} dimuat`);
                }
              }}
              disabled={activeReaderChapter <= 1}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 disabled:opacity-30 text-white font-medium hover:bg-white/10"
            >
              Chapter Sebelumnya
            </button>

            <span className="text-slate-400">Ch. {activeReaderChapter} dari {selectedManga.totalChapters}</span>

            <button
              onClick={() => {
                if (activeReaderChapter < selectedManga.totalChapters) {
                  setActiveReaderChapter(activeReaderChapter + 1);
                  showToast(`Chapter ${activeReaderChapter + 1} dimuat`);
                }
              }}
              disabled={activeReaderChapter >= selectedManga.totalChapters}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 disabled:opacity-30 text-white font-medium hover:bg-rose-500 shadow-lg shadow-rose-600/30"
            >
              Chapter Selanjutnya
            </button>
          </footer>
        </div>
      )}

      {/* ANIME VIDEO STREAMING PLAYER MODAL */}
      {playerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-center items-center p-4 backdrop-blur-md">
          <div className="max-w-3xl w-full bg-[#121824] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="min-w-0 pr-4">
                <h4 className="text-sm font-bold text-white truncate">{selectedAnime.title}</h4>
                <p className="text-xs text-emerald-400">Episode {activePlayerEpisode} · {selectedResolution}</p>
              </div>
              <button
                onClick={() => setPlayerOpen(false)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedAnime.coverImage}
                alt="Player"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                <button
                  onClick={() => showToast("Pemutaran video streaming dimulai!")}
                  className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/50 transition-transform active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
                <span className="text-xs text-white bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                  Klik untuk Streaming ({selectedServer})
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 bg-[#0C121D]">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-emerald-400" />
                <span>{selectedServer}</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  {selectedResolution}
                </span>
                <span className="px-2.5 py-1 rounded bg-white/10 text-slate-300">
                  Sub Indo Resmi
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
