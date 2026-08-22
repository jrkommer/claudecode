import { useEffect, useState } from 'react';
import {
  CategoryScale,
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
import { projectScenario, replayHistory } from '../utils/timeline';
import { computeIsDark, watchTheme } from '../utils/theme';
import { Card, SectionTitle } from './ui';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CATEGORICAL_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'];
const CATEGORICAL_DARK = ['#3987e5', '#d95926', '#199e70', '#c98500'];

function usePrefersDark(): boolean {
  const [dark, setDark] = useState(computeIsDark);
  useEffect(() => watchTheme(() => setDark(computeIsDark())), []);
  return dark;
}

export function TimelineChart() {
  const values = useCrossroadsStore((s) => s.values);
  const scenarios = useCrossroadsStore((s) => s.scenarios);
  const editHistory = useCrossroadsStore((s) => s.editHistory);
  const dark = usePrefersDark();
  const palette = dark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const muted = dark ? '#898781' : '#898781';
  const grid = dark ? '#2c2c2a' : '#e1e0d9';
  const ink = dark ? '#ffffff' : '#0b0b0b';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const focusScenarioId = scenarios.find((s) => s.id === selectedScenarioId) ? selectedScenarioId : (scenarios[0]?.id ?? '');

  if (values.length === 0 || scenarios.length === 0) {
    return (
      <Card>
        <SectionTitle title="Timeline" subtitle="Add values and scenarios first to see projections here." />
      </Card>
    );
  }

  const history = replayHistory(editHistory, scenarios, values);
  const focusScenario = scenarios.find((s) => s.id === focusScenarioId) ?? scenarios[0];
  const projection = projectScenario(focusScenario, values);

  const historyData = {
    labels: history.map((p) => p.label),
    datasets: scenarios.map((sc, i) => ({
      label: sc.name,
      data: history.map((p) => p.values[sc.id] ?? 0),
      borderColor: palette[i % palette.length],
      backgroundColor: palette[i % palette.length],
      borderWidth: 2,
      pointRadius: 3,
      tension: 0.3,
    })),
  };

  const bandFill = dark ? 'rgba(57,135,229,0.15)' : 'rgba(42,120,214,0.12)';
  const projectionData = {
    labels: projection.map((p) => p.label),
    datasets: [
      {
        label: 'High end',
        data: projection.map((p) => p.high),
        borderColor: 'transparent',
        backgroundColor: bandFill,
        pointRadius: 0,
        fill: 1,
      },
      {
        label: 'Expected',
        data: projection.map((p) => p.expected),
        borderColor: palette[0],
        backgroundColor: bandFill,
        borderWidth: 2,
        pointRadius: 3,
        tension: 0,
        fill: 2,
      },
      {
        label: 'Low end',
        data: projection.map((p) => p.low),
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: ink, boxWidth: 12, font: { size: 11 } } },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { ticks: { color: muted, font: { size: 11 } }, grid: { color: grid } },
      y: {
        min: 0,
        max: 10,
        ticks: { color: muted, font: { size: 11 } },
        grid: { color: grid },
        title: { display: true, text: 'Expected value (0-10)', color: muted, font: { size: 11 } },
      },
    },
  };

  const projectionOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        labels: {
          color: ink,
          boxWidth: 12,
          font: { size: 11 },
          filter: (item: { text: string }) => item.text === 'Expected',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle
          title="Decision confidence over time"
          subtitle="Each point is a snapshot of expected value (weighted score x probability) right after one of your edits, in the order you made them."
        />
        {history.length < 2 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Make a few edits to values or scores to see a trajectory here.</p>
        ) : (
          <div style={{ height: 320 }}>
            <Line data={historyData} options={commonOptions} />
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle
            title="Illustrative future projection"
            subtitle="Not a forecast — a visualization of how uncertainty widens the further out and the less confident your probability estimate. The band reflects your own inputs, not external data."
          />
          <select
            value={focusScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ height: 320 }}>
          <Line data={projectionData} options={projectionOptions} />
        </div>
      </Card>
    </div>
  );
}
