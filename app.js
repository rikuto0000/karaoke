const STORAGE_KEY = "utadeck_songs_v1";
const AI_SETTINGS_KEY = "utadeck_ai_settings_v1";
const HISTORY_DATE = () => new Date().toISOString();

const TAGS = {
  mood: ["盛り上げ", "エモい", "バラード", "ネタ", "無難", "締め", "かっこいい", "かわいい", "懐メロ", "最新曲"],
  scene: ["友達", "職場", "初対面", "デート", "ヒトカラ", "二次会"],
};

const DEFAULT_AI_SETTINGS = {
  provider: "heuristic", // heuristic | ollama
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "llama3.2:3b",
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
    lyricsSummary: "青春感のあるストレートなラブソング。",
    singingTips: "Aメロは軽く、サビで抜け感を意識。",
    autoTagReason: "青春・ライブ感の強いキーワードを優先。",
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
    lyricsSummary: "別れ際の切なさを丁寧に描くバラード。",
    singingTips: "語尾を短く切りすぎず、母音を残す。",
    autoTagReason: "切ない語彙とテンポ感からバラード系を選択。",
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
    lyricsSummary: "素朴で前向きな恋心を描く定番曲。",
    singingTips: "肩の力を抜いてリズム重視で歌う。",
    autoTagReason: "定番・親しみやすさから無難/懐メロを付与。",
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
    lyricsSummary: "疾走感ある物語性が魅力のアップテンポ曲。",
    singingTips: "ブレス位置を固定し、早口パートを先行発声。",
    autoTagReason: "新しさ・疾走感・難易度を重視して付与。",
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
    lyricsSummary: "余韻が残るメッセージ性の高いミドル曲。",
    singingTips: "終盤は響きを前に集めて伸ばす。",
    autoTagReason: "余韻・締め向きの印象語を優先。",
    history: [],
    createdAt: HISTORY_DATE(),
    updatedAt: HISTORY_DATE(),
  },
];

const state = {
  songs: [],
  aiSettings: { ...DEFAULT_AI_SETTINGS },
  activeView: "home",
  filters: { q: "", artist: "", tag: "", skill: "", key: "" },
  selectedSongId: null,
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
  const savedAiSettings = localStorage.getItem(AI_SETTINGS_KEY);
  const baseSongs = saved ? JSON.parse(saved) : SAMPLE_SONGS;

  state.songs = baseSongs.map(normalizeSong);
  state.aiSettings = savedAiSettings ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(savedAiSettings) } : { ...DEFAULT_AI_SETTINGS };

  persist();
  persistAISettings();
  wireNav();
  renderAll();
}

function normalizeSong(song) {
  return {
    ...song,
    artist: song.artist || "",
    myKey: Number(song.myKey ?? 0),
    originalKeyComfort: song.originalKeyComfort || "まあまあ",
    skill: song.skill || "B",
    hype: Number(song.hype ?? 3),
    difficulty: Number(song.difficulty ?? 3),
    strain: song.strain || "中",
    moodTags: Array.isArray(song.moodTags) ? song.moodTags : [],
    sceneTags: Array.isArray(song.sceneTags) ? song.sceneTags : [],
    memo: song.memo || "",
    lyricsSummary: song.lyricsSummary || "",
    singingTips: song.singingTips || "",
    autoTagReason: song.autoTagReason || "",
    history: Array.isArray(song.history) ? song.history : [],
    createdAt: song.createdAt || HISTORY_DATE(),
    updatedAt: song.updatedAt || HISTORY_DATE(),
  };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.songs));
}

function persistAISettings() {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(state.aiSettings));
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
      <p class="sub" style="margin-top:8px;">AIモード: ${state.aiSettings.provider === "ollama" ? `無料AI(Ollama:${escapeHtml(state.aiSettings.ollamaModel)})` : "簡易ロジック"}</p>
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

