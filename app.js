const STORAGE_KEY = "utadeck_songs_v1";
const HISTORY_DATE = () => new Date().toISOString();

const TAGS = {
  mood: ["盛り上げ", "エモい", "バラード", "ネタ", "無難", "締め", "かっこいい", "かわいい", "懐メロ", "最新曲"],
  scene: ["友達", "職場", "初対面", "デート", "ヒトカラ", "二次会"],
};

const SAMPLE_SONGS = [
  {
    id: crypto.randomUUID(),
    title: "小さな恋のうた",
    artist: "MONGOL800",
    myKey: 0,
    originalKeyComfort: "まあまあ",
    skill: "A",
    hype: 5,
    difficulty: 3,
    strain: "中",
    moodTags: ["盛り上げ", "無難"],
    sceneTags: ["友達", "二次会"],
    memo: "サビで声を前に出す",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
  {
    id: crypto.randomUUID(),
    title: "奏",
    artist: "スキマスイッチ",
    myKey: -2,
    originalKeyComfort: "きつい",
    skill: "B",
    hype: 2,
    difficulty: 4,
    strain: "中",
    moodTags: ["バラード", "エモい"],
    sceneTags: ["デート", "ヒトカラ"],
    memo: "ラスサビ前は息継ぎ意識",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
  {
    id: crypto.randomUUID(),
    title: "チェリー",
    artist: "スピッツ",
    myKey: -1,
    originalKeyComfort: "余裕",
    skill: "S",
    hype: 3,
    difficulty: 2,
    strain: "低",
    moodTags: ["無難", "懐メロ"],
    sceneTags: ["友達", "職場", "初対面"],
    memo: "安定曲。喉が疲れても歌える",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
  {
    id: crypto.randomUUID(),
    title: "夜に駆ける",
    artist: "YOASOBI",
    myKey: -4,
    originalKeyComfort: "無理",
    skill: "練習中",
    hype: 4,
    difficulty: 5,
    strain: "高",
    moodTags: ["最新曲", "かっこいい"],
    sceneTags: ["ヒトカラ"],
    memo: "Aメロの子音を明瞭に",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
  {
    id: crypto.randomUUID(),
    title: "HANABI",
    artist: "Mr.Children",
    myKey: -3,
    originalKeyComfort: "まあまあ",
    skill: "A",
    hype: 3,
    difficulty: 3,
    strain: "低",
    moodTags: ["無難", "締め"],
    sceneTags: ["職場", "初対面", "二次会"],
    memo: "最後のロングトーン丁寧に",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
];

const state = {
  songs: [],
  activeView: "home",
  filters: { q: "", artist: "", tag: "", skill: "", key: "" },
  selectedSongId: null,
  randomSongId: null,
};

const views = {
  home: document.getElementById("home"),
  list: document.getElementById("list"),
  add: document.getElementById("add"),
  scene: document.getElementById("scene"),
  random: document.getElementById("random"),
  detail: document.getElementById("detail"),
};

document.getElementById("todayDate").textContent = new Date().toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

init();

function init() {
  const saved = localStorage.getItem(STORAGE_KEY);
  state.songs = saved ? JSON.parse(saved) : SAMPLE_SONGS;
  persist();
  wireNav();
  renderAll();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.songs));
}

function wireNav() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
}

function setView(view) {
  state.activeView = view;
  Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === view));
  document.querySelectorAll(".nav-btn").forEach((n) => n.classList.toggle("active", n.dataset.view === view));
  if (view !== "detail") state.selectedSongId = null;
  renderAll();
}

function renderAll() {
  renderHome();
  renderList();
  renderAdd();
  renderScene();
  renderRandom();
  renderDetail();
}

