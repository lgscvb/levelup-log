-- =============================================================================
-- 修復安全問題：為 seasons 與 title_definitions 啟用 RLS
-- =============================================================================
--
-- 背景：
--   10 張表中有 8 張已啟用 RLS，唯獨 seasons 與 title_definitions 尚未啟用。
--   - seasons：風險較高，任何已驗證使用者可修改賽季參數
--   - title_definitions：靜態參考資料，風險較低但仍應保護
--
-- 策略：
--   - 兩張表皆啟用 RLS，僅開放 SELECT（唯讀）
--   - 不建立 INSERT / UPDATE / DELETE policy → RLS 預設拒絕寫入
--   - service_role 會繞過 RLS，Edge Function 寫入不受影響
-- =============================================================================

-- seasons 表：啟用 RLS + 唯讀 policy
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read seasons" ON public.seasons
  FOR SELECT USING (true);

-- title_definitions 表：啟用 RLS + 唯讀 policy
ALTER TABLE public.title_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read title definitions" ON public.title_definitions
  FOR SELECT USING (true);
