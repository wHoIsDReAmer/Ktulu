import { type Component, createSignal, For } from "solid-js";
import Card from "../components/Card";

interface Player {
  name: string;
  uuid: string;
  online: boolean;
  lastSeen: string;
}

const mockPlayers: Player[] = [
  { name: "Steve", uuid: "a1b2c3d4", online: true, lastSeen: "Now" },
  { name: "Alex", uuid: "e5f6g7h8", online: true, lastSeen: "Now" },
  { name: "Notch", uuid: "i9j0k1l2", online: false, lastSeen: "2024-01-14" },
  {
    name: "Herobrine",
    uuid: "m3n4o5p6",
    online: false,
    lastSeen: "2024-01-10",
  },
];

const Users: Component = () => {
  const [players] = createSignal(mockPlayers);
  const [search, setSearch] = createSignal("");

  const filtered = () =>
    players().filter((p) =>
      p.name.toLowerCase().includes(search().toLowerCase()),
    );

  const onlineCount = () => players().filter((p) => p.online).length;

  return (
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Users</h1>
          <p class="mt-1 text-sm text-surface-500">Manage connected players</p>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5 text-sm font-medium text-green-600 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400">
          <span class="h-2 w-2 rounded-full bg-green-500" />
          {onlineCount()} online
        </span>
      </div>

      <input
        type="text"
        placeholder="Search players..."
        class="w-full rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-surface-700 dark:bg-surface-900 dark:placeholder:text-surface-600 dark:focus:border-accent-400"
        value={search()}
        onInput={(e) => setSearch(e.currentTarget.value)}
      />

      <Card title="Player List">
        <div class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
              <tr>
                <th class="px-4 py-3 font-medium text-surface-500">Player</th>
                <th class="px-4 py-3 font-medium text-surface-500">Status</th>
                <th class="px-4 py-3 font-medium text-surface-500">
                  Last Seen
                </th>
                <th class="px-4 py-3 font-medium text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={filtered()}>
                {(player) => (
                  <tr class="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-800/30">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/10 text-sm font-bold text-accent-500">
                          {player.name[0]}
                        </div>
                        <div>
                          <p class="font-medium">{player.name}</p>
                          <p class="font-mono text-xs text-surface-400">
                            {player.uuid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          player.online
                            ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                            : "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500"
                        }`}
                      >
                        <span
                          class={`h-1.5 w-1.5 rounded-full ${
                            player.online ? "bg-green-500" : "bg-surface-400"
                          }`}
                        />
                        {player.online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-surface-500">
                      {player.lastSeen}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-1">
                        <button
                          type="button"
                          class="rounded-lg px-2.5 py-1 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/30"
                        >
                          Kick
                        </button>
                        <button
                          type="button"
                          class="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Users;