function renderHome() {
  const todayCount = state.songs.reduce((n, s) => n + s.history.filter((h) => isToday(h)).length, 0);
  const recent = state.songs
    .flatMap((s) => s.history.map((h) => ({ title: s.title, artist: s.artist, at: h })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 5);

  views.home.innerHTML = `
    <article class="card">
      <h2>🎤 UtaDeck</h2>
      <p class="sub">持ち歌をカードで管理して、次に歌う1曲をすぐ決めよう。</p>
      <div class="stat-grid">
        <div class="stat"><span>登録曲数</span><strong>${state.songs.length}</strong></div>
        <div class="stat"><span>今日歌った曲</span><strong>${todayCount}</strong></div>
      </div>
    </article>

    <article class="card">
      <h3>クイック操作</h3>
      <div class="actions">
        <button class="btn-gradient" data-jump="add">曲を追加</button>
        <button class="btn-subtle" data-jump="list">持ち歌一覧</button>
        <button class="btn-subtle" data-jump="scene">シーンで選ぶ</button>
        <button class="btn-subtle" data-jump="random">ランダム選曲</button>
      </div>
    </article>

    <article class="card">
      <h3>最近歌った曲</h3>
      ${recent.length ? recent.map((r) => `<div class="recent-item">${r.title} / ${r.artist}<div class="sub">${fmt(r.at)}</div></div>`).join("") : `<div class="empty">まだ歌唱履歴がありません。</div>`}
    </article>
  `;

  views.home.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.jump)));
}

function renderList() {
  const songs = filterSongs();
  views.list.innerHTML = `
    <article class="card">
      <h2>持ち歌一覧</h2>
      <input id="fQ" placeholder="曲名検索" value="${state.filters.q}" />
      <input id="fArtist" placeholder="アーティスト検索" value="${state.filters.artist}" />
      <div class="row">
        <select id="fTag"><option value="">タグ絞り込み</option>${[...TAGS.mood, ...TAGS.scene].map((t) => `<option ${state.filters.tag === t ? "selected" : ""}>${t}</option>`).join("")}</select>
        <select id="fSkill"><option value="">得意度</option>${["S", "A", "B", "C", "練習中"].map((s) => `<option ${state.filters.skill === s ? "selected" : ""}>${s}</option>`).join("")}</select>
        <input id="fKey" type="number" min="-12" max="12" placeholder="キー" value="${state.filters.key}" />
      </div>
    </article>

    <section class="list-grid">
      ${songs.length ? songs.map(songCard).join("") : emptyState()}
    </section>
  `;

  ["fQ", "fArtist", "fTag", "fSkill", "fKey"].forEach((id) => {
    views.list.querySelector(`#${id}`).addEventListener("input", (e) => {
      const map = { fQ: "q", fArtist: "artist", fTag: "tag", fSkill: "skill", fKey: "key" };
      state.filters[map[id]] = e.target.value;
      renderList();
    });
  });

  bindSongCardActions(views.list);
}

function renderAdd(song = null) {
  const isEdit = !!song;
  views.add.innerHTML = `
    <article class="card">
      <h2>${isEdit ? "曲を編集" : "曲を追加"}</h2>
      <form id="songForm">
        ${input("title", "曲名 *", song?.title || "", "text")}
        <small class="error" id="errTitle"></small>
        ${input("artist", "アーティスト", song?.artist || "", "text")}
        ${input("myKey", "自分のキー (-12〜+12)", song?.myKey ?? 0, "number", { min: -12, max: 12 })}
        <small class="error" id="errKey"></small>
        ${select("originalKeyComfort", "原キーで歌えるか", ["余裕", "まあまあ", "きつい", "無理"], song?.originalKeyComfort || "まあまあ")}
        ${select("skill", "得意度", ["S", "A", "B", "C", "練習中"], song?.skill || "B")}
        ${input("hype", "盛り上がり度 (1〜5)", song?.hype ?? 3, "number", { min: 1, max: 5 })}
        <small class="error" id="errHype"></small>
        ${input("difficulty", "難易度 (1〜5)", song?.difficulty ?? 3, "number", { min: 1, max: 5 })}
        <small class="error" id="errDifficulty"></small>
        ${select("strain", "声の消耗度", ["低", "中", "高"], song?.strain || "中")}
        ${multiSelect("moodTags", "雰囲気タグ", TAGS.mood, song?.moodTags || [])}
        ${multiSelect("sceneTags", "シーンタグ", TAGS.scene, song?.sceneTags || [])}
        <label for="memo">メモ</label>
        <textarea id="memo">${song?.memo || ""}</textarea>
        <button class="btn-gradient" type="submit">${isEdit ? "更新する" : "保存する"}</button>
      </form>
    </article>
  `;

  views.add.querySelector("#songForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = formData(song?.id);
    if (!validate(data)) return;

    if (isEdit) {
      const idx = state.songs.findIndex((s) => s.id === song.id);
      state.songs[idx] = { ...state.songs[idx], ...data, updatedAt: HISTORY_DATE() };
      setView("detail");
      state.selectedSongId = song.id;
    } else {
      state.songs.unshift({ ...data, id: crypto.randomUUID(), history: [], createdAt: HISTORY_DATE(), updatedAt: HISTORY_DATE() });
      setView("list");
    }

    persist();
    renderAll();
  });
}

