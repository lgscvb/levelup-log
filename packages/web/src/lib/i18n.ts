export const LOCALES = [
  "en",
  "zh-TW",
  "zh-CN",
  "ja",
  "ko",
  "es",
  "pt-BR",
  "fr",
  "de",
  "it",
  "ru",
  "ar",
  "nl",
  "tr",
  "vi",
  "id",
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
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ru: "Русский",
  ar: "العربية",
  nl: "Nederlands",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
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
  common: {
    lv: string;
    adventurer: string;
    loading: string;
    categories: {
      code: string;
      fix: string;
      deploy: string;
      test: string;
      docs: string;
      refactor: string;
      review: string;
      ops: string;
      learn: string;
      milestone: string;
      life: string;
      health: string;
      finance: string;
      social: string;
      creative: string;
      spiritual: string;
      hobby: string;
    };
  };
  login: {
    subtitle: string;
    continueGoogle: string;
    redirecting: string;
    terms: string;
  };
  error: {
    title: string;
    message: string;
    errorId: string;
    tryAgain: string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
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
    common: {
      lv: "Lv.",
      adventurer: "Adventurer",
      loading: "Loading...",
      categories: {
        code: "Coding",
        fix: "Bug Fix",
        deploy: "Deploy",
        test: "Testing",
        docs: "Docs",
        refactor: "Refactor",
        review: "Review",
        ops: "DevOps",
        learn: "Learning",
        milestone: "Milestone",
        life: "Life",
        health: "Health",
        finance: "Finance",
        social: "Social",
        creative: "Creative",
        spiritual: "Spiritual",
        hobby: "Hobby",
      },
    },
    login: {
      subtitle: "Sign in to track your achievements",
      continueGoogle: "Continue with Google",
      redirecting: "Redirecting...",
      terms: "By signing in, you agree to our Terms of Service.",
    },
    error: {
      title: "Something went wrong",
      message: "An unexpected error occurred.",
      errorId: "Error ID: ",
      tryAgain: "Try Again",
    },
    notFound: {
      title: "Page Not Found",
      description: "This achievement hasn't been unlocked yet.",
      backHome: "Back to Home",
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
    common: {
      lv: "等級",
      adventurer: "冒險者",
      loading: "載入中...",
      categories: {
        code: "寫程式",
        fix: "修 Bug",
        deploy: "部署",
        test: "測試",
        docs: "文件",
        refactor: "重構",
        review: "審查",
        ops: "維運",
        learn: "學習",
        milestone: "里程碑",
        life: "生活",
        health: "健康",
        finance: "財務",
        social: "社交",
        creative: "創作",
        spiritual: "身心靈",
        hobby: "興趣",
      },
    },
    login: {
      subtitle: "登入以追蹤你的成就",
      continueGoogle: "使用 Google 繼續",
      redirecting: "跳轉中...",
      terms: "登入即表示你同意我們的服務條款。",
    },
    error: {
      title: "發生錯誤",
      message: "發生了意外錯誤。",
      errorId: "錯誤 ID：",
      tryAgain: "重試",
    },
    notFound: {
      title: "找不到頁面",
      description: "這個成就尚未解鎖。",
      backHome: "回到首頁",
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
    common: {
      lv: "等级",
      adventurer: "冒险者",
      loading: "加载中...",
      categories: {
        code: "写代码",
        fix: "修 Bug",
        deploy: "部署",
        test: "测试",
        docs: "文档",
        refactor: "重构",
        review: "审查",
        ops: "运维",
        learn: "学习",
        milestone: "里程碑",
        life: "生活",
        health: "健康",
        finance: "财务",
        social: "社交",
        creative: "创作",
        spiritual: "身心灵",
        hobby: "兴趣",
      },
    },
    login: {
      subtitle: "登录以追踪你的成就",
      continueGoogle: "使用 Google 继续",
      redirecting: "跳转中...",
      terms: "登录即表示你同意我们的服务条款。",
    },
    error: {
      title: "出了点问题",
      message: "发生了意外错误。",
      errorId: "错误 ID：",
      tryAgain: "重试",
    },
    notFound: {
      title: "页面未找到",
      description: "这个成就尚未解锁。",
      backHome: "回到首页",
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
    common: {
      lv: "Lv.",
      adventurer: "冒険者",
      loading: "読み込み中...",
      categories: {
        code: "コーディング",
        fix: "バグ修正",
        deploy: "デプロイ",
        test: "テスト",
        docs: "ドキュメント",
        refactor: "リファクタリング",
        review: "レビュー",
        ops: "運用",
        learn: "学習",
        milestone: "マイルストーン",
        life: "生活",
        health: "健康",
        finance: "財務",
        social: "ソーシャル",
        creative: "クリエイティブ",
        spiritual: "スピリチュアル",
        hobby: "趣味",
      },
    },
    login: {
      subtitle: "ログインして実績を記録しよう",
      continueGoogle: "Googleで続ける",
      redirecting: "リダイレクト中...",
      terms: "ログインすることで利用規約に同意したことになります。",
    },
    error: {
      title: "エラーが発生しました",
      message: "予期しないエラーが発生しました。",
      errorId: "エラーID：",
      tryAgain: "もう一度試す",
    },
    notFound: {
      title: "ページが見つかりません",
      description: "この実績はまだ解放されていません。",
      backHome: "ホームに戻る",
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
    common: {
      lv: "Lv.",
      adventurer: "모험가",
      loading: "로딩 중...",
      categories: {
        code: "코딩",
        fix: "버그 수정",
        deploy: "배포",
        test: "테스트",
        docs: "문서",
        refactor: "리팩토링",
        review: "리뷰",
        ops: "데브옵스",
        learn: "학습",
        milestone: "마일스톤",
        life: "생활",
        health: "건강",
        finance: "재무",
        social: "소셜",
        creative: "창작",
        spiritual: "영성",
        hobby: "취미",
      },
    },
    login: {
      subtitle: "로그인하여 성취를 기록하세요",
      continueGoogle: "Google로 계속하기",
      redirecting: "리다이렉트 중...",
      terms: "로그인하면 서비스 약관에 동의하는 것입니다.",
    },
    error: {
      title: "문제가 발생했습니다",
      message: "예기치 않은 오류가 발생했습니다.",
      errorId: "오류 ID: ",
      tryAgain: "다시 시도",
    },
    notFound: {
      title: "페이지를 찾을 수 없습니다",
      description: "이 성취는 아직 해금되지 않았습니다.",
      backHome: "홈으로 돌아가기",
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
    common: {
      lv: "Nv.",
      adventurer: "Aventurero",
      loading: "Cargando...",
      categories: {
        code: "Programación",
        fix: "Corrección",
        deploy: "Despliegue",
        test: "Pruebas",
        docs: "Documentación",
        refactor: "Refactorización",
        review: "Revisión",
        ops: "DevOps",
        learn: "Aprendizaje",
        milestone: "Hito",
        life: "Vida",
        health: "Salud",
        finance: "Finanzas",
        social: "Social",
        creative: "Creativo",
        spiritual: "Espiritual",
        hobby: "Pasatiempo",
      },
    },
    login: {
      subtitle: "Inicia sesión para registrar tus logros",
      continueGoogle: "Continuar con Google",
      redirecting: "Redirigiendo...",
      terms: "Al iniciar sesión, aceptas nuestros Términos de Servicio.",
    },
    error: {
      title: "Algo salió mal",
      message: "Ocurrió un error inesperado.",
      errorId: "ID del error: ",
      tryAgain: "Reintentar",
    },
    notFound: {
      title: "Página no encontrada",
      description: "Este logro aún no se ha desbloqueado.",
      backHome: "Volver al inicio",
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
    common: {
      lv: "Nv.",
      adventurer: "Aventureiro",
      loading: "Carregando...",
      categories: {
        code: "Programação",
        fix: "Correção",
        deploy: "Deploy",
        test: "Testes",
        docs: "Documentação",
        refactor: "Refatoração",
        review: "Revisão",
        ops: "DevOps",
        learn: "Aprendizado",
        milestone: "Marco",
        life: "Vida",
        health: "Saúde",
        finance: "Finanças",
        social: "Social",
        creative: "Criativo",
        spiritual: "Espiritual",
        hobby: "Hobby",
      },
    },
    login: {
      subtitle: "Entre para registrar suas conquistas",
      continueGoogle: "Continuar com Google",
      redirecting: "Redirecionando...",
      terms: "Ao entrar, você concorda com nossos Termos de Serviço.",
    },
    error: {
      title: "Algo deu errado",
      message: "Ocorreu um erro inesperado.",
      errorId: "ID do erro: ",
      tryAgain: "Tentar novamente",
    },
    notFound: {
      title: "Página não encontrada",
      description: "Esta conquista ainda não foi desbloqueada.",
      backHome: "Voltar ao início",
    },
  },
  fr: {
    nav: { leaderboard: "Classement", dashboard: "Tableau de bord" },
    home: {
      tagline: "Transformez vos tâches quotidiennes en accomplissements.",
      tagline2:
        "Votre âge est votre niveau — la question est ce que vous avez accompli.",
      installComment: "# Installer en une commande",
      features: {
        gamify: {
          title: "Gamifiez tout",
          desc: "Transformez les tâches en succès. Code, vie, santé, apprentissage — tout compte.",
        },
        streak: {
          title: "Suivez votre streak",
          desc: "Construisez un élan avec des streaks quotidiens. Votre coach IA vous motive.",
        },
        compete: {
          title: "Compétez & Partagez",
          desc: "Montez dans le classement. Débloquez des titres. Partagez votre profil avec le monde.",
        },
      },
      footer:
        "Compatible avec Claude Desktop, Claude Code, ChatGPT Desktop, Cursor et plus.",
    },
    dashboard: {
      title: "Tableau de bord",
      publicProfile: "Profil public",
      settings: "Paramètres",
      totalXp: "XP Total",
      yearXp: "XP de l'année",
      streak: "Streak",
      bestStreak: "Meilleur streak",
      recentAchievements: "Succès récents",
      noAchievements:
        "Pas encore de succès. Commencez à utiliser le MCP pour enregistrer le premier !",
      noAchievementsHint: "# Installer en une commande",
    },
    settings: {
      title: "Paramètres",
      displayName: "Nom d'affichage",
      bio: "Bio",
      birthDate: "Date de naissance (votre niveau = votre âge)",
      publicDefault: "Succès publics par défaut",
      save: "Enregistrer",
      saving: "Enregistrement...",
      saved: "Paramètres sauvegardés !",
      signOut: "Se déconnecter",
    },
    leaderboard: {
      title: "Classement",
      season: "Saison",
      thisYear: "Cette année",
      allTime: "Tout le temps",
      noEntries: "Pas encore d'entrées. Soyez le premier !",
      xp: "XP",
    },
    profile: {
      totalXp: "XP Total",
      yearXp: "XP de l'année",
      streak: "Streak",
      titles: "Titres",
      categoryBreakdown: "Répartition par catégorie",
      recentAchievements: "Succès récents",
      noPublicAchievements: "Pas encore de succès publics.",
    },
    common: {
      lv: "Nv.",
      adventurer: "Aventurier",
      loading: "Chargement...",
      categories: {
        code: "Programmation",
        fix: "Correction",
        deploy: "Déploiement",
        test: "Tests",
        docs: "Documentation",
        refactor: "Refactorisation",
        review: "Revue",
        ops: "DevOps",
        learn: "Apprentissage",
        milestone: "Jalon",
        life: "Vie",
        health: "Santé",
        finance: "Finances",
        social: "Social",
        creative: "Créatif",
        spiritual: "Spirituel",
        hobby: "Loisir",
      },
    },
    login: {
      subtitle: "Connectez-vous pour suivre vos succès",
      continueGoogle: "Continuer avec Google",
      redirecting: "Redirection...",
      terms: "En vous connectant, vous acceptez nos Conditions d'utilisation.",
    },
    error: {
      title: "Une erreur est survenue",
      message: "Une erreur inattendue s'est produite.",
      errorId: "ID de l'erreur : ",
      tryAgain: "Réessayer",
    },
    notFound: {
      title: "Page introuvable",
      description: "Ce succès n'a pas encore été débloqué.",
      backHome: "Retour à l'accueil",
    },
  },
  de: {
    nav: { leaderboard: "Rangliste", dashboard: "Dashboard" },
    home: {
      tagline:
        "Verwandle deine täglichen Aufgaben in spielerische Errungenschaften.",
      tagline2:
        "Dein Alter ist dein Level — die Frage ist, was du dabei erreicht hast.",
      installComment: "# In einem Befehl installieren",
      features: {
        gamify: {
          title: "Alles gamifizieren",
          desc: "Verwandle tägliche Aufgaben in Errungenschaften. Code, Leben, Gesundheit, Lernen — alles zählt.",
        },
        streak: {
          title: "Streak verfolgen",
          desc: "Baue Schwung mit täglichen Streaks auf. Dein KI-Coach hält dich motiviert.",
        },
        compete: {
          title: "Wettkämpfen & Teilen",
          desc: "Klettere in der Rangliste. Schalte Titel frei. Teile dein Profil mit der Welt.",
        },
      },
      footer:
        "Funktioniert mit Claude Desktop, Claude Code, ChatGPT Desktop, Cursor und mehr.",
    },
    dashboard: {
      title: "Dashboard",
      publicProfile: "Öffentliches Profil",
      settings: "Einstellungen",
      totalXp: "Gesamt-XP",
      yearXp: "Jahres-XP",
      streak: "Streak",
      bestStreak: "Bester Streak",
      recentAchievements: "Letzte Errungenschaften",
      noAchievements:
        "Noch keine Errungenschaften. Starte den MCP, um die erste aufzuzeichnen!",
      noAchievementsHint: "# In einem Befehl installieren",
    },
    settings: {
      title: "Einstellungen",
      displayName: "Anzeigename",
      bio: "Bio",
      birthDate: "Geburtsdatum (dein Level = dein Alter)",
      publicDefault: "Errungenschaften standardmäßig öffentlich",
      save: "Speichern",
      saving: "Speichern...",
      saved: "Einstellungen gespeichert!",
      signOut: "Abmelden",
    },
    leaderboard: {
      title: "Rangliste",
      season: "Saison",
      thisYear: "Dieses Jahr",
      allTime: "Aller Zeiten",
      noEntries: "Noch keine Einträge. Sei der Erste!",
      xp: "XP",
    },
    profile: {
      totalXp: "Gesamt-XP",
      yearXp: "Jahres-XP",
      streak: "Streak",
      titles: "Titel",
      categoryBreakdown: "Kategorieaufteilung",
      recentAchievements: "Letzte Errungenschaften",
      noPublicAchievements: "Noch keine öffentlichen Errungenschaften.",
    },
    common: {
      lv: "Lv.",
      adventurer: "Abenteurer",
      loading: "Laden...",
      categories: {
        code: "Programmierung",
        fix: "Fehlerbehebung",
        deploy: "Deployment",
        test: "Tests",
        docs: "Dokumentation",
        refactor: "Refactoring",
        review: "Review",
        ops: "DevOps",
        learn: "Lernen",
        milestone: "Meilenstein",
        life: "Leben",
        health: "Gesundheit",
        finance: "Finanzen",
        social: "Soziales",
        creative: "Kreativ",
        spiritual: "Spirituell",
        hobby: "Hobby",
      },
    },
    login: {
      subtitle: "Melde dich an, um deine Errungenschaften zu verfolgen",
      continueGoogle: "Weiter mit Google",
      redirecting: "Weiterleitung...",
      terms: "Mit der Anmeldung stimmst du unseren Nutzungsbedingungen zu.",
    },
    error: {
      title: "Etwas ist schiefgelaufen",
      message: "Ein unerwarteter Fehler ist aufgetreten.",
      errorId: "Fehler-ID: ",
      tryAgain: "Erneut versuchen",
    },
    notFound: {
      title: "Seite nicht gefunden",
      description: "Diese Errungenschaft wurde noch nicht freigeschaltet.",
      backHome: "Zurück zur Startseite",
    },
  },
  it: {
    nav: { leaderboard: "Classifica", dashboard: "Dashboard" },
    home: {
      tagline: "Trasforma i tuoi compiti quotidiani in traguardi da gioco.",
      tagline2:
        "La tua età è il tuo livello — la domanda è cosa hai realizzato.",
      installComment: "# Installa con un comando",
      features: {
        gamify: {
          title: "Gamifica tutto",
          desc: "Trasforma le attività quotidiane in traguardi. Codice, vita, salute, apprendimento — tutto conta.",
        },
        streak: {
          title: "Monitora la tua striscia",
          desc: "Costruisci slancio con le strisce giornaliere. Il tuo coach IA ti mantiene motivato.",
        },
        compete: {
          title: "Gareggia e Condividi",
          desc: "Scala la classifica. Sblocca titoli. Condividi il tuo profilo con il mondo.",
        },
      },
      footer:
        "Funziona con Claude Desktop, Claude Code, ChatGPT Desktop, Cursor e altro.",
    },
    dashboard: {
      title: "Dashboard",
      publicProfile: "Profilo pubblico",
      settings: "Impostazioni",
      totalXp: "XP Totale",
      yearXp: "XP dell'anno",
      streak: "Striscia",
      bestStreak: "Migliore striscia",
      recentAchievements: "Traguardi recenti",
      noAchievements:
        "Ancora nessun traguardo. Inizia a usare il MCP per registrare il primo!",
      noAchievementsHint: "# Installa con un comando",
    },
    settings: {
      title: "Impostazioni",
      displayName: "Nome visualizzato",
      bio: "Bio",
      birthDate: "Data di nascita (il tuo livello = la tua età)",
      publicDefault: "Traguardi pubblici per impostazione predefinita",
      save: "Salva",
      saving: "Salvataggio...",
      saved: "Impostazioni salvate!",
      signOut: "Esci",
    },
    leaderboard: {
      title: "Classifica",
      season: "Stagione",
      thisYear: "Quest'anno",
      allTime: "Sempre",
      noEntries: "Ancora nessun partecipante. Sii il primo!",
      xp: "XP",
    },
    profile: {
      totalXp: "XP Totale",
      yearXp: "XP dell'anno",
      streak: "Striscia",
      titles: "Titoli",
      categoryBreakdown: "Distribuzione per categoria",
      recentAchievements: "Traguardi recenti",
      noPublicAchievements: "Ancora nessun traguardo pubblico.",
    },
    common: {
      lv: "Lv.",
      adventurer: "Avventuriero",
      loading: "Caricamento...",
      categories: {
        code: "Programmazione",
        fix: "Correzione bug",
        deploy: "Deploy",
        test: "Test",
        docs: "Documentazione",
        refactor: "Refactoring",
        review: "Revisione",
        ops: "DevOps",
        learn: "Apprendimento",
        milestone: "Traguardo",
        life: "Vita",
        health: "Salute",
        finance: "Finanze",
        social: "Sociale",
        creative: "Creativo",
        spiritual: "Spirituale",
        hobby: "Hobby",
      },
    },
    login: {
      subtitle: "Accedi per registrare i tuoi traguardi",
      continueGoogle: "Continua con Google",
      redirecting: "Reindirizzamento...",
      terms: "Accedendo, accetti i nostri Termini di Servizio.",
    },
    error: {
      title: "Qualcosa è andato storto",
      message: "Si è verificato un errore imprevisto.",
      errorId: "ID errore: ",
      tryAgain: "Riprova",
    },
    notFound: {
      title: "Pagina non trovata",
      description: "Questo traguardo non è ancora stato sbloccato.",
      backHome: "Torna alla home",
    },
  },
  ru: {
    nav: { leaderboard: "Рейтинг", dashboard: "Панель" },
    home: {
      tagline: "Преврати ежедневные задачи в игровые достижения.",
      tagline2:
        "Твой возраст — твой уровень. Вопрос в том, что ты успел на этом уровне.",
      installComment: "# Установить одной командой",
      features: {
        gamify: {
          title: "Геймифицируй всё",
          desc: "Превращай задачи в достижения. Код, жизнь, здоровье, учёба — всё считается.",
        },
        streak: {
          title: "Отслеживай серию",
          desc: "Набирай темп ежедневными сериями. Твой ИИ-тренер держит тебя мотивированным.",
        },
        compete: {
          title: "Соревнуйся и делись",
          desc: "Поднимайся в рейтинге. Открывай титулы. Делись профилем с миром.",
        },
      },
      footer:
        "Работает с Claude Desktop, Claude Code, ChatGPT Desktop, Cursor и другими.",
    },
    dashboard: {
      title: "Панель",
      publicProfile: "Публичный профиль",
      settings: "Настройки",
      totalXp: "Всего XP",
      yearXp: "XP за год",
      streak: "Серия",
      bestStreak: "Лучшая серия",
      recentAchievements: "Последние достижения",
      noAchievements:
        "Пока нет достижений. Начни использовать MCP, чтобы записать первое!",
      noAchievementsHint: "# Установить одной командой",
    },
    settings: {
      title: "Настройки",
      displayName: "Отображаемое имя",
      bio: "О себе",
      birthDate: "Дата рождения (твой уровень = твой возраст)",
      publicDefault: "Достижения публичны по умолчанию",
      save: "Сохранить",
      saving: "Сохранение...",
      saved: "Настройки сохранены!",
      signOut: "Выйти",
    },
    leaderboard: {
      title: "Рейтинг",
      season: "Сезон",
      thisYear: "Этот год",
      allTime: "Всё время",
      noEntries: "Пока никого нет. Будь первым!",
      xp: "XP",
    },
    profile: {
      totalXp: "Всего XP",
      yearXp: "XP за год",
      streak: "Серия",
      titles: "Титулы",
      categoryBreakdown: "Разбивка по категориям",
      recentAchievements: "Последние достижения",
      noPublicAchievements: "Пока нет публичных достижений.",
    },
    common: {
      lv: "Ур.",
      adventurer: "Искатель приключений",
      loading: "Загрузка...",
      categories: {
        code: "Программирование",
        fix: "Исправление",
        deploy: "Деплой",
        test: "Тестирование",
        docs: "Документация",
        refactor: "Рефакторинг",
        review: "Ревью",
        ops: "DevOps",
        learn: "Обучение",
        milestone: "Веха",
        life: "Жизнь",
        health: "Здоровье",
        finance: "Финансы",
        social: "Социальное",
        creative: "Творчество",
        spiritual: "Духовное",
        hobby: "Хобби",
      },
    },
    login: {
      subtitle: "Войдите, чтобы отслеживать свои достижения",
      continueGoogle: "Продолжить с Google",
      redirecting: "Перенаправление...",
      terms: "Входя в систему, вы соглашаетесь с нашими Условиями использования.",
    },
    error: {
      title: "Что-то пошло не так",
      message: "Произошла непредвиденная ошибка.",
      errorId: "ID ошибки: ",
      tryAgain: "Попробовать снова",
    },
    notFound: {
      title: "Страница не найдена",
      description: "Это достижение ещё не разблокировано.",
      backHome: "На главную",
    },
  },
  ar: {
    nav: { leaderboard: "لوحة المتصدرين", dashboard: "لوحة التحكم" },
    home: {
      tagline: "حوّل مهامك اليومية إلى إنجازات على طريقة الألعاب.",
      tagline2: "عمرك هو مستواك — السؤال هو ماذا أنجزت في هذا المستوى.",
      installComment: "# التثبيت بأمر واحد",
      features: {
        gamify: {
          title: "حوّل كل شيء إلى لعبة",
          desc: "اجعل المهام اليومية إنجازات. كود، حياة، صحة، تعلّم — كل شيء يحتسب.",
        },
        streak: {
          title: "تتبع سلسلتك",
          desc: "ابنِ زخماً بالسلاسل اليومية. مدربك الذكي يُبقيك متحفزاً.",
        },
        compete: {
          title: "تنافس وشارك",
          desc: "تسلق لوحة المتصدرين. افتح ألقاباً. شارك ملفك الشخصي مع العالم.",
        },
      },
      footer:
        "يعمل مع Claude Desktop وClaude Code وChatGPT Desktop وCursor والمزيد.",
    },
    dashboard: {
      title: "لوحة التحكم",
      publicProfile: "الملف الشخصي العام",
      settings: "الإعدادات",
      totalXp: "إجمالي XP",
      yearXp: "XP السنة",
      streak: "السلسلة",
      bestStreak: "أفضل سلسلة",
      recentAchievements: "أحدث الإنجازات",
      noAchievements:
        "لا توجد إنجازات بعد. ابدأ باستخدام MCP لتسجيل أول إنجاز!",
      noAchievementsHint: "# التثبيت بأمر واحد",
    },
    settings: {
      title: "الإعدادات",
      displayName: "الاسم المعروض",
      bio: "نبذة عني",
      birthDate: "تاريخ الميلاد (مستواك = عمرك)",
      publicDefault: "الإنجازات عامة بشكل افتراضي",
      save: "حفظ",
      saving: "جارٍ الحفظ...",
      saved: "تم حفظ الإعدادات!",
      signOut: "تسجيل الخروج",
    },
    leaderboard: {
      title: "لوحة المتصدرين",
      season: "الموسم",
      thisYear: "هذا العام",
      allTime: "كل الوقت",
      noEntries: "لا يوجد مشاركون بعد. كن الأول!",
      xp: "XP",
    },
    profile: {
      totalXp: "إجمالي XP",
      yearXp: "XP السنة",
      streak: "السلسلة",
      titles: "الألقاب",
      categoryBreakdown: "توزيع الفئات",
      recentAchievements: "أحدث الإنجازات",
      noPublicAchievements: "لا توجد إنجازات عامة بعد.",
    },
    common: {
      lv: "مس.",
      adventurer: "مغامر",
      loading: "جارٍ التحميل...",
      categories: {
        code: "برمجة",
        fix: "إصلاح",
        deploy: "نشر",
        test: "اختبار",
        docs: "توثيق",
        refactor: "إعادة هيكلة",
        review: "مراجعة",
        ops: "عمليات",
        learn: "تعلّم",
        milestone: "إنجاز رئيسي",
        life: "حياة",
        health: "صحة",
        finance: "مالية",
        social: "اجتماعي",
        creative: "إبداعي",
        spiritual: "روحاني",
        hobby: "هواية",
      },
    },
    login: {
      subtitle: "سجّل الدخول لتتبع إنجازاتك",
      continueGoogle: "المتابعة مع Google",
      redirecting: "جارٍ إعادة التوجيه...",
      terms: "بتسجيل الدخول، أنت توافق على شروط الخدمة الخاصة بنا.",
    },
    error: {
      title: "حدث خطأ ما",
      message: "حدث خطأ غير متوقع.",
      errorId: "معرّف الخطأ: ",
      tryAgain: "حاول مرة أخرى",
    },
    notFound: {
      title: "الصفحة غير موجودة",
      description: "هذا الإنجاز لم يُفتح بعد.",
      backHome: "العودة للرئيسية",
    },
  },
  nl: {
    nav: { leaderboard: "Ranglijst", dashboard: "Dashboard" },
    home: {
      tagline: "Verander je dagelijkse taken in game-achtige prestaties.",
      tagline2:
        "Je leeftijd is je niveau — de vraag is wat je op dat niveau hebt bereikt.",
      installComment: "# Installeer met één commando",
      features: {
        gamify: {
          title: "Gamificeer alles",
          desc: "Verander dagelijkse taken in prestaties. Code, leven, gezondheid, leren — alles telt.",
        },
        streak: {
          title: "Volg je streak",
          desc: "Bouw momentum op met dagelijkse streaks. Je AI-coach houdt je gemotiveerd.",
        },
        compete: {
          title: "Concurreer en deel",
          desc: "Klim in de ranglijst. Ontgrendel titels. Deel je profiel met de wereld.",
        },
      },
      footer:
        "Werkt met Claude Desktop, Claude Code, ChatGPT Desktop, Cursor en meer.",
    },
    dashboard: {
      title: "Dashboard",
      publicProfile: "Openbaar profiel",
      settings: "Instellingen",
      totalXp: "Totaal XP",
      yearXp: "Jaar XP",
      streak: "Streak",
      bestStreak: "Beste streak",
      recentAchievements: "Recente prestaties",
      noAchievements:
        "Nog geen prestaties. Begin de MCP te gebruiken om de eerste te registreren!",
      noAchievementsHint: "# Installeer met één commando",
    },
    settings: {
      title: "Instellingen",
      displayName: "Weergavenaam",
      bio: "Bio",
      birthDate: "Geboortedatum (jouw niveau = jouw leeftijd)",
      publicDefault: "Prestaties standaard openbaar",
      save: "Opslaan",
      saving: "Opslaan...",
      saved: "Instellingen opgeslagen!",
      signOut: "Uitloggen",
    },
    leaderboard: {
      title: "Ranglijst",
      season: "Seizoen",
      thisYear: "Dit jaar",
      allTime: "Altijd",
      noEntries: "Nog geen deelnemers. Wees de eerste!",
      xp: "XP",
    },
    profile: {
      totalXp: "Totaal XP",
      yearXp: "Jaar XP",
      streak: "Streak",
      titles: "Titels",
      categoryBreakdown: "Categorieverdeling",
      recentAchievements: "Recente prestaties",
      noPublicAchievements: "Nog geen openbare prestaties.",
    },
    common: {
      lv: "Nv.",
      adventurer: "Avonturier",
      loading: "Laden...",
      categories: {
        code: "Programmeren",
        fix: "Bugfix",
        deploy: "Deployment",
        test: "Testen",
        docs: "Documentatie",
        refactor: "Refactoring",
        review: "Review",
        ops: "DevOps",
        learn: "Leren",
        milestone: "Mijlpaal",
        life: "Leven",
        health: "Gezondheid",
        finance: "Financiën",
        social: "Sociaal",
        creative: "Creatief",
        spiritual: "Spiritueel",
        hobby: "Hobby",
      },
    },
    login: {
      subtitle: "Log in om je prestaties bij te houden",
      continueGoogle: "Doorgaan met Google",
      redirecting: "Doorsturen...",
      terms: "Door in te loggen ga je akkoord met onze Servicevoorwaarden.",
    },
    error: {
      title: "Er ging iets mis",
      message: "Er is een onverwachte fout opgetreden.",
      errorId: "Fout-ID: ",
      tryAgain: "Opnieuw proberen",
    },
    notFound: {
      title: "Pagina niet gevonden",
      description: "Deze prestatie is nog niet ontgrendeld.",
      backHome: "Terug naar home",
    },
  },
  tr: {
    nav: { leaderboard: "Lider Tablosu", dashboard: "Gösterge Paneli" },
    home: {
      tagline: "Günlük görevlerini oyun gibi başarılara dönüştür.",
      tagline2: "Yaşın senin seviyendir — soru bu seviyede ne başardığındır.",
      installComment: "# Tek komutla kur",
      features: {
        gamify: {
          title: "Her şeyi oyunlaştır",
          desc: "Günlük görevleri başarılara dönüştür. Kod, yaşam, sağlık, öğrenme — her şey sayılır.",
        },
        streak: {
          title: "Serini takip et",
          desc: "Günlük serilerle ivme kazan. Yapay zeka koçun seni motive tutar.",
        },
        compete: {
          title: "Yarış ve Paylaş",
          desc: "Lider tablosuna tırman. Unvanlar kazan. Profilini dünyayla paylaş.",
        },
      },
      footer:
        "Claude Desktop, Claude Code, ChatGPT Desktop, Cursor ve daha fazlasıyla çalışır.",
    },
    dashboard: {
      title: "Gösterge Paneli",
      publicProfile: "Genel Profil",
      settings: "Ayarlar",
      totalXp: "Toplam XP",
      yearXp: "Yıllık XP",
      streak: "Seri",
      bestStreak: "En İyi Seri",
      recentAchievements: "Son Başarılar",
      noAchievements:
        "Henüz başarı yok. İlkini kaydetmek için MCP'yi kullanmaya başla!",
      noAchievementsHint: "# Tek komutla kur",
    },
    settings: {
      title: "Ayarlar",
      displayName: "Görünen Ad",
      bio: "Hakkımda",
      birthDate: "Doğum Tarihi (seviyeniz = yaşınız)",
      publicDefault: "Başarılar varsayılan olarak herkese açık",
      save: "Kaydet",
      saving: "Kaydediliyor...",
      saved: "Ayarlar kaydedildi!",
      signOut: "Çıkış Yap",
    },
    leaderboard: {
      title: "Lider Tablosu",
      season: "Sezon",
      thisYear: "Bu Yıl",
      allTime: "Tüm Zamanlar",
      noEntries: "Henüz kimse yok. İlk sen ol!",
      xp: "XP",
    },
    profile: {
      totalXp: "Toplam XP",
      yearXp: "Yıllık XP",
      streak: "Seri",
      titles: "Unvanlar",
      categoryBreakdown: "Kategori Dağılımı",
      recentAchievements: "Son Başarılar",
      noPublicAchievements: "Henüz genel başarı yok.",
    },
    common: {
      lv: "Sv.",
      adventurer: "Maceracı",
      loading: "Yükleniyor...",
      categories: {
        code: "Kodlama",
        fix: "Hata Düzeltme",
        deploy: "Dağıtım",
        test: "Test",
        docs: "Dokümantasyon",
        refactor: "Refaktör",
        review: "İnceleme",
        ops: "DevOps",
        learn: "Öğrenme",
        milestone: "Kilometre Taşı",
        life: "Yaşam",
        health: "Sağlık",
        finance: "Finans",
        social: "Sosyal",
        creative: "Yaratıcı",
        spiritual: "Ruhani",
        hobby: "Hobi",
      },
    },
    login: {
      subtitle: "Başarılarını takip etmek için giriş yap",
      continueGoogle: "Google ile devam et",
      redirecting: "Yönlendiriliyor...",
      terms: "Giriş yaparak Hizmet Şartlarımızı kabul edersiniz.",
    },
    error: {
      title: "Bir şeyler yanlış gitti",
      message: "Beklenmeyen bir hata oluştu.",
      errorId: "Hata ID: ",
      tryAgain: "Tekrar Dene",
    },
    notFound: {
      title: "Sayfa Bulunamadı",
      description: "Bu başarı henüz kilidini açmamış.",
      backHome: "Ana Sayfaya Dön",
    },
  },
  vi: {
    nav: { leaderboard: "Bảng xếp hạng", dashboard: "Bảng điều khiển" },
    home: {
      tagline:
        "Biến công việc hàng ngày thành những thành tích như trong game.",
      tagline2:
        "Tuổi của bạn là cấp độ của bạn — câu hỏi là bạn đã làm được gì ở cấp đó.",
      installComment: "# Cài đặt bằng một lệnh",
      features: {
        gamify: {
          title: "Gamify mọi thứ",
          desc: "Biến công việc thành thành tích. Code, cuộc sống, sức khỏe, học tập — mọi thứ đều được tính.",
        },
        streak: {
          title: "Theo dõi chuỗi ngày",
          desc: "Xây dựng đà với chuỗi ngày liên tiếp. Huấn luyện viên AI giữ bạn có động lực.",
        },
        compete: {
          title: "Cạnh tranh & Chia sẻ",
          desc: "Leo lên bảng xếp hạng. Mở khóa danh hiệu. Chia sẻ hồ sơ với thế giới.",
        },
      },
      footer:
        "Hoạt động với Claude Desktop, Claude Code, ChatGPT Desktop, Cursor và hơn thế nữa.",
    },
    dashboard: {
      title: "Bảng điều khiển",
      publicProfile: "Hồ sơ công khai",
      settings: "Cài đặt",
      totalXp: "Tổng XP",
      yearXp: "XP năm nay",
      streak: "Chuỗi ngày",
      bestStreak: "Chuỗi tốt nhất",
      recentAchievements: "Thành tích gần đây",
      noAchievements:
        "Chưa có thành tích. Bắt đầu dùng MCP để ghi lại thành tích đầu tiên!",
      noAchievementsHint: "# Cài đặt bằng một lệnh",
    },
    settings: {
      title: "Cài đặt",
      displayName: "Tên hiển thị",
      bio: "Giới thiệu",
      birthDate: "Ngày sinh (cấp độ = tuổi)",
      publicDefault: "Thành tích công khai theo mặc định",
      save: "Lưu",
      saving: "Đang lưu...",
      saved: "Đã lưu cài đặt!",
      signOut: "Đăng xuất",
    },
    leaderboard: {
      title: "Bảng xếp hạng",
      season: "Mùa giải",
      thisYear: "Năm nay",
      allTime: "Mọi thời đại",
      noEntries: "Chưa có ai. Hãy là người đầu tiên!",
      xp: "XP",
    },
    profile: {
      totalXp: "Tổng XP",
      yearXp: "XP năm nay",
      streak: "Chuỗi ngày",
      titles: "Danh hiệu",
      categoryBreakdown: "Phân loại theo danh mục",
      recentAchievements: "Thành tích gần đây",
      noPublicAchievements: "Chưa có thành tích công khai.",
    },
    common: {
      lv: "Cấp ",
      adventurer: "Nhà phiêu lưu",
      loading: "Đang tải...",
      categories: {
        code: "Lập trình",
        fix: "Sửa lỗi",
        deploy: "Triển khai",
        test: "Kiểm thử",
        docs: "Tài liệu",
        refactor: "Tái cấu trúc",
        review: "Đánh giá",
        ops: "Vận hành",
        learn: "Học tập",
        milestone: "Cột mốc",
        life: "Cuộc sống",
        health: "Sức khỏe",
        finance: "Tài chính",
        social: "Xã hội",
        creative: "Sáng tạo",
        spiritual: "Tâm linh",
        hobby: "Sở thích",
      },
    },
    login: {
      subtitle: "Đăng nhập để theo dõi thành tích của bạn",
      continueGoogle: "Tiếp tục với Google",
      redirecting: "Đang chuyển hướng...",
      terms: "Bằng việc đăng nhập, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.",
    },
    error: {
      title: "Đã xảy ra lỗi",
      message: "Đã xảy ra lỗi không mong muốn.",
      errorId: "Mã lỗi: ",
      tryAgain: "Thử lại",
    },
    notFound: {
      title: "Không tìm thấy trang",
      description: "Thành tích này chưa được mở khóa.",
      backHome: "Quay về trang chủ",
    },
  },
  id: {
    nav: { leaderboard: "Papan Peringkat", dashboard: "Dasbor" },
    home: {
      tagline: "Ubah tugas harianmu menjadi pencapaian seperti game.",
      tagline2:
        "Usiamu adalah levelmu — pertanyaannya adalah apa yang kamu capai di level itu.",
      installComment: "# Instal dengan satu perintah",
      features: {
        gamify: {
          title: "Gamifikasi segalanya",
          desc: "Ubah tugas harian menjadi pencapaian. Kode, kehidupan, kesehatan, belajar — semua dihitung.",
        },
        streak: {
          title: "Lacak streakmu",
          desc: "Bangun momentum dengan streak harian. Pelatih AI-mu membuatmu tetap termotivasi.",
        },
        compete: {
          title: "Bersaing & Berbagi",
          desc: "Naiki papan peringkat. Buka kunci gelar. Bagikan profilmu dengan dunia.",
        },
      },
      footer:
        "Bekerja dengan Claude Desktop, Claude Code, ChatGPT Desktop, Cursor, dan lainnya.",
    },
    dashboard: {
      title: "Dasbor",
      publicProfile: "Profil Publik",
      settings: "Pengaturan",
      totalXp: "Total XP",
      yearXp: "XP Tahun Ini",
      streak: "Streak",
      bestStreak: "Streak Terbaik",
      recentAchievements: "Pencapaian Terbaru",
      noAchievements:
        "Belum ada pencapaian. Mulai gunakan MCP untuk mencatat yang pertama!",
      noAchievementsHint: "# Instal dengan satu perintah",
    },
    settings: {
      title: "Pengaturan",
      displayName: "Nama Tampilan",
      bio: "Bio",
      birthDate: "Tanggal Lahir (levelmu = usiamu)",
      publicDefault: "Pencapaian publik secara default",
      save: "Simpan",
      saving: "Menyimpan...",
      saved: "Pengaturan tersimpan!",
      signOut: "Keluar",
    },
    leaderboard: {
      title: "Papan Peringkat",
      season: "Musim",
      thisYear: "Tahun Ini",
      allTime: "Sepanjang Waktu",
      noEntries: "Belum ada peserta. Jadilah yang pertama!",
      xp: "XP",
    },
    profile: {
      totalXp: "Total XP",
      yearXp: "XP Tahun Ini",
      streak: "Streak",
      titles: "Gelar",
      categoryBreakdown: "Distribusi Kategori",
      recentAchievements: "Pencapaian Terbaru",
      noPublicAchievements: "Belum ada pencapaian publik.",
    },
    common: {
      lv: "Lv.",
      adventurer: "Petualang",
      loading: "Memuat...",
      categories: {
        code: "Pemrograman",
        fix: "Perbaikan Bug",
        deploy: "Deploy",
        test: "Pengujian",
        docs: "Dokumentasi",
        refactor: "Refactoring",
        review: "Tinjauan",
        ops: "DevOps",
        learn: "Pembelajaran",
        milestone: "Tonggak",
        life: "Kehidupan",
        health: "Kesehatan",
        finance: "Keuangan",
        social: "Sosial",
        creative: "Kreatif",
        spiritual: "Spiritual",
        hobby: "Hobi",
      },
    },
    login: {
      subtitle: "Masuk untuk melacak pencapaianmu",
      continueGoogle: "Lanjutkan dengan Google",
      redirecting: "Mengalihkan...",
      terms: "Dengan masuk, kamu menyetujui Ketentuan Layanan kami.",
    },
    error: {
      title: "Terjadi kesalahan",
      message: "Terjadi kesalahan yang tidak terduga.",
      errorId: "ID Kesalahan: ",
      tryAgain: "Coba Lagi",
    },
    notFound: {
      title: "Halaman Tidak Ditemukan",
      description: "Pencapaian ini belum terbuka.",
      backHome: "Kembali ke Beranda",
    },
  },
};

export function t(locale: Locale) {
  return translations[locale] ?? translations["en"];
}
