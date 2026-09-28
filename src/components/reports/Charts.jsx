// Big, labelled report charts (2026-09-28), read at a glance. Colours follow
// the validated categorical palette in fixed order (never cycled), ordered
// magnitude uses one hue light → dark, and every mark carries a direct label
// because three of the hues sit under 3:1 contrast.
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
/** One hue, light → dark: for ordered buckets like days past due. */
export const RAMP_RED = ['#f5b8ae', '#ee8a7c', '#e05a4b', '#c23a2d', '#8f2019'];
export const STATUS = { good: '#1f8a3b', warning: '#c98500', serious: '#d4570f', critical: '#c62828', neutral: '#8a8983' };

const INK = '#0b0b0b';
const INK_2 = '#52514e';
const GRID = '#e7e6e1';

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
/** ₹12.4L / ₹3.2Cr — short enough to sit on a bar. */
export const inrShort = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
  if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(0)}k`;
  return `₹${Math.round(v)}`;
};

export function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 ${className}`}>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Kpis({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([label, value, tone]) => (
        <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${tone || 'text-gray-900'}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

const tooltipStyle = { borderRadius: 12, border: `1px solid ${GRID}`, fontSize: 13 };

/**
 * Donut for part-to-whole. `data` = [{ name, value, color? }]. Each slice is
 * labelled with its share; the legend lists name + formatted value.
 */
export function Donut({ data, format = (v) => v, height = 340, colors = SERIES, centerLabel = 'Total' }) {
  const rows = data.filter((d) => d.value > 0);
  const total = rows.reduce((s, d) => s + d.value, 0);
  if (!total) return <p className="py-16 text-center text-sm text-gray-500">Nothing to show yet.</p>;
  return (
    <div style={{ height }} role="img" aria-label={rows.map((d) => `${d.name} ${format(d.value)}`).join(', ')}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" cy="44%" innerRadius="50%" outerRadius="76%" paddingAngle={rows.length > 1 ? 1.5 : 0} stroke="#fff" strokeWidth={rows.length > 1 ? 2 : 0}
            label={({ percent }) => (percent >= 0.04 ? `${Math.round(percent * 100)}%` : '')} labelLine={false} isAnimationActive={false}>
            {rows.map((d, i) => <Cell key={d.name} fill={d.color ?? colors[i % colors.length]} />)}
          </Pie>
          <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 22, fontWeight: 700, fill: INK }}>{format(total)}</text>
          <text x="50%" y="44%" dy={22} textAnchor="middle" style={{ fontSize: 12, fill: INK_2 }}>{centerLabel}</text>
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [format(v), n]} />
          <Legend verticalAlign="bottom" iconType="circle" formatter={(n) => {
            const d = rows.find((r) => r.name === n);
            return <span style={{ color: INK }}>{n} · <b>{format(d?.value)}</b></span>;
          }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Vertical bars. `series` = [{ key, name, color? }]; one series needs no legend.
 * Values are printed on the bars; `format` shapes axis, labels and tooltip.
 */
export function Bars({ data, xKey, series, format = (v) => v, height = 340, colorFor }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={xKey} tick={{ fill: INK_2, fontSize: 12 }} axisLine={{ stroke: GRID }} tickLine={false} interval={0} />
          <YAxis tickFormatter={format} allowDecimals={false} tick={{ fill: INK_2, fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [format(v), n]} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />}
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? SERIES[i]} radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
              {colorFor && data.map((row) => <Cell key={row[xKey]} fill={colorFor(row)} />)}
              <LabelList dataKey={s.key} position="top" formatter={(v) => (v ? format(v) : '')} style={{ fill: INK, fontSize: 11, fontWeight: 600 }} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal ranking (top N): name on the left, the value at the bar end. */
export function RankBars({ data, format = (v) => v, color = SERIES[0], height }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-gray-500">Nothing to show yet.</p>;
  return (
    <div style={{ height: height ?? Math.max(160, data.length * 40 + 20) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 76, left: 8, bottom: 0 }} barCategoryGap="24%">
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={170} tick={{ fill: INK, fontSize: 13 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [format(v), 'Value']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={30} isAnimationActive={false}>
            {data.map((d) => <Cell key={d.name} fill={d.color ?? color} />)}
            <LabelList dataKey="value" position="right" formatter={format} style={{ fill: INK, fontSize: 12, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Histogram: how many `values` fall in each [edge_i, edge_i+1) bin, labelled "0–7 d". */
export function Histogram({ values, edges, unit = 'd', height = 300, color = SERIES[1], what = 'Count' }) {
  const bins = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1];
    return { name: hi === Infinity ? `${lo}+ ${unit}` : `${lo}–${hi - 1} ${unit}`, count: values.filter((v) => v >= lo && v < hi).length };
  });
  return <Bars data={bins} xKey="name" series={[{ key: 'count', name: what, color }]} height={height} />;
}
