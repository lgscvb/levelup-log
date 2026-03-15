import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";

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
          }[],
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export default async function DashboardPage() {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch recent achievements (last 10)
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_at", { ascending: false })
    .limit(10);

  // Fetch active title
  const activeTitle = profile?.active_title_id
    ? (
        await supabase
          .from("title_definitions")
          .select("name, rarity")
          .eq("id", profile.active_title_id)
          .single()
      ).data
    : null;

  const ageLevel = profile?.birth_date
    ? Math.floor(
        (Date.now() - new Date(profile.birth_date).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : "?";

  return (
    <DashboardClient
      profile={profile}
      achievements={achievements}
      activeTitle={activeTitle}
      ageLevel={ageLevel}
    />
  );
}
