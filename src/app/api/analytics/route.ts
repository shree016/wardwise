import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    const [issuesRes, tendersRes, contractorsRes, complaintsRes] = await Promise.all([
      supabase.from('issues').select('id, issue_type, severity, status, ward_name, ward_number, reported_count, created_at, verified_at, fixed_at'),
      supabase.from('tenders').select('id, status, estimated_cost, awarded_amount, released_amount, estimated_days, actual_completion, expected_completion, contractor_id'),
      supabase.from('contractors').select('id, name, company, reliability_score, completed_projects, average_quality_score, corruption_complaints_count, is_blacklisted'),
      supabase.from('corruption_complaints').select('id, issue_id, complaint_type, status, created_at'),
    ]);

    const issues = issuesRes.data || [];
    const tenders = tendersRes.data || [];
    const contractors = contractorsRes.data || [];
    const complaints = complaintsRes.data || [];

    // Ward heatmap
    const wardMap: Record<string, any> = {};
    issues.forEach(i => {
      const w = i.ward_name || 'Unknown';
      if (!wardMap[w]) wardMap[w] = { ward: w, total: 0, open: 0, fixed: 0, verified: 0, high: 0 };
      wardMap[w].total++;
      if (i.status === 'open') wardMap[w].open++;
      if (i.status === 'fixed') wardMap[w].fixed++;
      if (i.status === 'verified') wardMap[w].verified++;
      if (i.severity === 'high') wardMap[w].high++;
    });
    const wardHeatmap = Object.values(wardMap).sort((a: any, b: any) => b.total - a.total);

    // Issue type breakdown
    const typeBreakdown: Record<string, number> = {};
    issues.forEach(i => { typeBreakdown[i.issue_type] = (typeBreakdown[i.issue_type] || 0) + 1; });

    // Avg resolution time (days)
    const resolved = issues.filter(i => i.verified_at && i.created_at);
    const avgResolutionDays = resolved.length > 0
      ? Math.round(resolved.reduce((sum, i) => {
          const days = (new Date(i.verified_at).getTime() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / resolved.length)
      : 0;

    // Contractor performance
    const contractorPerf = contractors.map(c => ({
      ...c,
      pending_tenders: tenders.filter(t => t.contractor_id === c.id && t.status === 'in_progress').length,
    })).sort((a, b) => b.reliability_score - a.reliability_score);

    // Complaint hotspots
    const complaintByType: Record<string, number> = {};
    complaints.forEach(c => { complaintByType[c.complaint_type || 'other'] = (complaintByType[c.complaint_type || 'other'] || 0) + 1; });

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          total_issues: issues.length,
          open: issues.filter(i => i.status === 'open').length,
          fixed: issues.filter(i => i.status === 'fixed').length,
          verified: issues.filter(i => i.status === 'verified').length,
          high_severity: issues.filter(i => i.severity === 'high').length,
          avg_resolution_days: avgResolutionDays,
          total_complaints: complaints.length,
          open_complaints: complaints.filter(c => c.status === 'open').length,
        },
        ward_heatmap: wardHeatmap,
        type_breakdown: typeBreakdown,
        contractor_performance: contractorPerf,
        complaint_hotspots: complaintByType,
        tender_stats: {
          total: tenders.length,
          open: tenders.filter(t => t.status === 'open').length,
          in_progress: tenders.filter(t => t.status === 'in_progress').length,
          completed: tenders.filter(t => t.status === 'completed').length,
          total_budget: tenders.reduce((s, t) => s + (t.awarded_amount || 0), 0),
          released: tenders.reduce((s, t) => s + (t.released_amount || 0), 0),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
