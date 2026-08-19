const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

const CATEGORIES = [
  { key: 'exercise', label: '运动', emoji: '💪', color: '#E11D48', bgColor: '#FFF1F2', placeholder: '今天做了什么运动？跑步、瑜伽、散步都可以记录下来～' },
  { key: 'social', label: '社交', emoji: '👭', color: '#D97706', bgColor: '#FFFBEB', placeholder: '今天和谁见面了？有什么暖心的对话或聚会？' },
  { key: 'study', label: '学习', emoji: '📚', color: '#0284C7', bgColor: '#F0F9FF', placeholder: '今天学了什么新技能？读了什么书？看了什么课程？' },
  { key: 'entertainment', label: '娱乐', emoji: '🎬', color: '#7C3AED', bgColor: '#F5F3FF', placeholder: '今天看了什么电影/剧？听了什么歌？有什么开心的小事？' },
];

Page({
  data: {
    today: '',
    categories: CATEGORIES,
    entry: null,
    inputs: {},
    filledCount: 0,
    summary: '',
    summaryLoading: false,
    hasApiKey: false,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const today = storage.todayStr();
    const entry = storage.getEntry(today) || { categories: {} };
    const inputs = {};
    let filledCount = 0;
    CATEGORIES.forEach(c => {
      const v = entry.categories[c.key];
      inputs[c.key] = v ? v.content : '';
      if (v && v.content && v.content.trim()) filledCount++;
    });
    const settings = storage.getSettings();
    this.setData({
      today,
      entry,
      inputs,
      filledCount,
      summary: entry.summary || '',
      hasApiKey: !!(settings.doubaoApiKey && settings.doubaoApiKey.trim()),
    });
  },

  onInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const inputs = { ...this.data.inputs };
    inputs[key] = value;
    // 保存到storage
    storage.saveCategoryContent(this.data.today, key, value);
    // 重新计算filledCount
    let filledCount = 0;
    Object.values(inputs).forEach(v => { if (v && v.trim()) filledCount++; });
    this.setData({ inputs, filledCount });
  },

  async generateSummary() {
    if (this.data.summaryLoading) return;
    this.setData({ summaryLoading: true });
    try {
      const settings = storage.getSettings();
      const provider = ai.getAIProvider(settings.doubaoApiKey, settings.doubaoModel);
      const entry = storage.getEntry(this.data.today) || { date: this.data.today, categories: {} };
      // 用最新的inputs更新entry
      CATEGORIES.forEach(c => {
        if (this.data.inputs[c.key] && this.data.inputs[c.key].trim()) {
          entry.categories[c.key] = { content: this.data.inputs[c.key], updatedAt: new Date().toISOString() };
        }
      });
      const summary = await provider.generateDailySummary(entry, settings.nickname);
      storage.saveDailySummary(this.data.today, summary);
      this.setData({ summary, summaryLoading: false });
      wx.showToast({ title: '总结已生成', icon: 'success' });
    } catch (err) {
      this.setData({ summaryLoading: false });
      wx.showToast({ title: err.message || '生成失败', icon: 'none' });
    }
  },
});
