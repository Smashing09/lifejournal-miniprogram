const storage = require('../../utils/storage');
const util = require('../../utils/util');

const CATEGORIES = [
  { key: 'exercise', label: '运动', emoji: '💪' },
  { key: 'social', label: '社交', emoji: '👭' },
  { key: 'study', label: '学习', emoji: '📚' },
  { key: 'entertainment', label: '娱乐', emoji: '🎬' },
];

Page({
  data: {
    year: 0,
    month: 0,
    monthLabel: '',
    calendarCells: [],
    entriesMap: {},
    selectedDate: '',
    selectedEntry: null,
    categories: CATEGORIES,
  },

  onLoad() {
    const now = new Date();
    this.initCalendar(now.getFullYear(), now.getMonth() + 1);
  },

  onShow() {
    if (this.data.year) {
      this.initCalendar(this.data.year, this.data.month);
    }
  },

  initCalendar(year, month) {
    const cells = util.generateCalendar(year, month);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const entries = storage.getEntriesOfMonth(monthStr);
    const entriesMap = {};
    entries.forEach(e => {
      entriesMap[e.date] = e;
    });
    this.setData({
      year,
      month,
      monthLabel: `${year}年${month}月`,
      calendarCells: cells,
      entriesMap,
    });
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) { month = 12; year--; }
    this.initCalendar(year, month);
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) { month = 1; year++; }
    this.initCalendar(year, month);
  },

  selectDay(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;
    const entry = storage.getEntry(date);
    this.setData({ selectedDate: date, selectedEntry: entry });
  },
});