function renderDetail() {
  const song = state.songs.find((s) => s.id === state.selectedSongId);
  if (!song) {
    views.detail.innerHTML = `<article class="card"><p class="sub">曲が選択されていません。</p></article>`;
    return;
  }

  views.detail.innerHTML = `
    <article class="card">
      <h2>${song.title}</h2>
      <p class="sub">${song.artist || "アーティスト未登録"}</p>
      <div class="row">
        <span class="badge key">Key ${song.myKey >= 0 ? "+" : ""}${song.myKey}</span>
        <span class="badge skill">得意度 ${song.skill}</span>
        <span class="badge ${strainClass(song.strain)}">消耗 ${song.strain}</span>
      </div>
      <p>原キーで歌えるか: ${song.originalKeyComfort}</p>
      <p>盛り上がり度: ${song.hype} / 難易度: ${song.difficulty}</p>
      <p>雰囲気タグ</p><div class="chips">${song.moodTags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      <p>シーンタグ</p><div class="chips">${song.sceneTags.map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      <p>メモ</p><div class="sub">${song.memo || "-"}</div>
      <h3>歌唱履歴</h3>
      ${song.history.length ? song.history.slice().reverse().map((d) => `<div class="recent-item">${fmt(d)}</div>`).join("") : `<div class="sub">まだ履歴がありません</div>`}
      <div class="actions" style="margin-top: 10px;">
        <button id="markToday" class="btn-gradient">今日歌った</button>
        <button id="editSong" class="btn-subtle">編集</button>
        <button id="deleteSong" class="danger">削除</button>
      </div>
    </article>
  `;

  views.detail.querySelector("#markToday").addEventListener("click", () => {
    song.history.push(HISTORY_DATE());
    song.updatedAt = HISTORY_DATE();
    persist();
    renderAll();
  });

  views.detail.querySelector("#editSong").addEventListener("click", () => {
    setView("add");
    renderAdd(song);
  });

  views.detail.querySelector("#deleteSong").addEventListener("click", () => confirmDelete(song.id));
}

function renderScene() {
  views.scene.innerHTML = `
    <article class="card">
      <h2>シーンで選ぶ</h2>
      ${select("sceneNow", "今の場面", TAGS.scene, "友達")}
      ${select("moodNow", "今の気分", ["盛り上げたい", "しっとり歌いたい", "無難にいきたい", "かっこよく歌いたい", "ネタに走りたい", "締めたい"], "盛り上げたい")}
      ${select("throat", "今日の喉の調子", ["高音いける", "普通", "喉きつい", "低めだけにしたい"], "普通")}
      <button id="runScene" class="btn-gradient">おすすめ表示</button>
    </article>
    <section id="sceneResult" class="list-grid"></section>
  `;

  views.scene.querySelector("#runScene").addEventListener("click", () => {
    const cond = {
      scene: views.scene.querySelector("#sceneNow").value,
      mood: views.scene.querySelector("#moodNow").value,
      throat: views.scene.querySelector("#throat").value,
    };
    const ranked = rankByScene(cond).slice(0, 10);
    views.scene.querySelector("#sceneResult").innerHTML = ranked.length ? ranked.map(songCard).join("") : emptyState("条件に合う曲が見つかりませんでした。");
    bindSongCardActions(views.scene);
  });
}

function renderRandom() {
  views.random.innerHTML = `
    <article class="card">
      <h2>ランダム選曲</h2>
      ${select("randomType", "条件", ["すべての曲から", "得意曲だけ", "盛り上げ曲だけ", "バラードだけ", "最近歌っていない曲だけ", "喉に優しい曲だけ"], "すべての曲から")}
      <button id="drawRandom" class="btn-gradient">1曲引く</button>
    </article>
    <section id="randomResult"></section>
  `;

  views.random.querySelector("#drawRandom").addEventListener("click", drawRandom);
}

