import { useCallback, useEffect, useRef, useState } from 'react';
import { analyticsCall } from '../firebase/analytics';
type Count = { label: string; count: number };
type Report = { pageviews: number; visits: number; uniqueVisitors: number; firstTime: number; returning: number; activeSessions: number; guests: number; members: number; signups: number; enabled: boolean; retentionDays: number; truncated: boolean; start: string; end: string; location: string; pages: Count[]; sources: Count[]; devices: Count[]; browsers: Count[]; operatingSystems: Count[]; navigation: Count[]; daily: Count[] };
export default function AdminAnalytics() {
  const [period, setPeriod] = useState('7');
  const [start, setStart] = useState(''); const [end, setEnd] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [retention, setRetention] = useState(90);
  const requestVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setBusy(true); setError('');
    try {
      const data = await analyticsCall<Report>('websiteAnalyticsReport', { start: start ? new Date(`${start}T00:00:00Z`).toISOString() : new Date(Date.now() - Number(period) * 86400000).toISOString(), end: end ? new Date(`${end}T23:59:59Z`).toISOString() : undefined });
      if (version === requestVersion.current) { setReport(data); setRetention(data.retentionDays); }
    } catch { if (version === requestVersion.current) setError('Analytics could not load. Check backend deployment, App Check and administrator permissions.'); }
    finally { if (version === requestVersion.current) setBusy(false); }
  }, [period, start, end]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  async function configure() {
    setBusy(true); setError('');
    try { await analyticsCall('configureWebsiteAnalytics', { enabled: !report?.enabled, retentionDays: retention }); await load(); }
    catch { setError('Could not save analytics settings.'); } finally { setBusy(false); }
  }
  function download() {
    if (!report) return;
    const rows = [['ASBESOC visitor analytics', report.start, report.end], ['Metric', 'Count'],
      ...Object.entries(report).filter(([,v]) => typeof v === 'number').map(([k,v]) => [k,String(v)]),
      ...(['pages','sources','devices','browsers','operatingSystems','navigation','daily'] as const).flatMap(k => [[k,'Count'], ...report[k].map(r => [r.label,String(r.count)])]),
      ['Report truncated',String(report.truncated)], ['Coverage','Consenting browsers only; retained records, not lifetime totals']];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/^[=+@-]/, "'").replaceAll('"','""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF',csv], { type:'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'asbesoc-visitor-analytics.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="v2-overview"><div className="control-panel"><h2>Visitor analytics</h2>
    <p>Consenting browsers only. Visits are sessions; unique visitors are random browser estimates. First-time and returning groups may overlap when a visitor returns within the report period. Sessions can include guest and signed-in activity.</p>
    <div className="mt-4 flex flex-wrap gap-3"><label>Period <select value={period} onChange={e => { setPeriod(e.target.value); setStart(''); setEnd(''); }}><option value="1">Daily</option><option value="7">Weekly</option><option value="30">Monthly</option><option value="90">All available (90 days maximum)</option></select></label>
      <label>From (UTC) <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label><label>Through (UTC) <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
      <button className="control-button" disabled={busy} onClick={() => void load()}>Refresh</button><button className="control-button" disabled={!report || busy} onClick={download}>Export CSV</button></div>
    {busy && <p role="status">Loading…</p>}{error && <p role="alert" className="control-error">{error}</p>}
    {report && <><p className="mt-4">Collection: {report.enabled ? 'enabled' : 'disabled'}. Active now: {report.activeSessions} estimated sessions seen in the last five minutes. Refresh to update.</p>
      {report.truncated && <p role="alert" className="control-error">This report reached the 20,000-event limit and is incomplete. Choose a smaller date range.</p>}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{Object.entries({ Visits: report.visits, 'Page views': report.pageviews, 'Unique browsers': report.uniqueVisitors, 'First-time browsers': report.firstTime, 'Returning browsers': report.returning, 'Guest sessions': report.guests, 'Member sessions': report.members, 'Signups': report.signups }).map(([k,v]) => <div key={k}><small>{k}</small><h3>{v}</h3></div>)}</div>
      <p className="mt-4">Signup conversion: {report.uniqueVisitors ? (report.signups / report.uniqueVisitors * 100).toFixed(1) : '0'}% of measured browsers. {report.location}</p>
      <h3 className="mt-6">Daily page views</h3><div className="flex h-40 items-end gap-1" role="img" aria-label={report.daily.map(d => `${d.label}: ${d.count}`).join(', ') || 'No measured activity'}>{report.daily.map(d => <div title={`${d.label}: ${d.count}`} key={d.label} className="min-w-1 flex-1 rounded-t bg-emerald-700" style={{ height: `${Math.max(2, d.count / Math.max(...report.daily.map(r => r.count),1) * 100)}%` }} />)}</div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">{(['pages','sources','devices','browsers','operatingSystems','navigation'] as const).map(key => <div key={key}><h3>{key === 'operatingSystems' ? 'Operating systems' : key}</h3><table className="control-table"><thead><tr><th>Category</th><th>Page views</th></tr></thead><tbody>{report[key].slice(0,20).map(row => <tr key={row.label}><td>{row.label}</td><td>{row.count}</td></tr>)}</tbody></table>{!report[key].length && <p>No measured activity.</p>}</div>)}</div>
      <div className="mt-6"><label>Retention days <input type="number" min="1" max="90" value={retention} onChange={e => setRetention(Number(e.target.value))} /></label><button className="control-button" disabled={busy} onClick={() => void configure()}>{report.enabled ? 'Disable collection and save retention' : 'Enable collection and save retention'}</button><p>Retention is 1–90 days. Scheduled deletion applies shortened retention within 24 hours. Reporting covers retained data, with no claim to lifetime unique visitors.</p></div>
    </>}
  </div></section>;
}