function renderAdd(song = null, draftOverride = null) {
  const isEdit = !!song;
  const draft = draftOverride || {
    title: song?.title || "",
    artist: song?.artist || "",
    myKey: song?.myKey ?? 0,
    originalKeyComfort: song?.originalKeyComfort || "まあまあ",
    skill: song?.skill || "B",
    hype: song?.hype ?? 3,
    difficulty: song?.difficulty ?? 3,
    strain: song?.strain || "中",
    moodTags: [...(song?.moodTags || [])],
    sceneTags: [...(song?.sceneTags || [])],
    memo: song?.memo || "",
    lyricsSummary: song?.lyricsSummary || "",
    singingTips: song?.singingTips || "",
    autoTagReason: song?.autoTagReason || "",
    lyricsInput: "",
  };

  views.add.innerHTML = `
    <article class="card">
      <h2>${isEdit ? "曲を編集" : "曲を追加"}</h2>
      <form id="songForm">
        <article class="card ai-config">
          <h3>無料AI設定</h3>
          ${select("aiProvider", "AI方式", ["heuristic", "ollama"], state.aiSettings.provider)}
          <label for="ollamaBaseUrl">Ollama URL</label>
          <input id="ollamaBaseUrl" value="${escapeHtml(state.aiSettings.ollamaBaseUrl)}" placeholder="http://localhost:11434" />
          <label for="ollamaModel">Ollamaモデル</label>
          <input id="ollamaModel" value="${escapeHtml(state.aiSettings.ollamaModel)}" placeholder="llama3.2:3b" />
          <p class="sub">※ ollama は無料で使えるローカルLLMです。未設定時は簡易ロジックに自動フォールバックします。</p>
        </article>

        ${input("title", "曲名 *", draft.title, "text")}
        <small class="error" id="errTitle"></small>
        ${input("artist", "アーティスト", draft.artist, "text")}
        ${input("myKey", "自分のキー (-12〜+12)", draft.myKey, "number", { min: -12, max: 12 })}
        <small class="error" id="errKey"></small>
        ${select("originalKeyComfort", "原キーで歌えるか", ["余裕", "まあまあ", "きつい", "無理"], draft.originalKeyComfort)}
        ${select("skill", "得意度", ["S", "A", "B", "C", "練習中"], draft.skill)}
        ${input("hype", "盛り上がり度 (1〜5)", draft.hype, "number", { min: 1, max: 5 })}
        <small class="error" id="errHype"></small>
        ${input("difficulty", "難易度 (1〜5)", draft.difficulty, "number", { min: 1, max: 5 })}
        <small class="error" id="errDifficulty"></small>
        ${select("strain", "声の消耗度", ["低", "中", "高"], draft.strain)}

        <label for="memo">メモ</label>
        <textarea id="memo">${escapeHtml(draft.memo)}</textarea>

        <label for="lyricsInput">歌詞を貼る（任意）</label>
        <textarea id="lyricsInput" placeholder="歌詞の一部を貼り付けてください（全文保存はされません）">${escapeHtml(draft.lyricsInput)}</textarea>
        <p class="sub">歌詞全文は保存されません。要約と歌い方メモのみ保存します。</p>

        <div class="actions">
          <button id="summarizeLyrics" type="button" class="btn-subtle">歌詞を要約する</button>
          <button id="autoTags" type="button" class="btn-subtle">曲名から客観タグ自動化</button>
        </div>
        <p class="sub">AIは客観情報（雰囲気タグ/シーンタグ/要約）のみ提案します。難易度・喉のキツさなど主観項目は手動入力してください。</p>

        <article class="card summary-card">
          <h3>要約結果</h3>
          <label for="lyricsSummary">歌詞要約</label>
          <textarea id="lyricsSummary" placeholder="要約結果が入ります">${escapeHtml(draft.lyricsSummary)}</textarea>
          <label for="singingTips">歌い方メモ</label>
          <textarea id="singingTips" placeholder="歌い方のポイント">${escapeHtml(draft.singingTips)}</textarea>
          <label for="autoTagReason">自動タグ理由</label>
          <textarea id="autoTagReason" placeholder="タグ付与理由">${escapeHtml(draft.autoTagReason)}</textarea>
        </article>

        ${multiSelect("moodTags", "雰囲気タグ", TAGS.mood, draft.moodTags)}
        ${multiSelect("sceneTags", "シーンタグ", TAGS.scene, draft.sceneTags)}

        <button class="btn-gradient" type="submit">${isEdit ? "更新する" : "保存する"}</button>
      </form>
    </article>
  `;

  views.add.querySelector("#summarizeLyrics").addEventListener("click", async (e) => {
    const nextDraft = collectDraftFromForm();
    syncAISettingsFromForm();
    setButtonBusy(e.currentTarget, true, "要約中...");

    try {
      const summarized = await summarizeLyricsWithAI(nextDraft.lyricsInput, state.aiSettings);
      nextDraft.lyricsSummary = summarized.lyricsSummary;
      nextDraft.singingTips = summarized.singingTips;
      if (summarized.reason) nextDraft.autoTagReason = summarized.reason;
    } catch (err) {
      const fallback = summarizeLyrics(nextDraft.lyricsInput);
      nextDraft.lyricsSummary = fallback.lyricsSummary;
      nextDraft.singingTips = fallback.singingTips;
      nextDraft.autoTagReason = `AI要約失敗のため簡易要約を使用: ${String(err.message || err)}`;
    }

    renderAdd(song, nextDraft);
  });

  views.add.querySelector("#autoTags").addEventListener("click", async (e) => {
    const nextDraft = collectDraftFromForm();
    if (!nextDraft.title.trim()) {
      nextDraft.autoTagReason = "曲名を入力してから自動化してください。";
      renderAdd(song, nextDraft);
      return;
    }

    syncAISettingsFromForm();
    setButtonBusy(e.currentTarget, true, "付与中...");

    try {
      const auto = await generateAutoTagsWithAI(nextDraft, state.aiSettings);
      nextDraft.moodTags = auto.moodTags;
      nextDraft.sceneTags = auto.sceneTags;
      nextDraft.autoTagReason = auto.autoTagReason;
    } catch (err) {
      const fallback = generateAutoTags(nextDraft);
      nextDraft.moodTags = fallback.moodTags;
      nextDraft.sceneTags = fallback.sceneTags;
      nextDraft.autoTagReason = `AIタグ失敗のため簡易タグを使用: ${String(err.message || err)}`;
    }

    renderAdd(song, nextDraft);
  });

  views.add.querySelector("#songForm").addEventListener("submit", (e) => {
    e.preventDefault();
    syncAISettingsFromForm();

    const data = formData(song?.id);
    if (!validate(data)) return;

    if (isEdit) {
      const idx = state.songs.findIndex((s) => s.id === song.id);
      state.songs[idx] = { ...state.songs[idx], ...data, updatedAt: HISTORY_DATE() };
      state.selectedSongId = song.id;
      setView("detail");
    } else {
      state.songs.unshift({ ...data, id: crypto.randomUUID(), history: [], createdAt: HISTORY_DATE(), updatedAt: HISTORY_DATE() });
      setView("list");
    }

    persist();
    renderAll();
  });
}

