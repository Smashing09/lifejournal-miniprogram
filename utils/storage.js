const KEYS = {
  ENTRIES: 'life-journal:entries',
  MONTHLY: 'life-journal:monthly',
  SETTINGS: 'life-journal:settings',
};

function safeGet(key, fallback) {
  try {
    const raw = wx.getStorageSync(key);
    if (!raw) return fallback;
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    wx.setStorageSync(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storage write failed', e);
  }
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthStr(d) {
  d = d || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// 获取所有条目
function getAllEntries() {
  return safeGet(KEYS.ENTRIES, {});
}

function getEntry(date) {
  const all = getAllEntries();
  return all[date] || null;
}

// 保存某个分类的内容
function saveCategoryContent(date, category, content) {
  const all = getAllEntries();
  const now = new Date().toISOString();
  const existing = all[date];
  const catEntry = { content, updatedAt: now };
  let entry;
  if (existing) {
    entry = { ...existing, categories: { ...existing.categories, [category]: catEntry }, updatedAt: now };
  } else {
    entry = { date, categories: { [category]: catEntry }, createdAt: now, updatedAt: now };
  }
  all[date] = entry;
  safeSet(KEYS.ENTRIES, all);
  return entry;
}

// 保存每日AI总结
function saveDailySummary(date, summary) {
  const all = getAllEntries();
  const now = new Date().toISOString();
  const existing = all[date];
  let entry;
  if (existing) {
    entry = { ...existing, summary, summaryGeneratedAt: now, updatedAt: now };
  } else {
    entry = { date, categories: {}, summary, summaryGeneratedAt: now, createdAt: now, updatedAt: now };
  }
  all[date] = entry;
  safeSet(KEYS.ENTRIES, all);
  return entry;
}

// 获取某月所有条目
function getEntriesOfMonth(month) {
  const all = getAllEntries();
  return Object.values(all).filter(e => e.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date));
}

// 月度总结
function getMonthlySummary(month) {
  const all = safeGet(KEYS.MONTHLY, {});
  return all[month] || null;
}

function saveMonthlySummary(month, summary) {
  const all = safeGet(KEYS.MONTHLY, {});
  const ms = { month, summary, generatedAt: new Date().toISOString() };
  all[month] = ms;
  safeSet(KEYS.MONTHLY, all);
  return ms;
}

// 设置
function getSettings() {
  return safeGet(KEYS.SETTINGS, {});
}

function saveSettings(s) {
  safeSet(KEYS.SETTINGS, s);
  return s;
}

// 导出条目数据
function exportAllData() {
  return {
    entries: getAllEntries(),
    monthly: safeGet(KEYS.MONTHLY, {}),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
}

module.exports = {
  todayStr, monthStr, getAllEntries, getEntry, saveCategoryContent,
  saveDailySummary, getEntriesOfMonth, getMonthlySummary, saveMonthlySummary,
  getSettings, saveSettings, exportAllData,
};
