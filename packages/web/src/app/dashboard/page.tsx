import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export default async function DashboardPage() {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch recent achievements (last 10)
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(10);

  // Fetch active title
  const activeTitle = profile?.active_title_id
    ? (
        await supabase
          .from('title_definitions')
          .select('name, rarity')
          .eq('id', profile.active_title_id)
          .single()
      ).data
    : null;

  const ageLevel = profile?.birth_date
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : '?';

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="text-sm text-emerald-400 hover:underline"
            >
              Public Profile
            </Link>
          )}
          <Link
            href="/dashboard/settings"
            className="text-sm text-gray-400 hover:text-white"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">
              {profile?.display_name || profile?.username || 'Adventurer'}
              <span className="ml-2 text-emerald-400">Lv.{ageLevel}</span>
            </h2>
            {activeTitle && (
              <span
                className={`text-sm ${
                  activeTitle.rarity === 'legendary'
                    ? 'text-yellow-400'
                    : activeTitle.rarity === 'epic'
                      ? 'text-purple-400'
                      : activeTitle.rarity === 'rare'
                        ? 'text-blue-400'
                        : 'text-gray-400'
                }`}
              >
                {activeTitle.name}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">
              {profile?.total_xp?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">Total XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.year_xp?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">Year XP</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.current_streak || 0}
            </div>
            <div className="text-xs text-gray-500">Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {profile?.longest_streak || 0}
            </div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <h3 className="mb-4 text-lg font-semibold">Recent Achievements</h3>
      {achievements && achievements.length > 0 ? (
        <div className="space-y-3">
          {achievements.map((a: any) => (
            <div
              key={a.id}
              className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{a.title}</span>
                  <span className="ml-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                    {a.category}
                  </span>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  +{a.xp} XP
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-400">{a.description}</p>
              <time className="mt-1 block text-xs text-gray-600">
                {new Date(a.recorded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-800 p-8 text-center text-gray-500">
          <p>No achievements yet. Start using the MCP to record your first!</p>
          <code className="mt-2 block text-sm text-emerald-400">
            npx @levelup-log/mcp-server init
          </code>
        </div>
      )}
    </main>
  );
}
