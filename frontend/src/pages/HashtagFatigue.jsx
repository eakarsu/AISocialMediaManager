import { useState } from 'react';

export default function HashtagFatigue() {
  const [form, setForm] = useState({ repeatedTags: 7, postsLast7Days: 18, avgEngagementDropPct: 22, platformCount: 3 });
  const [result, setResult] = useState(null);
  const submit = async () => {
    const response = await fetch('/api/hashtag-fatigue/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      body: JSON.stringify(form),
    });
    setResult(await response.json());
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Hashtag Fatigue Guard</h1>
      <div className="rounded-xl bg-slate-800 p-6 space-y-3">
        {Object.entries(form).map(([key, value]) => (
          <label key={key} className="block text-slate-200">{key.replace(/([A-Z])/g, ' $1')}
            <input className="w-full mt-1 rounded bg-slate-900 p-2" type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} />
          </label>
        ))}
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={submit}>Score fatigue</button>
      </div>
      {result && <div className="rounded-xl bg-slate-800 p-6 text-slate-100"><h2>{result.level.toUpperCase()} · {result.score}/100</h2><ul>{result.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></div>}
    </div>
  );
}
