import { type Component, createResource } from "solid-js";

interface SystemInfo {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
}

const fetchSystemInfo = async (): Promise<SystemInfo> => {
  const res = await fetch("/api/system-info");
  return res.json();
};

const ProgressBar: Component<{
  label: string;
  value: number;
  max: number;
  unit: string;
}> = (props) => {
  const percentage = () => Math.round((props.value / props.max) * 100);

  return (
    <div>
      <div class="mb-1 flex justify-between text-sm">
        <span class="text-gray-300">{props.label}</span>
        <span class="text-gray-400">
          {props.value}
          {props.unit} / {props.max}
          {props.unit}
        </span>
      </div>
      <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          class="h-full rounded-full bg-purple-500 transition-all duration-500"
          style={{ width: `${percentage()}%` }}
        />
      </div>
    </div>
  );
};

const App: Component = () => {
  const [systemInfo, { refetch }] = createResource(fetchSystemInfo);

  return (
    <div class="flex min-h-screen items-center justify-center bg-gray-900 p-6 text-white">
      <div class="w-full max-w-md space-y-6">
        <h1 class="text-center text-3xl font-bold tracking-tight">
          Ktulu Dashboard
        </h1>

        <div class="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">System Info</h2>
            <button
              type="button"
              class="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium transition hover:bg-purple-700 active:scale-95"
              onClick={refetch}
            >
              Refresh
            </button>
          </div>

          {systemInfo.loading && (
            <div class="flex justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-purple-500" />
            </div>
          )}

          {systemInfo.error && (
            <div class="rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              Server not connected
            </div>
          )}

          {systemInfo() && (
            <div class="space-y-4">
              <div>
                <div class="mb-1 flex justify-between text-sm">
                  <span class="text-gray-300">CPU</span>
                  <span class="text-gray-400">{systemInfo()?.cpuUsage}%</span>
                </div>
                <div class="h-3 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    class="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${systemInfo()?.cpuUsage}%` }}
                  />
                </div>
              </div>

              <ProgressBar
                label="Memory"
                value={systemInfo()?.memoryUsage ?? 0}
                max={systemInfo()?.totalMemory ?? 0}
                unit="MB"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
