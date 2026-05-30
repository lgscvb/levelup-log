import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { sanitizeText } from '../_shared/sanitize.ts';

type EventType =
  | 'intent'
  | 'blocked'
  | 'started'
  | 'rough_done'
  | 'anti_started'
  | 'anti_stopped'
  | 'insight_recorded'
  | 'returned'
  | 'completed'
  | 'abandoned';

type QuestType = 'normal' | 'rough_version' | 'anti_task';
type QuestStatus =
  | 'planned'
  | 'started'
  | 'rough_done'
  | 'completed'
  | 'abandoned'
  | 'expired';

const VALID_EVENTS = new Set<EventType>([
  'intent',
  'blocked',
  'started',
  'rough_done',
  'anti_started',
  'anti_stopped',
  'insight_recorded',
  'returned',
  'completed',
  'abandoned',
]);

const VALID_QUEST_TYPES = new Set<QuestType>([
  'normal',
  'rough_version',
  'anti_task',
]);

const VALID_BLOCKERS = new Set([
  'perfectionism',
  'unclear_next_step',
  'too_large',
  'fear_of_judgment',
  'low_energy',
  'avoidance_loop',
  'other',
]);

const ACTIVE_STATUSES = ['planned', 'started', 'rough_done'];

function inferQuestType(eventType: EventType, questType?: QuestType): QuestType {
  if (questType) return questType;
  if (eventType === 'anti_started' || eventType === 'anti_stopped') return 'anti_task';
  if (eventType === 'rough_done') return 'rough_version';
  return 'normal';
}

function nextStatus(eventType: EventType, current?: QuestStatus): QuestStatus {
  switch (eventType) {
    case 'started':
    case 'anti_started':
    case 'returned':
      return 'started';
    case 'rough_done':
      return 'rough_done';
    case 'completed':
    case 'anti_stopped':
      return 'completed';
    case 'abandoned':
      return 'abandoned';
    case 'intent':
    case 'blocked':
    case 'insight_recorded':
    default:
      return current ?? 'planned';
  }
}

function publicSummary(eventType: EventType, questType: QuestType, supplied?: string): string {
  if (supplied?.trim()) return sanitizeText(supplied.trim());

  if (questType === 'rough_version' || eventType === 'rough_done') {
    return '交出了一個可修改的爛版本。';
  }
  if (eventType === 'returned') return '從逃避回到正向任務。';
  if (eventType === 'anti_stopped') return '停止一次反向任務並重新取得主控權。';
  if (questType === 'anti_task') return '把逃避行為變成有邊界的反向任務。';
  if (eventType === 'completed') return '完成一個抗拖延任務。';
  if (eventType === 'started') return '開始一個原本可能被拖延的任務。';
  return '推進了一個抗拖延任務。';
}

function deltasFor(eventType: EventType) {
  switch (eventType) {
    case 'intent':
      return { momentum: 1, initiation: 1, completion: 0, recovery: 0, focus: 0 };
    case 'started':
      return { momentum: 5, initiation: 5, completion: 0, recovery: 0, focus: 1 };
    case 'rough_done':
      return { momentum: 8, initiation: 3, completion: 0, recovery: 0, focus: 2 };
    case 'anti_stopped':
      return { momentum: 4, initiation: 0, completion: 0, recovery: 4, focus: 1 };
    case 'insight_recorded':
      return { momentum: 2, initiation: 0, completion: 0, recovery: 2, focus: 0 };
    case 'returned':
      return { momentum: 8, initiation: 0, completion: 0, recovery: 6, focus: 2 };
    case 'completed':
      return { momentum: 10, initiation: 0, completion: 10, recovery: 0, focus: 2 };
    default:
      return { momentum: 0, initiation: 0, completion: 0, recovery: 0, focus: 0 };
  }
}