function syncAISettingsFromForm() {
  const providerEl = views.add.querySelector("#aiProvider");
  const baseEl = views.add.querySelector("#ollamaBaseUrl");
  const modelEl = views.add.querySelector("#ollamaModel");
  if (!providerEl || !baseEl || !modelEl) return;

  state.aiSettings = {
    provider: providerEl.value,
    ollamaBaseUrl: baseEl.value.trim() || DEFAULT_AI_SETTINGS.ollamaBaseUrl,
    ollamaModel: modelEl.value.trim() || DEFAULT_AI_SETTINGS.ollamaModel,
  };

  persistAISettings();
}

function setButtonBusy(btn, busy, label) {
  if (!btn) return;
  btn.disabled = busy;
  if (busy) btn.dataset.prevLabel = btn.textContent;
  btn.textContent = busy ? label : btn.dataset.prevLabel || btn.textContent;
}

function collectDraftFromForm() {
  return {
    title: views.add.querySelector("#title").value,
    artist: views.add.querySelector("#artist").value,
    myKey: Number(views.add.querySelector("#myKey").value),
    originalKeyComfort: views.add.querySelector("#originalKeyComfort").value,
    skill: views.add.querySelector("#skill").value,
    hype: Number(views.add.querySelector("#hype").value),
    difficulty: Number(views.add.querySelector("#difficulty").value),
    strain: views.add.querySelector("#strain").value,
    moodTags: checks("moodTags"),
    sceneTags: checks("sceneTags"),
    memo: views.add.querySelector("#memo").value,
    lyricsInput: views.add.querySelector("#lyricsInput").value,
    lyricsSummary: views.add.querySelector("#lyricsSummary").value,
    singingTips: views.add.querySelector("#singingTips").value,
    autoTagReason: views.add.querySelector("#autoTagReason").value,
  };
}

