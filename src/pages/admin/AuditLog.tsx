import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';

type LogEvent = 'created' | 'refunded';

interface AuditLogEntry {
  id: string;
  event: LogEvent;
  donationId: string;
  amount: number;
  userId?: string;
  timestamp: string;
}

const PAGE_SIZE = 10;

const AuditLog = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | LogEvent>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      if (filter !== 'all') {
        params.append('event', filter);
      }
      try {
        const res = await fetch(`/api/audit-logs?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.items || []);
        }
      } catch {
        setLogs([]);
      }
    };
    fetchLogs();
  }, [page, filter]);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Audit Log</h1>

        <div className="mb-4">
          <label className="mr-2">Filter:</label>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as 'all' | LogEvent);
              setPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="created">Created</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">Event</th>
              <th className="px-4 py-2 border">Donation ID</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">User ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 border">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 border capitalize">{log.event}</td>
                <td className="px-4 py-2 border">{log.donationId}</td>
                <td className="px-4 py-2 border">{log.amount}</td>
                <td className="px-4 py-2 border">{log.userId || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={nextPage}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLog;
