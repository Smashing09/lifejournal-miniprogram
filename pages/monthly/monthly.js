const storage = require('../../utils/storage');
const ai = require('../../utils/ai');

Page({
  data: {
    year: 0,
    month: 0,
    monthLabel: '',
    monthStr: '',
    entries: [],
    entryCount: 0,
    catStats: {},
    monthlySummary: '',
    summaryLoading: false,
    hasApiKey: false,
  },

  onLoad() {
    const now = new Date();
    this.initMonth(now.getFullYear(), now.getMonth() + 1);
  },

  onShow() {
    if (this.data.year) {
      this.initMonth(this.data.year, this.data.month);
    }
  },

  initMonth(year, month) {
    const ms = `${year}-${String(month).padStart(2, '0')}`;
    const entries = storage.getEntriesOfMonth(ms);
    
    // 统计各分类记录数
    const catStats = { exercise: 0, social: 0, study: 0, entertainment: 0 };
    entries.forEach(e => {
      Object.keys(e.categories || {}).forEach(k => {
        if (e.categories[k] && e.categories[k].content && e.categories[k].content.trim()) {
          catStats[k] = (catStats[k] || 0) + 1;
        }
      });
    });

    const existing = storage.getMonthlySummary(ms);

    this.setData({
      year,
      month,
      monthLabel: `${year}年${month}月`,
      monthStr: ms,
      entries,
      entryCount: entries.length,
      catStats,
      monthlySummary: existing ? existing.summary : '',
    });
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) { month = 12; year--; }
    this.initMonth(year, month);
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) { month = 1; year++; }
    this.initMonth(year, month);
  },

  async generateMonthly() {
    if (this.data.summaryLoading) return;
    this.setData({ summaryLoading: true });
    try {
      const settings = storage.getSettings();
      const provider = ai.getAIProvider(settings.doubaoApiKey, settings.doubaoModel);
      const summary = await provider.generateMonthlySummary(this.data.entries, this.data.monthStr, settings.nickname);
      storage.saveMonthlySummary(this.data.monthStr, summary);
      this.setData({ monthlySummary: summary, summaryLoading: false });
      wx.showToast({ title: '月度报告已生成', icon: 'success' });
    } catch (err) {
      this.setData({ summaryLoading: false });
      wx.showToast({ title: err.message || '生成失败', icon: 'none' });
    }
  },
});