function countDeltas(eventType: EventType) {
  return {
    quests_started: eventType === 'started' ? 1 : 0,
    quests_completed: eventType === 'completed' ? 1 : 0,
    rough_versions_count: eventType === 'rough_done' ? 1 : 0,
    returned_count: eventType === 'returned' ? 1 : 0,
    anti_tasks_stopped: eventType === 'anti_stopped' ? 1 : 0,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const user = await getAuthUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded (20/hour)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const rawSummary = String(body.summary || '').trim();
    if (!rawSummary) {
      return new Response(JSON.stringify({ error: 'summary is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const eventType = (body.event_type || 'intent') as EventType;
    if (!VALID_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ error: 'Invalid event_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestedQuestType = body.quest_type as QuestType | undefined;
    if (requestedQuestType && !VALID_QUEST_TYPES.has(requestedQuestType)) {
      return new Response(JSON.stringify({ error: 'Invalid quest_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const blockerType = body.blocker_type as string | undefined;
    if (blockerType && !VALID_BLOCKERS.has(blockerType)) {
      return new Response(JSON.stringify({ error: 'Invalid blocker_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const questType = inferQuestType(eventType, requestedQuestType);
    const summary = sanitizeText(rawSummary);
    const minimumDoneStandard = body.minimum_done_standard
      ? sanitizeText(String(body.minimum_done_standard))
      : null;
    const safePublicSummary = publicSummary(eventType, questType, body.public_summary);
    const now = new Date().toISOString();

    const supabase = getSupabaseClient(authHeader);

    let quest = null as any;
    if (body.related_quest_id) {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', body.related_quest_id)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      quest = data;
    }

    if (!quest && !['intent', 'blocked', 'started', 'anti_started'].includes(eventType)) {
      const { data } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ACTIVE_STATUSES)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      quest = data;
    }

    const targetStatus = nextStatus(eventType, quest?.status);
    const timeboxMinutes = body.timebox_minutes == null
      ? null
      : Math.max(1, Math.round(Number(body.timebox_minutes)));
    const quantityLimit = body.quantity_limit == null
      ? null
      : Math.max(1, Math.round(Number(body.quantity_limit)));

    if (!quest) {
      const { data, error } = await supabase
        .from('quests')
        .insert({
          user_id: user.id,
          quest_type: questType,
          status: targetStatus,
          summary,
          minimum_done_standard: minimumDoneStandard,
          blocker_type: blockerType || null,
          timebox_minutes: timeboxMinutes,
          quantity_limit: quantityLimit,
          public_summary: safePublicSummary,
          is_public: body.is_public ?? true,
          source_platform: body.source_platform || null,
          started_at: ['started', 'rough_done', 'completed'].includes(targetStatus) ? now : null,
          completed_at: ['completed', 'abandoned'].includes(targetStatus) ? now : null,
        })
        .select()
        .single();
      if (error) throw error;
      quest = data;
    } else {
      const updates: Record<string, unknown> = {
        status: targetStatus,
        updated_at: now,
      };
      if (quest.quest_type === 'normal' && questType !== 'normal') updates.quest_type = questType;
      if (minimumDoneStandard) updates.minimum_done_standard = minimumDoneStandard;
      if (blockerType) updates.blocker_type = blockerType;
      if (timeboxMinutes) updates.timebox_minutes = timeboxMinutes;
      if (quantityLimit) updates.quantity_limit = quantityLimit;
      if (body.public_summary) updates.public_summary = safePublicSummary;
      if (body.is_public != null) updates.is_public = body.is_public;
      if (!quest.started_at && ['started', 'rough_done', 'completed'].includes(targetStatus)) {
        updates.started_at = now;
      }
      if (!quest.completed_at && ['completed', 'abandoned'].includes(targetStatus)) {
        updates.completed_at = now;
      }

      const { data, error } = await supabase
        .from('quests')
        .update(updates)
        .eq('id', quest.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      quest = data;
    }

    const deltas = deltasFor(eventType);
    const counts = countDeltas(eventType);

    const { data: event, error: eventError } = await supabase
      .from('quest_events')
      .insert({
        user_id: user.id,
        quest_id: quest.id,
        event_type: eventType,
        summary,
        momentum_delta: deltas.momentum,
        initiation_delta: deltas.initiation,
        completion_delta: deltas.completion,
        recovery_delta: deltas.recovery,
        focus_delta: deltas.focus,
        metadata: {
          quest_type: quest.quest_type,
          status: quest.status,
          ...(body.related_quest_id ? { related_quest_id: body.related_quest_id } : {}),
        },
      })
      .select()
      .single();
    if (eventError) throw eventError;

    const { data: existingStats } = await supabase
      .from('user_momentum_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const nextStats = {
      user_id: user.id,
      momentum_score: (existingStats?.momentum_score || 0) + deltas.momentum,
      initiation_score: (existingStats?.initiation_score || 0) + deltas.initiation,
      completion_score: (existingStats?.completion_score || 0) + deltas.completion,
      recovery_score: (existingStats?.recovery_score || 0) + deltas.recovery,
      focus_score: (existingStats?.focus_score || 0) + deltas.focus,
      quests_started: (existingStats?.quests_started || 0) + counts.quests_started,
      quests_completed: (existingStats?.quests_completed || 0) + counts.quests_completed,
      rough_versions_count: (existingStats?.rough_versions_count || 0) + counts.rough_versions_count,
      returned_count: (existingStats?.returned_count || 0) + counts.returned_count,
      anti_tasks_stopped: (existingStats?.anti_tasks_stopped || 0) + counts.anti_tasks_stopped,
      updated_at: now,
    };

    const { data: momentumStats, error: statsError } = await supabase
      .from('user_momentum_stats')
      .upsert(nextStats, { onConflict: 'user_id' })
      .select()
      .single();
    if (statsError) throw statsError;

    return new Response(JSON.stringify({
      quest,
      event,
      deltas,
      momentum_stats: momentumStats,
      rate_limit_remaining: rateCheck.remaining,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
