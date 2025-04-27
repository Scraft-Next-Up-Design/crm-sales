-- Calculate workspace revenue
CREATE OR REPLACE FUNCTION calculate_workspace_revenue(workspace_id bigint)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(revenue)
     FROM leads
     WHERE workspace_id = $1
     AND status = 'closed'),
    0
  );
END;
$$;

-- Get workspace leads statistics
CREATE OR REPLACE FUNCTION get_workspace_leads_stats(workspace_id bigint)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'arrivedLeadsCount', COALESCE(arrived.count, 0),
    'totalLeadsCount', COALESCE(total.count, 0),
    'qualifiedLeadsCount', COALESCE(qualified.count, 0)
  ) INTO result
  FROM (
    SELECT COUNT(*) as count
    FROM leads
    WHERE workspace_id = $1
    AND status = 'arrived'
  ) arrived,
  (
    SELECT COUNT(*) as count
    FROM leads
    WHERE workspace_id = $1
  ) total,
  (
    SELECT COUNT(*) as count
    FROM leads
    WHERE workspace_id = $1
    AND status = 'qualified'
  ) qualified;

  RETURN result;
END;
$$;

-- Create materialized view for workspace statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS workspace_stats
AS
SELECT
  w.id as workspace_id,
  w.name as workspace_name,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'qualified' THEN l.id END) as qualified_leads,
  COUNT(DISTINCT CASE WHEN l.status = 'arrived' THEN l.id END) as arrived_leads,
  SUM(CASE WHEN l.status = 'closed' THEN l.revenue ELSE 0 END) as total_revenue
FROM
  workspaces w
  LEFT JOIN leads l ON w.id = l.workspace_id
GROUP BY
  w.id, w.name
WITH DATA;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS workspace_stats_workspace_id_idx
ON workspace_stats(workspace_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_workspace_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY workspace_stats;
  RETURN NULL;
END;
$$;

-- Create trigger to refresh materialized view
CREATE TRIGGER refresh_workspace_stats_trigger
AFTER INSERT OR UPDATE OR DELETE
ON leads
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_workspace_stats();