function drawRandom() {
  const type = views.random.querySelector("#randomType").value;
  let pool = [...state.songs];
  if (type === "得意曲だけ") pool = pool.filter((s) => ["S", "A"].includes(s.skill));
  if (type === "盛り上げ曲だけ") pool = pool.filter((s) => s.hype >= 4 || s.moodTags.includes("盛り上げ"));
  if (type === "バラードだけ") pool = pool.filter((s) => s.moodTags.includes("バラード"));
  if (type === "最近歌っていない曲だけ") pool = pool.filter((s) => !s.history.length || daysSince(lastHistory(s)) >= 7);
  if (type === "喉に優しい曲だけ") pool = pool.filter((s) => s.strain === "低");

  const box = views.random.querySelector("#randomResult");
  if (!pool.length) {
    box.innerHTML = emptyState("候補がありません。条件を変えてみてください。");
    return;
  }

  const song = pool[Math.floor(Math.random() * pool.length)];
  state.randomSongId = song.id;
  box.innerHTML = `
    <article class="card">
      <h3>🎯 ${song.title}</h3>
      <p class="sub">${song.artist || "-"}</p>
      <div class="row">
        <span class="badge key">Key ${song.myKey >= 0 ? "+" : ""}${song.myKey}</span>
        <span class="badge skill">得意度 ${song.skill}</span>
      </div>
      <div class="actions" style="margin-top: 12px;">
        <button id="redraw" class="btn-subtle">もう一回引く</button>
        <button id="markRandom" class="btn-gradient">今日歌った</button>
        <button id="seeDetail" class="btn-subtle">詳細を見る</button>
      </div>
    </article>
  `;

  box.querySelector("#redraw").addEventListener("click", drawRandom);
  box.querySelector("#markRandom").addEventListener("click", () => {
    song.history.push(HISTORY_DATE());
    song.updatedAt = HISTORY_DATE();
    persist();
    drawRandom();
  });
  box.querySelector("#seeDetail").addEventListener("click", () => {
    state.selectedSongId = song.id;
    setView("detail");
  });
}

function rankByScene(cond) {
  const moodMap = {
    盛り上げたい: "盛り上げ",
    しっとり歌いたい: "バラード",
    無難にいきたい: "無難",
    かっこよく歌いたい: "かっこいい",
    ネタに走りたい: "ネタ",
    締めたい: "締め",
  };

  return [...state.songs]
    .map((s) => {
      let score = 0;
      if (s.sceneTags.includes(cond.scene)) score += 30;
      if (s.moodTags.includes(moodMap[cond.mood])) score += 25;
      score += ({ S: 20, A: 16, B: 11, C: 7, 練習中: 3 }[s.skill] || 0);
      score += ({ 低: 12, 中: 7, 高: 2 }[s.strain] || 0);
      if (cond.throat === "喉きつい" && s.strain === "高") score -= 25;
      if (cond.throat === "低めだけにしたい" && s.myKey > 0) score -= 8;
      if (cond.mood === "盛り上げたい") score += s.hype * 2;
      if (cond.mood === "締めたい" && s.moodTags.includes("締め")) score += 10;
      return { ...s, score };
    })
    .sort((a, b) => b.score - a.score);
}

function filterSongs() {
  return state.songs.filter((s) => {
    const tagOk = !state.filters.tag || [...s.moodTags, ...s.sceneTags].includes(state.filters.tag);
    const keyOk = !state.filters.key || Number(s.myKey) === Number(state.filters.key);
    return s.title.toLowerCase().includes(state.filters.q.toLowerCase()) &&
      (s.artist || "").toLowerCase().includes(state.filters.artist.toLowerCase()) &&
      tagOk &&
      (!state.filters.skill || s.skill === state.filters.skill) &&
      keyOk;
  });
}

function songCard(s) {
  return `
    <article class="card" data-song-id="${s.id}">
      <div class="song-title">${s.title}</div>
      <div class="sub">${s.artist || "アーティスト未登録"}</div>
      <div class="row">
        <span class="badge key">Key ${s.myKey >= 0 ? "+" : ""}${s.myKey}</span>
        <span class="badge skill">${s.skill}</span>
        <span class="badge ${strainClass(s.strain)}">消耗 ${s.strain}</span>
      </div>
      <div class="chips" style="margin-top: 8px;">${s.moodTags.slice(0, 3).map((t) => `<span class="chip">${t}</span>`).join("")}</div>
      <div class="sub" style="margin-top: 8px;">最後に歌った日: ${s.history.length ? fmt(lastHistory(s)) : "未記録"}</div>
    </article>
  `;
}

