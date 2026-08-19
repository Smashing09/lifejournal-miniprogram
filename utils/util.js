function formatTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

// 获取某月天数
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

// 获取某月第一天是星期几（0=周日）
function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

// 生成日历网格数据
function generateCalendar(year, month) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];
  // 前面补空
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= days; d++) {
    cells.push({
      day: d,
      date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }
  return cells;
}

module.exports = {
  formatTime, formatNumber, getDaysInMonth, getFirstDayOfMonth, generateCalendar,
};
