const CATEGORIES = [
  { key: 'exercise', label: '运动', emoji: '💪' },
  { key: 'social', label: '社交', emoji: '👭' },
  { key: 'study', label: '学习', emoji: '📚' },
  { key: 'entertainment', label: '娱乐', emoji: '🎬' },
];

const DOUBAO_API = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

function buildDailyPrompt(entry, nickname) {
  const cats = CATEGORIES.filter(c => entry.categories[c.key] && entry.categories[c.key].content && entry.categories[c.key].content.trim());
  const details = cats.map(c => `【${c.label}${c.emoji}】\n${entry.categories[c.key].content.trim()}`).join('\n\n');
  const who = nickname ? `我是${nickname}，` : '';
  return `你是一位温柔、治愈、充满女性力量的生活陪伴师。${who}今天是${entry.date}，以下是我今天的生活记录：\n\n${details || '（今天还没有记录具体内容，给我一句温暖的鼓励吧～）'}\n\n请用**一句话**（不超过50字）给我生成今日总结，语气要温暖、治愈、带点小诗意，偶尔可以加一个合适的emoji。直接输出总结内容，不要加任何前缀或解释。`;
}

function buildMonthlyPrompt(entries, month, nickname) {
  const days = entries.filter(e => Object.keys(e.categories).length > 0 || e.summary).map(e => {
    const parts = CATEGORIES.map(c => {
      const v = e.categories[c.key] && e.categories[c.key].content ? e.categories[c.key].content.trim() : null;
      return v ? `${c.emoji}${c.label}: ${v}` : null;
    }).filter(Boolean);
    const sumLine = e.summary ? `✨总结: ${e.summary}` : '';
    return `📅 ${e.date}\n${[...parts, sumLine].filter(Boolean).join('\n')}`;
  }).join('\n\n');
  const who = nickname ? `我是${nickname}，` : '';
  return `你是一位温柔、治愈、充满洞察力的女性生活复盘师。${who}这是我${month}月的生活日记：\n\n${days || '（这个月还没有太多记录，给我一段温柔的开场白鼓励我下个月开始记录吧～）'}\n\n请给我生成一份**月度生活总结报告**，结构如下：\n1. 🌈 整体印象：一两段话描述这个月的整体状态和能量\n2. 🌸 闪光点：列出 3-5 条这个月做得好的地方\n3. 🌱 小种子：列出 2-3 条可以继续加油的方向\n4. 💌 给下个月的自己：一段温暖有力量的话\n\n语气温柔治愈，像闺蜜在和我说话，可以适当用emoji点缀。直接输出报告内容，不要加任何前缀解释。`;
}

function callDoubao(apiKey, model, prompt) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: DOUBAO_API,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      data: {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1024,
      },
      success(res) {
        if (res.statusCode !== 200) {
          reject(new Error(`豆包API调用失败 (${res.statusCode})`));
          return;
        }
        const content = res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content;
        if (!content) {
          reject(new Error('AI 返回内容为空'));
          return;
        }
        resolve(content.trim());
      },
      fail(err) {
        reject(new Error('网络请求失败: ' + (err.errMsg || '')));
      },
    });
  });
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Mock实现
function mockDailySummary(entry, nickname) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const who = nickname ? `${nickname}，` : '';
      const pool = [
        `${who}今天你认真生活的样子真的很美，愿明天继续被温柔以待 🌸`,
        `${who}记录本身就是一种治愈，今天也辛苦啦，做个好梦吧 ✨`,
        `${who}生活的小美好都藏在这些日常里，你发现了好多呀 🌷`,
        `${who}看到你把每一天都过得这么充实，真为你开心 💖`,
        `${who}平凡的日子因为你的记录而闪闪发光，晚安啦 🌙`,
      ];
      resolve(pick(pool));
    }, 600);
  });
}

function mockMonthlySummary(entries, month, nickname) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const who = nickname ? `亲爱的${nickname}：` : '亲爱的你：';
      const has = entries.filter(e => Object.keys(e.categories).length > 0).length;
      resolve(`# 🌈 ${month} 月度生活总结\n\n## 整体印象\n\n${who}这个月你一共记录了 ${has}天 的生活，不管多忙多累，你都愿意停下来和自己对对话，这本身就非常了不起。这个月的你，像一朵慢慢舒展的花，在自己的节奏里安静地美丽着 🌸\n\n## ✨ 这个月的闪光点\n\n1. 坚持记录 — 不管写多写少，能打开这个页面就已经赢了\n2. 认真生活 — 运动、社交、学习、娱乐，你在努力平衡着每一面\n3. 爱自己 — 愿意花时间看见自己，就是最大的温柔\n\n## 🌱 给下个月的小种子\n\n1. 可以在「运动」上多给自己一些耐心，哪怕只是多走 10 分钟\n2. 别忘了多和喜欢的人见面，社交真的会带来满满的能量\n3. 想学习的新东西，先迈出最小的那一步就好\n\n## 💌 给下个月的你\n\n愿你继续兴致盎然地和世界交手，一直走在开满鲜花的路上。允许自己偶尔偷懒，允许自己不完美，你已经做得非常非常好了。\n\n下个月，也要继续好好记录呀 💖`);
    }, 800);
  });
}

function getAIProvider(apiKey, model) {
  const hasKey = !!(apiKey && apiKey.trim());
  const finalModel = (model && model.trim()) || 'doubao-seed-1-6-flash-250515';
  return {
    hasKey: hasKey,
    generateDailySummary: function(entry, nickname) {
      if (hasKey) return callDoubao(apiKey.trim(), finalModel, buildDailyPrompt(entry, nickname));
      return mockDailySummary(entry, nickname);
    },
    generateMonthlySummary: function(entries, month, nickname) {
      if (hasKey) return callDoubao(apiKey.trim(), finalModel, buildMonthlyPrompt(entries, month, nickname));
      return mockMonthlySummary(entries, month, nickname);
    },
  };
}

module.exports = { getAIProvider, CATEGORIES };