function bindSongCardActions(root) {
  root.querySelectorAll("[data-song-id]").forEach((el) => {
    el.addEventListener("click", () => {
      state.selectedSongId = el.dataset.songId;
      setView("detail");
    });
  });
}

function formData(existingId = null) {
  return {
    id: existingId,
    title: v("title").trim(),
    artist: v("artist").trim(),
    myKey: Number(v("myKey")),
    originalKeyComfort: v("originalKeyComfort"),
    skill: v("skill"),
    hype: Number(v("hype")),
    difficulty: Number(v("difficulty")),
    strain: v("strain"),
    moodTags: checks("moodTags"),
    sceneTags: checks("sceneTags"),
    memo: v("memo").trim(),
  };
}

function validate(data) {
  ["errTitle", "errKey", "errHype", "errDifficulty"].forEach((id) => (views.add.querySelector(`#${id}`).textContent = ""));
  let ok = true;
  if (!data.title) {
    views.add.querySelector("#errTitle").textContent = "曲名は必須です。";
    ok = false;
  }
  if (Number.isNaN(data.myKey) || data.myKey < -12 || data.myKey > 12) {
    views.add.querySelector("#errKey").textContent = "キーは -12〜+12 で入力してください。";
    ok = false;
  }
  if (Number.isNaN(data.hype) || data.hype < 1 || data.hype > 5) {
    views.add.querySelector("#errHype").textContent = "盛り上がり度は1〜5です。";
    ok = false;
  }
  if (Number.isNaN(data.difficulty) || data.difficulty < 1 || data.difficulty > 5) {
    views.add.querySelector("#errDifficulty").textContent = "難易度は1〜5です。";
    ok = false;
  }
  return ok;
}

function confirmDelete(id) {
  const dialog = document.getElementById("confirmDialog");
  document.getElementById("confirmMessage").textContent = "この曲を削除しますか？";
  dialog.showModal();

  const close = () => dialog.close();
  document.getElementById("confirmCancel").onclick = close;
  document.getElementById("confirmOk").onclick = () => {
    state.songs = state.songs.filter((s) => s.id !== id);
    persist();
    close();
    setView("list");
  };
}

function input(id, labelText, value, type, attrs = {}) {
  const attrText = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ");
  return `<label for="${id}">${labelText}</label><input id="${id}" type="${type}" value="${escapeHtml(String(value))}" ${attrText} />`;
}

function select(id, labelText, options, value) {
  return `<label for="${id}">${labelText}</label><select id="${id}">${options.map((o) => `<option ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select>`;
}

function multiSelect(name, labelText, options, selected) {
  return `
    <label>${labelText}</label>
    <div class="chips">${options
      .map(
        (o, i) =>
          `<label class="chip"><input type="checkbox" id="${name}-${i}" name="${name}" value="${o}" ${
            selected.includes(o) ? "checked" : ""
          } />${o}</label>`
      )
      .join("")}</div>
  `;
}

function emptyState(text = "まだ持ち歌が登録されていません。<br>まずは1曲、よく歌う曲を登録してみましょう。<br>キーやメモを残しておくと、次のカラオケで迷わなくなります。") {
  return `<article class="card empty">${text}</article>`;
}

function v(id) {
  return views.add.querySelector(`#${id}`).value;
}

function checks(name) {
  return Array.from(views.add.querySelectorAll(`input[name='${name}']:checked`)).map((el) => el.value);
}

function fmt(d) {
  return new Date(d).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function lastHistory(song) {
  return song.history.slice().sort((a, b) => new Date(b) - new Date(a))[0];
}

function isToday(d) {
  const dt = new Date(d);
  const n = new Date();
  return dt.getFullYear() === n.getFullYear() && dt.getMonth() === n.getMonth() && dt.getDate() === n.getDate();
}

function daysSince(d) {
  if (!d) return Infinity;
  return (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24);
}

function strainClass(v) {
  return v === "低" ? "low" : v === "高" ? "high" : "mid";
}

function escapeHtml(str) {
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
