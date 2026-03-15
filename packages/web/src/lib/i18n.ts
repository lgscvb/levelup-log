export const LOCALES = ['en', 'zh-TW', 'zh-CN', 'ja', 'ko', 'es', 'pt-BR'] as const;
export type Locale = (typeof LOCALES)[number];
export const defaultLocale: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  'en':    'English',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'ja':    '日本語',
  'ko':    '한국어',
  'es':    'Español',
  'pt-BR': 'Português',
};

type HomeTranslation = {
  tagline: string;
  tagline2: string;
  installComment: string;
  features: {
    gamify:  { title: string; desc: string };
    streak:  { title: string; desc: string };
    compete: { title: string; desc: string };
  };
  footer: string;
};

type NavTranslation = {
  leaderboard: string;
  dashboard: string;
};

type Translations = {
  nav:  NavTranslation;
  home: HomeTranslation;
};

export const translations: Record<Locale, Translations> = {
  'en': {
    nav:  { leaderboard: 'Leaderboard', dashboard: 'Dashboard' },
    home: {
      tagline:        'Turn your daily tasks into game-like achievements.',
      tagline2:       'Your age is your level — the question is what you accomplished at it.',
      installComment: '# Install in one command',
      features: {
        gamify:  { title: 'Gamify Everything',   desc: 'Turn daily tasks into achievements. Code, life, health, learning — everything counts.' },
        streak:  { title: 'Track Your Streak',   desc: 'Build momentum with daily streaks. Your AI coach keeps you motivated.' },
        compete: { title: 'Compete & Share',      desc: 'Climb the leaderboard. Unlock titles. Share your profile with the world.' },
      },
      footer: 'Works with Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, and more.',
    },
  },
  'zh-TW': {
    nav:  { leaderboard: '排行榜', dashboard: '儀表板' },
    home: {
      tagline:        '把每天的任務變成遊戲式成就。',
      tagline2:       '你的年齡就是你的等級 — 問題是你在這個等級做了什麼。',
      installComment: '# 一行指令安裝',
      features: {
        gamify:  { title: '把一切遊戲化',   desc: '把日常任務變成成就。寫程式、生活、健康、學習 — 每件事都算數。' },
        streak:  { title: '追蹤連續天數',   desc: '透過每日連續累積動力。你的 AI 教練讓你保持動力。' },
        compete: { title: '競爭 & 分享',    desc: '爬上排行榜。解鎖稱號。與世界分享你的個人頁面。' },
      },
      footer: '支援 Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等工具。',
    },
  },
  'zh-CN': {
    nav:  { leaderboard: '排行榜', dashboard: '仪表盘' },
    home: {
      tagline:        '把每天的任务变成游戏式成就。',
      tagline2:       '你的年龄就是你的等级 — 问题是你在这个等级做了什么。',
      installComment: '# 一行命令安装',
      features: {
        gamify:  { title: '把一切游戏化',   desc: '把日常任务变成成就。写代码、生活、健康、学习 — 每件事都算数。' },
        streak:  { title: '追踪连续天数',   desc: '通过每日连续积累动力。你的 AI 教练让你保持动力。' },
        compete: { title: '竞争 & 分享',    desc: '登上排行榜。解锁称号。与世界分享你的个人主页。' },
      },
      footer: '支持 Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等工具。',
    },
  },
  'ja': {
    nav:  { leaderboard: 'リーダーボード', dashboard: 'ダッシュボード' },
    home: {
      tagline:        '毎日のタスクをゲーム感覚の実績に変えよう。',
      tagline2:       'あなたの年齢がレベル — そのレベルで何を成し遂げたかが問われる。',
      installComment: '# ワンコマンドでインストール',
      features: {
        gamify:  { title: 'すべてをゲーム化',      desc: '日常のタスクを実績に変える。コード、生活、健康、学習 — すべてがカウントされる。' },
        streak:  { title: 'ストリークを追跡',      desc: '毎日のストリークで勢いをつける。AIコーチがモチベーションを維持してくれる。' },
        compete: { title: '競争 & シェア',         desc: 'リーダーボードを登る。称号を解放する。プロフィールを世界と共有しよう。' },
      },
      footer: 'Claude Desktop、Claude Code、ChatGPT Desktop、Cursorなどに対応。',
    },
  },
  'ko': {
    nav:  { leaderboard: '리더보드', dashboard: '대시보드' },
    home: {
      tagline:        '매일의 작업을 게임 같은 성취로 바꿔보세요.',
      tagline2:       '당신의 나이가 레벨 — 그 레벨에서 무엇을 이뤘는지가 중요합니다.',
      installComment: '# 한 줄 명령어로 설치',
      features: {
        gamify:  { title: '모든 것을 게임화',  desc: '일상 작업을 성취로 변환. 코드, 생활, 건강, 학습 — 모든 것이 카운트됩니다.' },
        streak:  { title: '스트릭 추적',       desc: '매일의 스트릭으로 모멘텀을 쌓으세요. AI 코치가 동기를 유지해 줍니다.' },
        compete: { title: '경쟁 & 공유',       desc: '리더보드를 올라가세요. 칭호를 해금하세요. 프로필을 세상과 공유하세요.' },
      },
      footer: 'Claude Desktop, Claude Code, ChatGPT Desktop, Cursor 등과 함께 작동합니다.',
    },
  },
  'es': {
    nav:  { leaderboard: 'Clasificación', dashboard: 'Panel' },
    home: {
      tagline:        'Convierte tus tareas diarias en logros tipo juego.',
      tagline2:       'Tu edad es tu nivel — la pregunta es qué lograste en él.',
      installComment: '# Instalar en un comando',
      features: {
        gamify:  { title: 'Gamifica todo',         desc: 'Convierte tareas diarias en logros. Código, vida, salud, aprendizaje — todo cuenta.' },
        streak:  { title: 'Sigue tu racha',        desc: 'Acumula impulso con rachas diarias. Tu coach de IA te mantiene motivado.' },
        compete: { title: 'Compite y comparte',    desc: 'Sube en la clasificación. Desbloquea títulos. Comparte tu perfil con el mundo.' },
      },
      footer: 'Compatible con Claude Desktop, Claude Code, ChatGPT Desktop, Cursor y más.',
    },
  },
  'pt-BR': {
    nav:  { leaderboard: 'Classificação', dashboard: 'Painel' },
    home: {
      tagline:        'Transforme suas tarefas diárias em conquistas estilo jogo.',
      tagline2:       'Sua idade é seu nível — a questão é o que você conquistou nele.',
      installComment: '# Instalar com um comando',
      features: {
        gamify:  { title: 'Gamifique tudo',        desc: 'Transforme tarefas diárias em conquistas. Código, vida, saúde, aprendizado — tudo conta.' },
        streak:  { title: 'Acompanhe seu streak',  desc: 'Construa impulso com streaks diários. Seu coach de IA mantém você motivado.' },
        compete: { title: 'Compita & Compartilhe', desc: 'Suba no ranking. Desbloqueie títulos. Compartilhe seu perfil com o mundo.' },
      },
      footer: 'Funciona com Claude Desktop, Claude Code, ChatGPT Desktop, Cursor e mais.',
    },
  },
};

export function t(locale: Locale) {
  return translations[locale] ?? translations['en'];
}
