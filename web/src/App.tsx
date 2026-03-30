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

const App: Component = () => {
  const [systemInfo, { refetch }] = createResource(fetchSystemInfo);

  return (
    <div>
      <h1>Ktulu Dashboard</h1>
      <section>
        <h2>System Info</h2>
        {systemInfo.loading && <p>Loading...</p>}
        {systemInfo.error && <p>Server not connected</p>}
        {systemInfo() && (
          <ul>
            <li>CPU: {systemInfo()?.cpuUsage}%</li>
            <li>
              Memory: {systemInfo()?.memoryUsage}MB /{" "}
              {systemInfo()?.totalMemory}MB
            </li>
          </ul>
        )}
        <button type="button" onClick={refetch}>
          Refresh
        </button>
      </section>
    </div>
  );
};

export default App;
