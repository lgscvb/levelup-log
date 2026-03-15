export const LOCALES = [
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
  "es",
  "pt-BR",
] as const;
export type Locale = (typeof LOCALES)[number];
export const defaultLocale: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  "pt-BR": "Português",
};

type Translations = {
  nav: {
    leaderboard: string;
    dashboard: string;
  };
  home: {
    tagline: string;
    tagline2: string;
    installComment: string;
    features: {
      gamify: { title: string; desc: string };
      streak: { title: string; desc: string };
      compete: { title: string; desc: string };
    };
    footer: string;
  };
  dashboard: {
    title: string;
    publicProfile: string;
    settings: string;
    totalXp: string;
    yearXp: string;
    streak: string;
    bestStreak: string;
    recentAchievements: string;
    noAchievements: string;
    noAchievementsHint: string;
  };
  settings: {
    title: string;
    displayName: string;
    bio: string;
    birthDate: string;
    publicDefault: string;
    save: string;
    saving: string;
    saved: string;
    signOut: string;
  };
  leaderboard: {
    title: string;
    season: string;
    thisYear: string;
    allTime: string;
    noEntries: string;
    xp: string;
  };
  profile: {
    totalXp: string;
    yearXp: string;
    streak: string;
    titles: string;
    categoryBreakdown: string;
    recentAchievements: string;
    noPublicAchievements: string;
  };
};

