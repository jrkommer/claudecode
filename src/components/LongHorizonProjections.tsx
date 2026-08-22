import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useCrossroadsStore } from '../store/useCrossroadsStore';
import { computeIsDark, watchTheme } from '../utils/theme';
import { Card, SectionTitle } from './ui';

ChartJS.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PALETTE_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const PALETTE_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];

function usePrefersDark(): boolean {
  const [dark, setDark] = useState(computeIsDark);
  useEffect(() => watchTheme(() => setDark(computeIsDark())), []);
  return dark;
}

function ChartBlock({
  title,
  subtitle,
  chartKey,
  series,
  labels,
  palette,
  ink,
  muted,
  grid,
}: {
  title: string;
  subtitle: string;
  chartKey: 'adult' | 'kids';
  series: Record<string, { year: number; value: number }[]>;
  labels: Record<string, string>;
  palette: string[];
  ink: string;
  muted: string;
  grid: string;
}) {
  const updateTimelinePoint = useCrossroadsStore((s) => s.updateTimelinePoint);
  const seriesKeys = Object.keys(series);
  const years = series[seriesKeys[0]]?.map((p) => p.year) ?? [];

  const data = {
    datasets: seriesKeys.map((key, i) => ({
      label: labels[key] ?? key,
      data: series[key].map((p) => ({ x: p.year, y: p.value })),
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length],
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.25,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: ink, boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'nearest' as const, intersect: false },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: 20,
        title: { display: true, text: 'Years', color: muted, font: { size: 11 } },
        ticks: { color: muted, font: { size: 11 }, stepSize: 5 },
        grid: { color: grid },
      },
      y: {
        min: 0,
        max: 10,
        ticks: { color: muted, font: { size: 11 } },
        grid: { color: grid },
        title: { display: true, text: 'Happiness (0-10)', color: muted, font: { size: 11 } },
      },
    },
  };

  return (
    <Card>
      <SectionTitle title={title} subtitle={subtitle} />
      <div style={{ height: 320 }} className="mb-4">
        <Line data={data} options={options} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="border-b border-slate-200 p-1.5 text-left font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Series
              </th>
              {years.map((y) => (
                <th key={y} className="border-b border-slate-200 p-1.5 text-center font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  yr {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seriesKeys.map((key) => (
              <tr key={key}>
                <td className="border-b border-slate-100 p-1.5 font-medium text-slate-700 dark:border-slate-700/60 dark:text-slate-300">
                  {labels[key] ?? key}
                </td>
                {series[key].map((point) => (
                  <td key={point.year} className="border-b border-slate-100 p-1 dark:border-slate-700/60">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={point.value}
                      onChange={(e) => updateTimelinePoint(chartKey, key, point.year, Number(e.target.value))}
                      className="w-14 rounded border border-slate-300 bg-white px-1 py-0.5 text-center text-xs text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function LongHorizonProjections() {
  const customTimelineData = useCrossroadsStore((s) => s.customTimelineData);
  const dark = usePrefersDark();
  const palette = dark ? PALETTE_DARK : PALETTE_LIGHT;
  const muted = '#898781';
  const grid = dark ? '#2c2c2a' : '#e1e0d9';
  const ink = dark ? '#ffffff' : '#0b0b0b';

  if (!customTimelineData) {
    return (
      <Card>
        <SectionTitle
          title="Long-horizon trajectories"
          subtitle="This view appears when a preset with hand-authored 20-year trajectory data is loaded (e.g. the divorce/affair-recovery example on the Values tab)."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ChartBlock
        title="Adult happiness, 20 years"
        subtitle="Illustrative long-horizon curves per path, editable via the grid below each chart. These are hand-set reference points, not computed from your scoring grid — treat them as a starting sketch to argue with."
        chartKey="adult"
        series={customTimelineData.adult}
        labels={customTimelineData.adultSeriesLabels}
        palette={palette}
        ink={ink}
        muted={muted}
        grid={grid}
      />
      <ChartBlock
        title="Kids' happiness, 20 years"
        subtitle="Six trajectories, because for kids the how of a split matters as much as the whether."
        chartKey="kids"
        series={customTimelineData.kids}
        labels={customTimelineData.kidsSeriesLabels}
        palette={palette}
        ink={ink}
        muted={muted}
        grid={grid}
      />
      {customTimelineData.calloutAnnotation && (
        <div className="rounded-lg border border-teal-300 bg-teal-50 p-4 text-sm text-teal-900 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-200">
          {customTimelineData.calloutAnnotation}
        </div>
      )}
    </div>
  );
}
