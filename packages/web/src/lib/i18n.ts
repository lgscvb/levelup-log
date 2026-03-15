export type Locale = 'en' | 'zh-TW';

export const defaultLocale: Locale = 'en';

export const translations = {
  en: {
    nav: {
      leaderboard: 'Leaderboard',
      dashboard: 'Dashboard',
    },
    home: {
      tagline: 'Turn your daily tasks into game-like achievements.',
      tagline2: 'Your age is your level — the question is what you accomplished at it.',
      installComment: '# Install in one command',
      features: {
        gamify: {
          title: 'Gamify Everything',
          desc: 'Turn daily tasks into achievements. Code, life, health, learning — everything counts.',
        },
        streak: {
          title: 'Track Your Streak',
          desc: 'Build momentum with daily streaks. Your AI coach keeps you motivated.',
        },
        compete: {
          title: 'Compete & Share',
          desc: 'Climb the leaderboard. Unlock titles. Share your profile with the world.',
        },
      },
      footer: 'Works with Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, and more.',
    },
  },
  'zh-TW': {
    nav: {
      leaderboard: '排行榜',
      dashboard: '儀表板',
    },
    home: {
      tagline: '把每天的任務變成遊戲式成就。',
      tagline2: '你的年齡就是你的等級 — 問題是你在這個等級做了什麼。',
      installComment: '# 一行指令安裝',
      features: {
        gamify: {
          title: '把一切遊戲化',
          desc: '把日常任務變成成就。寫程式、生活、健康、學習 — 每件事都算數。',
        },
        streak: {
          title: '追蹤連續天數',
          desc: '透過每日連續累積動力。你的 AI 教練讓你保持動力。',
        },
        compete: {
          title: '競爭 & 分享',
          desc: '爬上排行榜。解鎖稱號。與世界分享你的個人頁面。',
        },
      },
      footer: '支援 Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等工具。',
    },
  },
} as const;

export function t(locale: Locale) {
  return translations[locale];
}