export const translations: Record<Locale, Translations> = {
  en: {
    nav: { leaderboard: "Leaderboard", dashboard: "Dashboard" },
    home: {
      tagline: "Turn your daily tasks into game-like achievements.",
      tagline2:
        "Your age is your level — the question is what you accomplished at it.",
      installComment: "# Install in one command",
      features: {
        gamify: {
          title: "Gamify Everything",
          desc: "Turn daily tasks into achievements. Code, life, health, learning — everything counts.",
        },
        streak: {
          title: "Track Your Streak",
          desc: "Build momentum with daily streaks. Your AI coach keeps you motivated.",
        },
        compete: {
          title: "Compete & Share",
          desc: "Climb the leaderboard. Unlock titles. Share your profile with the world.",
        },
      },
      footer:
        "Works with Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, and more.",
    },
    dashboard: {
      title: "Dashboard",
      publicProfile: "Public Profile",
      settings: "Settings",
      totalXp: "Total XP",
      yearXp: "Year XP",
      streak: "Streak",
      bestStreak: "Best Streak",
      recentAchievements: "Recent Achievements",
      noAchievements:
        "No achievements yet. Start using the MCP to record your first!",
      noAchievementsHint: "# Install in one command",
    },
    settings: {
      title: "Settings",
      displayName: "Display Name",
      bio: "Bio",
      birthDate: "Birth Date (your level = your age)",
      publicDefault: "Achievements public by default",
      save: "Save Settings",
      saving: "Saving...",
      saved: "Settings saved!",
      signOut: "Sign Out",
    },
    leaderboard: {
      title: "Leaderboard",
      season: "Season",
      thisYear: "This Year",
      allTime: "All Time",
      noEntries: "No entries yet. Be the first!",
      xp: "XP",
    },
    profile: {
      totalXp: "Total XP",
      yearXp: "Year XP",
      streak: "Streak",
      titles: "Titles",
      categoryBreakdown: "Category Breakdown",
      recentAchievements: "Recent Achievements",
      noPublicAchievements: "No public achievements yet.",
    },
  },
  "zh-TW": {
    nav: { leaderboard: "排行榜", dashboard: "儀表板" },
    home: {
      tagline: "把每天的任務變成遊戲式成就。",
      tagline2: "你的年齡就是你的等級 — 問題是你在這個等級做了什麼。",
      installComment: "# 一行指令安裝",
      features: {
        gamify: {
          title: "把一切遊戲化",
          desc: "把日常任務變成成就。寫程式、生活、健康、學習 — 每件事都算數。",
        },
        streak: {
          title: "追蹤連續天數",
          desc: "透過每日連續累積動力。你的 AI 教練讓你保持動力。",
        },
        compete: {
          title: "競爭 & 分享",
          desc: "爬上排行榜。解鎖稱號。與世界分享你的個人頁面。",
        },
      },
      footer:
        "支援 Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等工具。",
    },
    dashboard: {
      title: "儀表板",
      publicProfile: "公開頁面",
      settings: "設定",
      totalXp: "總 XP",
      yearXp: "年度 XP",
      streak: "連續天數",
      bestStreak: "最佳連續",
      recentAchievements: "最近成就",
      noAchievements: "還沒有成就。開始使用 MCP 記錄你的第一個！",
      noAchievementsHint: "# 一行指令安裝",
    },
    settings: {
      title: "設定",
      displayName: "顯示名稱",
      bio: "個人簡介",
      birthDate: "生日（你的等級 = 你的年齡）",
      publicDefault: "成就預設公開",
      save: "儲存設定",
      saving: "儲存中...",
      saved: "設定已儲存！",
      signOut: "登出",
    },
    leaderboard: {
      title: "排行榜",
      season: "賽季",
      thisYear: "本年度",
      allTime: "歷史總計",
      noEntries: "還沒有人上榜，成為第一個吧！",
      xp: "XP",
    },
    profile: {
      totalXp: "總 XP",
      yearXp: "年度 XP",
      streak: "連續天數",
      titles: "稱號",
      categoryBreakdown: "類別分布",
      recentAchievements: "最近成就",
      noPublicAchievements: "還沒有公開成就。",
    },
  },
  "zh-CN": {
    nav: { leaderboard: "排行榜", dashboard: "仪表盘" },
    home: {
      tagline: "把每天的任务变成游戏式成就。",
      tagline2: "你的年龄就是你的等级 — 问题是你在这个等级做了什么。",
      installComment: "# 一行命令安装",
      features: {
        gamify: {
          title: "把一切游戏化",
          desc: "把日常任务变成成就。写代码、生活、健康、学习 — 每件事都算数。",
        },
        streak: {
          title: "追踪连续天数",
          desc: "通过每日连续积累动力。你的 AI 教练让你保持动力。",
        },
        compete: {
          title: "竞争 & 分享",
          desc: "登上排行榜。解锁称号。与世界分享你的个人主页。",
        },
      },
      footer:
        "支持 Claude Desktop、Claude Code、ChatGPT Desktop、Cursor 等工具。",
    },
    dashboard: {
      title: "仪表盘",
      publicProfile: "公开页面",
      settings: "设置",
      totalXp: "总 XP",
      yearXp: "年度 XP",
      streak: "连续天数",
      bestStreak: "最佳连续",
      recentAchievements: "最近成就",
      noAchievements: "还没有成就。开始使用 MCP 记录你的第一个！",
      noAchievementsHint: "# 一行命令安装",
    },
    settings: {
      title: "设置",
      displayName: "显示名称",
      bio: "个人简介",
      birthDate: "生日（你的等级 = 你的年龄）",
      publicDefault: "成就默认公开",
      save: "保存设置",
      saving: "保存中...",
      saved: "设置已保存！",
      signOut: "退出登录",
    },
    leaderboard: {
      title: "排行榜",
      season: "赛季",
      thisYear: "本年度",
      allTime: "历史总计",
      noEntries: "还没有人上榜，成为第一个吧！",
      xp: "XP",
    },
    profile: {
      totalXp: "总 XP",
      yearXp: "年度 XP",
      streak: "连续天数",
      titles: "称号",
      categoryBreakdown: "类别分布",
      recentAchievements: "最近成就",
      noPublicAchievements: "还没有公开成就。",
    },
  },
  ja: {
    nav: { leaderboard: "リーダーボード", dashboard: "ダッシュボード" },
    home: {
      tagline: "毎日のタスクをゲーム感覚の実績に変えよう。",
      tagline2:
        "あなたの年齢がレベル — そのレベルで何を成し遂げたかが問われる。",
      installComment: "# ワンコマンドでインストール",
      features: {
        gamify: {
          title: "すべてをゲーム化",
          desc: "日常のタスクを実績に変える。コード、生活、健康、学習 — すべてがカウントされる。",
        },
        streak: {
          title: "ストリークを追跡",
          desc: "毎日のストリークで勢いをつける。AIコーチがモチベーションを維持してくれる。",
        },
        compete: {
          title: "競争 & シェア",
          desc: "リーダーボードを登る。称号を解放する。プロフィールを世界と共有しよう。",
        },
      },
      footer:
        "Claude Desktop、Claude Code、ChatGPT Desktop、Cursorなどに対応。",
    },
    dashboard: {
      title: "ダッシュボード",
      publicProfile: "プロフィール公開",
      settings: "設定",
      totalXp: "総XP",
      yearXp: "年間XP",
      streak: "ストリーク",
      bestStreak: "最高ストリーク",
      recentAchievements: "最近の実績",
      noAchievements:
        "まだ実績がありません。MCPを使って最初の実績を記録しよう！",
      noAchievementsHint: "# ワンコマンドでインストール",
    },
    settings: {
      title: "設定",
      displayName: "表示名",
      bio: "自己紹介",
      birthDate: "誕生日（あなたのレベル = あなたの年齢）",
      publicDefault: "実績をデフォルトで公開",
      save: "設定を保存",
      saving: "保存中...",
      saved: "設定を保存しました！",
      signOut: "サインアウト",
    },
    leaderboard: {
      title: "リーダーボード",
      season: "シーズン",
      thisYear: "今年",
      allTime: "全期間",
      noEntries: "まだ誰もいません。最初の一人になりましょう！",
      xp: "XP",
    },
    profile: {
      totalXp: "総XP",
      yearXp: "年間XP",
      streak: "ストリーク",
      titles: "称号",
      categoryBreakdown: "カテゴリ内訳",
      recentAchievements: "最近の実績",
      noPublicAchievements: "公開実績はまだありません。",
    },
  },
  ko: {
    nav: { leaderboard: "리더보드", dashboard: "대시보드" },
    home: {
      tagline: "매일의 작업을 게임 같은 성취로 바꿔보세요.",
      tagline2:
        "당신의 나이가 레벨 — 그 레벨에서 무엇을 이뤘는지가 중요합니다.",
      installComment: "# 한 줄 명령어로 설치",
      features: {
        gamify: {
          title: "모든 것을 게임화",
          desc: "일상 작업을 성취로 변환. 코드, 생활, 건강, 학습 — 모든 것이 카운트됩니다.",
        },
        streak: {
          title: "스트릭 추적",
          desc: "매일의 스트릭으로 모멘텀을 쌓으세요. AI 코치가 동기를 유지해 줍니다.",
        },
        compete: {
          title: "경쟁 & 공유",
          desc: "리더보드를 올라가세요. 칭호를 해금하세요. 프로필을 세상과 공유하세요.",
        },
      },
      footer:
        "Claude Desktop, Claude Code, ChatGPT Desktop, Cursor 등과 함께 작동합니다.",
    },
    dashboard: {
      title: "대시보드",
      publicProfile: "공개 프로필",
      settings: "설정",
      totalXp: "총 XP",
      yearXp: "연간 XP",
      streak: "스트릭",
      bestStreak: "최고 스트릭",
      recentAchievements: "최근 성취",
      noAchievements:
        "아직 성취가 없습니다. MCP를 사용해 첫 번째 성취를 기록하세요!",
      noAchievementsHint: "# 한 줄 명령어로 설치",
    },
    settings: {
      title: "설정",
      displayName: "표시 이름",
      bio: "자기소개",
      birthDate: "생일 (레벨 = 나이)",
      publicDefault: "성취 기본 공개",
      save: "설정 저장",
      saving: "저장 중...",
      saved: "설정이 저장되었습니다!",
      signOut: "로그아웃",
    },
    leaderboard: {
      title: "리더보드",
      season: "시즌",
      thisYear: "올해",
      allTime: "전체 기간",
      noEntries: "아직 아무도 없습니다. 첫 번째가 되세요!",
      xp: "XP",
    },
    profile: {
      totalXp: "총 XP",
      yearXp: "연간 XP",
      streak: "스트릭",
      titles: "칭호",
      categoryBreakdown: "카테고리 분류",
      recentAchievements: "최근 성취",
      noPublicAchievements: "아직 공개된 성취가 없습니다.",
    },
  },
  es: {
    nav: { leaderboard: "Clasificación", dashboard: "Panel" },
    home: {
      tagline: "Convierte tus tareas diarias en logros tipo juego.",
      tagline2: "Tu edad es tu nivel — la pregunta es qué lograste en él.",
      installComment: "# Instalar en un comando",
      features: {
        gamify: {
          title: "Gamifica todo",
          desc: "Convierte tareas diarias en logros. Código, vida, salud, aprendizaje — todo cuenta.",
        },
        streak: {
          title: "Sigue tu racha",
          desc: "Acumula impulso con rachas diarias. Tu coach de IA te mantiene motivado.",
        },
        compete: {
          title: "Compite y comparte",
          desc: "Sube en la clasificación. Desbloquea títulos. Comparte tu perfil con el mundo.",
        },
      },
      footer:
        "Compatible con Claude Desktop, Claude Code, ChatGPT Desktop, Cursor y más.",
    },
    dashboard: {
      title: "Panel",
      publicProfile: "Perfil público",
      settings: "Configuración",
      totalXp: "XP Total",
      yearXp: "XP del año",
      streak: "Racha",
      bestStreak: "Mejor racha",
      recentAchievements: "Logros recientes",
      noAchievements:
        "Aún no hay logros. ¡Empieza a usar el MCP para registrar el primero!",
      noAchievementsHint: "# Instalar en un comando",
    },
    settings: {
      title: "Configuración",
      displayName: "Nombre visible",
      bio: "Biografía",
      birthDate: "Fecha de nacimiento (tu nivel = tu edad)",
      publicDefault: "Logros públicos por defecto",
      save: "Guardar",
      saving: "Guardando...",
      saved: "¡Configuración guardada!",
      signOut: "Cerrar sesión",
    },
    leaderboard: {
      title: "Clasificación",
      season: "Temporada",
      thisYear: "Este año",
      allTime: "Histórico",
      noEntries: "Aún no hay entradas. ¡Sé el primero!",
      xp: "XP",
    },
    profile: {
      totalXp: "XP Total",
      yearXp: "XP del año",
      streak: "Racha",
      titles: "Títulos",
      categoryBreakdown: "Desglose por categoría",
      recentAchievements: "Logros recientes",
      noPublicAchievements: "Aún no hay logros públicos.",
    },
  },
  "pt-BR": {
    nav: { leaderboard: "Classificação", dashboard: "Painel" },
    home: {
      tagline: "Transforme suas tarefas diárias em conquistas estilo jogo.",
      tagline2:
        "Sua idade é seu nível — a questão é o que você conquistou nele.",
      installComment: "# Instalar com um comando",
      features: {
        gamify: {
          title: "Gamifique tudo",
          desc: "Transforme tarefas diárias em conquistas. Código, vida, saúde, aprendizado — tudo conta.",
        },
        streak: {
          title: "Acompanhe seu streak",
          desc: "Construa impulso com streaks diários. Seu coach de IA mantém você motivado.",
        },
        compete: {
          title: "Compita & Compartilhe",
          desc: "Suba no ranking. Desbloqueie títulos. Compartilhe seu perfil com o mundo.",
        },
      },
      footer:
        "Funciona com Claude Desktop, Claude Code, ChatGPT Desktop, Cursor e mais.",
    },
    dashboard: {
      title: "Painel",
      publicProfile: "Perfil público",
      settings: "Configurações",
      totalXp: "XP Total",
      yearXp: "XP do ano",
      streak: "Sequência",
      bestStreak: "Melhor sequência",
      recentAchievements: "Conquistas recentes",
      noAchievements:
        "Nenhuma conquista ainda. Comece a usar o MCP para registrar a primeira!",
      noAchievementsHint: "# Instalar com um comando",
    },
    settings: {
      title: "Configurações",
      displayName: "Nome de exibição",
      bio: "Bio",
      birthDate: "Data de nascimento (seu nível = sua idade)",
      publicDefault: "Conquistas públicas por padrão",
      save: "Salvar",
      saving: "Salvando...",
      saved: "Configurações salvas!",
      signOut: "Sair",
    },
    leaderboard: {
      title: "Classificação",
      season: "Temporada",
      thisYear: "Este ano",
      allTime: "Histórico",
      noEntries: "Ainda não há entradas. Seja o primeiro!",
      xp: "XP",
    },
    profile: {
      totalXp: "XP Total",
      yearXp: "XP do ano",
      streak: "Sequência",
      titles: "Títulos",
      categoryBreakdown: "Distribuição por categoria",
      recentAchievements: "Conquistas recentes",
      noPublicAchievements: "Ainda não há conquistas públicas.",
    },
  },
};

export function t(locale: Locale) {
  return translations[locale] ?? translations["en"];
}