async function summarizeLyricsWithAI(lyricsInput, aiSettings) {
  if (aiSettings.provider !== "ollama") return summarizeLyrics(lyricsInput);

  const prompt = [
    "あなたはカラオケ練習アシスタントです。",
    "入力された歌詞の一部から、短い要約と歌唱アドバイスを作ってください。",
    "返答はJSONのみ。キーは lyricsSummary と singingTips。日本語で20〜80文字程度。",
    `歌詞入力: ${lyricsInput || ""}`,
  ].join("\n");

  const result = await callOllamaJSON(aiSettings, prompt);
  return {
    lyricsSummary: safeString(result.lyricsSummary) || summarizeLyrics(lyricsInput).lyricsSummary,
    singingTips: safeString(result.singingTips) || summarizeLyrics(lyricsInput).singingTips,
    reason: "無料AI (Ollama) で要約を生成しました。",
  };
}

async function generateAutoTagsWithAI(songInput, aiSettings) {
  if (aiSettings.provider !== "ollama") return generateAutoTags(songInput);

  const prompt = [
    "あなたはカラオケ選曲アシスタントです。曲の客観的な印象のみを判定してください。",
    `雰囲気タグ候補: ${TAGS.mood.join(",")}`,
    `シーンタグ候補: ${TAGS.scene.join(",")}`,
    "候補外のタグは使わないこと。",
    "JSONのみで返答。キーは moodTags(array), sceneTags(array), autoTagReason(string)。",
    `曲名:${songInput.title}`,
    `アーティスト:${songInput.artist}`,
    `歌詞要約:${songInput.lyricsSummary}`,
    "主観項目（難易度/喉のキツさ/得意度）は無視してください。",
  ].join("\n");

  const result = await callOllamaJSON(aiSettings, prompt);
  const moodTags = normalizeTags(result.moodTags, TAGS.mood);
  const sceneTags = normalizeTags(result.sceneTags, TAGS.scene);

  if (!moodTags.length || !sceneTags.length) return generateAutoTags(songInput);

  return {
    moodTags,
    sceneTags,
    autoTagReason: safeString(result.autoTagReason) || "無料AI (Ollama) が曲名などの客観情報から推定したタグ。",
  };
}

async function callOllamaJSON(aiSettings, prompt) {
  const url = `${aiSettings.ollamaBaseUrl.replace(/\/+$/, "")}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: aiSettings.ollamaModel,
      prompt,
      stream: false,
      format: "json",
      options: { temperature: 0.3 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status}`);
  }

  const payload = await res.json();
  if (!payload.response) throw new Error("Ollama response missing");
  return JSON.parse(payload.response);
}

function summarizeLyrics(lyricsInput) {
  const text = (lyricsInput || "").trim();
  if (!text) {
    return {
      lyricsSummary: "歌詞入力がないため要約できませんでした。",
      singingTips: "先に歌詞の一部を貼り付けてから要約してください。",
    };
  }

  const compact = text.replace(/\s+/g, " ");
  const emotionalWords = ["涙", "切ない", "愛", "恋", "さよなら", "孤独", "夢", "希望", "夜", "光"];
  const rhythmWords = ["走", "踊", "叫", "飛", "弾", "鼓動", "ビート", "テンポ"];

  const emoCount = emotionalWords.filter((w) => compact.includes(w)).length;
  const rhythmCount = rhythmWords.filter((w) => compact.includes(w)).length;

  const tone = emoCount >= 2 ? "感情表現が強く" : "言葉の流れが自然で";
  const speed = rhythmCount >= 2 ? "やや速めの展開" : "落ち着いた展開";

  return {
    lyricsSummary: `この歌詞は${tone}、${speed}が特徴です。主題を短いフレーズで伝える構成です。`,
    singingTips: `${rhythmCount >= 2 ? "子音を明瞭にしてリズムを先行" : "母音を丁寧に伸ばして抑揚を作る"}と歌いやすくなります。`,
  };
}

