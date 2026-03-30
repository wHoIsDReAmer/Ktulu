import { Download, File, FolderOpen, Pencil } from "lucide-solid";
import { type Component, createSignal, For } from "solid-js";
import Card from "../components/Card";

interface FileEntry {
  name: string;
  type: "file" | "directory";
  size: string;
  modified: string;
}

const mockFiles: FileEntry[] = [
  {
    name: "server.properties",
    type: "file",
    size: "1.2 KB",
    modified: "2024-01-15",
  },
  { name: "bukkit.yml", type: "file", size: "3.4 KB", modified: "2024-01-14" },
  { name: "spigot.yml", type: "file", size: "5.1 KB", modified: "2024-01-14" },
  { name: "plugins/", type: "directory", size: "--", modified: "2024-01-15" },
  { name: "world/", type: "directory", size: "--", modified: "2024-01-13" },
  { name: "logs/", type: "directory", size: "--", modified: "2024-01-15" },
];

const Files: Component = () => {
  const [path, setPath] = createSignal("/");
  const [files] = createSignal(mockFiles);

  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-2xl font-bold">Files</h1>
        <p class="mt-1 text-sm text-surface-500">
          Browse and manage server files
        </p>
      </div>

      <div class="flex items-center gap-2 rounded-xl border border-surface-300 bg-white px-4 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-900">
        <FolderOpen size={16} class="text-surface-400" />
        <span class="font-mono text-surface-600 dark:text-surface-400">
          {path()}
        </span>
      </div>

      <Card title="File Browser">
        <div class="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-950">
              <tr>
                <th class="px-4 py-3 font-medium text-surface-500">Name</th>
                <th class="px-4 py-3 font-medium text-surface-500">Size</th>
                <th class="px-4 py-3 font-medium text-surface-500">Modified</th>
                <th class="px-4 py-3 font-medium text-surface-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={files()}>
                {(file) => (
                  <tr class="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-800/30">
                    <td class="px-4 py-3">
                      <button
                        type="button"
                        class="flex items-center gap-2.5 text-left transition-colors hover:text-accent-500"
                        onClick={() => {
                          if (file.type === "directory")
                            setPath(`${path()}${file.name}`);
                        }}
                      >
                        {file.type === "directory" ? (
                          <FolderOpen size={16} class="text-accent-500" />
                        ) : (
                          <File size={16} class="text-surface-400" />
                        )}
                        <span
                          class={
                            file.type === "directory"
                              ? "font-medium text-accent-600 dark:text-accent-400"
                              : ""
                          }
                        >
                          {file.name}
                        </span>
                      </button>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-surface-500">
                      {file.size}
                    </td>
                    <td class="px-4 py-3 text-surface-500">{file.modified}</td>
                    <td class="px-4 py-3">
                      {file.type === "file" && (
                        <div class="flex gap-1">
                          <button
                            type="button"
                            class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
                          >
                            <span class="flex items-center gap-1">
                              <Pencil size={12} /> Edit
                            </span>
                          </button>
                          <button
                            type="button"
                            class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
                          >
                            <span class="flex items-center gap-1">
                              <Download size={12} /> Download
                            </span>
                          </button>
                        </div>
                      )}
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

export default Files;
