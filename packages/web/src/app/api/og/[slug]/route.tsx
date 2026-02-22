import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, avatar_url, total_xp, year_xp, current_streak, birth_date')
    .eq('username', slug)
    .single();

  if (!profile) {
    return new Response('User not found', { status: 404 });
  }

  const ageLevel = profile.birth_date
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : '?';

  const name = profile.display_name || profile.username;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#030712',
          color: '#f3f4f6',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: 24, opacity: 0.5, marginBottom: 24, display: 'flex' }}>
          LevelUp.log
        </div>

        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              width={80}
              height={80}
              style={{ borderRadius: '50%', border: '3px solid #34d399' }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', display: 'flex' }}>
              {name}
            </div>
            <div style={{ fontSize: 32, color: '#34d399', display: 'flex' }}>
              Lv.{ageLevel}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 48,
            fontSize: 20,
            borderTop: '1px solid #1f2937',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#34d399', display: 'flex' }}>
              {(profile.total_xp || 0).toLocaleString()}
            </div>
            <div style={{ color: '#6b7280', display: 'flex' }}>Total XP</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', display: 'flex' }}>
              {(profile.year_xp || 0).toLocaleString()}
            </div>
            <div style={{ color: '#6b7280', display: 'flex' }}>Year XP</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', display: 'flex' }}>
              {profile.current_streak || 0}
            </div>
            <div style={{ color: '#6b7280', display: 'flex' }}>Day Streak</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