function generateAutoTags(songInput) {
  const text = [songInput.title, songInput.artist, songInput.lyricsSummary]
    .join(" ")
    .toLowerCase();

  const moodRules = [
    { tag: "バラード", words: ["バラード", "切ない", "涙", "静か", "別れ", "しっとり"] },
    { tag: "盛り上げ", words: ["盛り上", "アゲ", "party", "踊", "手拍子", "ジャンプ", "コール"] },
    { tag: "ネタ", words: ["ネタ", "ウケ", "笑", "ギャグ", "モノマネ"] },
    { tag: "締め", words: ["締め", "ラスト", "最後", "余韻"] },
    { tag: "かっこいい", words: ["ロック", "クール", "鋭", "疾走", "かっこ"] },
    { tag: "かわいい", words: ["かわいい", "キュート", "ポップ", "ふわ"] },
    { tag: "懐メロ", words: ["懐", "昭和", "90s", "定番"] },
    { tag: "最新曲", words: ["最新", "トレンド", "202", "new", "yoasobi", "ado"] },
    { tag: "エモい", words: ["エモ", "余情", "青春", "感傷", "夜"] },
    { tag: "無難", words: ["安定", "定番", "万人", "無難"] },
  ];

  const sceneRules = [
    { tag: "友達", words: ["友達", "仲間", "みんな", "盛り上"] },
    { tag: "職場", words: ["職場", "上司", "世代", "無難"] },
    { tag: "初対面", words: ["初対面", "万人", "安全", "無難"] },
    { tag: "デート", words: ["デート", "恋", "愛", "しっとり"] },
    { tag: "ヒトカラ", words: ["練習", "ヒトカラ", "挑戦", "高音"] },
    { tag: "二次会", words: ["二次会", "終盤", "締め", "乾杯"] },
  ];

  const moodTags = moodRules.filter((rule) => rule.words.some((w) => text.includes(w))).map((rule) => rule.tag);
  const sceneTags = sceneRules.filter((rule) => rule.words.some((w) => text.includes(w))).map((rule) => rule.tag);

  if (!moodTags.length) moodTags.push("無難");
  if (!sceneTags.length) sceneTags.push("友達");

  const normalizedMood = [...new Set(moodTags)].filter((t) => TAGS.mood.includes(t));
  const normalizedScene = [...new Set(sceneTags)].filter((t) => TAGS.scene.includes(t));

  return {
    moodTags: normalizedMood,
    sceneTags: normalizedScene,
    autoTagReason: `曲名/アーティスト/歌詞要約のキーワード一致により、雰囲気:${normalizedMood.join("/")}、シーン:${normalizedScene.join("/")} を自動付与しました。`,
  };
}

function normalizeTags(value, allowed) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()))].filter((v) => allowed.includes(v));
}

function safeString(v) {
  return typeof v === "string" ? v.trim() : "";
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

      <article class="card summary-card" style="margin-top: 10px;">
        <h3>歌詞・歌唱メモ</h3>
        <p>歌詞要約</p><div class="sub">${song.lyricsSummary || "未登録"}</div>
        <p>歌い方メモ</p><div class="sub">${song.singingTips || "未登録"}</div>
        <p>自動タグ理由</p><div class="sub">${song.autoTagReason || "未登録"}</div>
      </article>

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
    lyricsSummary: v("lyricsSummary").trim(),
    singingTips: v("singingTips").trim(),
    autoTagReason: v("autoTagReason").trim(),
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
  return `<label for="${id}">${labelText}</label><select id="${id}">${options.map((o) => `<option value="${o}" ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select>`;
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
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
