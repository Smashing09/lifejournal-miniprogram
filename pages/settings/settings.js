const storage = require('../../utils/storage');

Page({
  data: {
    nickname: '',
    doubaoApiKey: '',
    doubaoModel: '',
    dirty: false,
    saved: false,
    entryCount: 0,
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const s = storage.getSettings();
    this.setData({
      nickname: s.nickname || '',
      doubaoApiKey: s.doubaoApiKey || '',
      doubaoModel: s.doubaoModel || '',
      dirty: false,
      saved: false,
      entryCount: Object.keys(storage.getAllEntries()).length,
    });
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value, dirty: true, saved: false });
  },

  onApiKeyInput(e) {
    this.setData({ doubaoApiKey: e.detail.value, dirty: true, saved: false });
  },

  onModelInput(e) {
    this.setData({ doubaoModel: e.detail.value, dirty: true, saved: false });
  },

  handleSave() {
    const s = {
      nickname: this.data.nickname,
      doubaoApiKey: this.data.doubaoApiKey,
      doubaoModel: this.data.doubaoModel,
    };
    storage.saveSettings(s);
    this.setData({ dirty: false, saved: true });
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => this.setData({ saved: false }), 2000);
  },

  handleExport() {
    const data = storage.exportAllData();
    const json = JSON.stringify(data, null, 2);
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/life-journal-export.json`;
    try {
      fs.writeFileSync(filePath, json, 'utf8');
      wx.showModal({
        title: '导出成功',
        content: `数据已保存到：${filePath}\n\n共 ${this.data.entryCount} 天的记录`,
        showCancel: false,
      });
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' });
    }
  },
});
