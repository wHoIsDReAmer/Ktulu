import { useSearchParams } from "@solidjs/router";
import {
  ArrowLeft,
  Download,
  File,
  FolderOpen,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-solid";
import {
  type Component,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";
import {
  deleteJson,
  downloadFile,
  fetchJson,
  putJsonBody,
  uploadFile,
} from "../lib/api";

interface FileEntry {
  name: string;
  type: string;
  size: number;
  modified: number;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (ts: number) => {
  if (ts === 0) return "--";
  return new Date(ts).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isTextFile = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return [
    "txt",
    "yml",
    "yaml",
    "json",
    "properties",
    "toml",
    "cfg",
    "conf",
    "ini",
    "log",
    "xml",
    "md",
    "sh",
    "bat",
    "csv",
  ].includes(ext);
};

const Files: Component = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [path, _setPath] = createSignal(searchParams.path || "/");
  const setPath = (p: string) => {
    _setPath(p);
    setSearchParams({ path: p === "/" ? undefined : p });
  };
  const [editPath, setEditPath] = createSignal<string | null>(null);
  const [editContent, setEditContent] = createSignal("");
  const [saving, setSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [deleting, setDeleting] = createSignal<string | null>(null);

  const [files, { refetch }] = createResource(path, (p) =>
    fetchJson<FileEntry[]>(`/files?path=${encodeURIComponent(p)}`),
  );

  const navigate = (name: string) => {
    const current = path().endsWith("/") ? path() : `${path()}/`;
    setPath(`${current}${name}`);
  };

  const goUp = () => {
    const parts = path().replace(/\/$/, "").split("/").filter(Boolean);
    parts.pop();
    setPath(parts.length > 0 ? `/${parts.join("/")}` : "/");
  };

  const breadcrumbs = () => {
    const parts = path().split("/").filter(Boolean);
    return [
      { name: "Server", path: "/" },
      ...parts.map((name, i) => ({
        name,
        path: `/${parts.slice(0, i + 1).join("/")}`,
      })),
    ];
  };

  const openEditor = async (filePath: string) => {
    try {
      const data = await fetchJson<{ content: string }>(
        `/files/content?path=${encodeURIComponent(filePath)}`,
      );
      setEditContent(data.content);
      setEditPath(filePath);
    } catch (e) {
      console.error("Failed to read file", e);
    }
  };

  const saveFile = async () => {
    const p = editPath();
    if (!p) return;
    setSaving(true);
    try {
      await putJsonBody(`/files/content?path=${encodeURIComponent(p)}`, {
        content: editContent(),
      });
      setEditPath(null);
    } catch (e) {
      console.error("Failed to save file", e);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      setUploading(true);
      try {
        for (const file of input.files) {
          await uploadFile(path(), file);
        }
        refetch();
      } catch (e) {
        console.error("Upload failed", e);
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  const handleDelete = async (name: string, type: string) => {
    const fullPath = path() === "/" ? `/${name}` : `${path()}/${name}`;
    if (
      !confirm(
        `${type === "directory" ? "폴더" : "파일"} "${name}"을(를) 삭제하시겠습니까?`,
      )
    )
      return;
    setDeleting(name);
    try {
      await deleteJson(`/files?path=${encodeURIComponent(fullPath)}`);
      refetch();
    } catch (e) {
      console.error("Delete failed", e);
    } finally {
      setDeleting(null);
    }
  };

  const filePath = (name: string) =>
    path() === "/" ? `/${name}` : `${path()}/${name}`;

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Files</h1>
          <p class="mt-1 text-sm text-surface-500">
            Browse and manage server files
          </p>
        </div>
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading()}
          class="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 active:scale-95 disabled:opacity-50"
        >
          {uploading() ? (
            <Loader2 size={16} class="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload
        </button>
      </div>

      <div class="flex items-center gap-1 rounded-xl border border-surface-300 bg-white px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-900">
        <Show when={path() !== "/"}>
          <button
            type="button"
            onClick={goUp}
            class="rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
        </Show>
        <For each={breadcrumbs()}>
          {(crumb, i) => (
            <>
              {i() > 0 && (
                <span class="text-surface-300 dark:text-surface-600">/</span>
              )}
              <button
                type="button"
                onClick={() => setPath(crumb.path)}
                class="rounded-md px-1.5 py-0.5 font-mono text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-white"
              >
                {crumb.name}
              </button>
            </>
          )}
        </For>
      </div>

      <div class="overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-surface-800 dark:bg-surface-900">
        <Show
          when={!files.loading}
          fallback={
            <div class="flex items-center justify-center py-12">
              <Loader2 size={24} class="animate-spin text-surface-400" />
            </div>
          }
        >
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
              <Show when={files()?.length === 0}>
                <tr>
                  <td
                    colspan="4"
                    class="px-4 py-8 text-center text-surface-400"
                  >
                    Empty directory
                  </td>
                </tr>
              </Show>
              <For each={files()}>
                {(file) => (
                  <tr class="border-b border-surface-100 transition-colors hover:bg-surface-50 dark:border-surface-800/50 dark:hover:bg-surface-800/30">
                    <td class="px-4 py-3">
                      <button
                        type="button"
                        class="flex items-center gap-2.5 text-left transition-colors hover:text-accent-500"
                        onClick={() => {
                          if (file.type === "directory") navigate(file.name);
                          else if (isTextFile(file.name))
                            openEditor(filePath(file.name));
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
                      {file.type === "directory" ? "--" : formatSize(file.size)}
                    </td>
                    <td class="px-4 py-3 text-surface-500">
                      {formatDate(file.modified)}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-1">
                        <Show
                          when={file.type === "file" && isTextFile(file.name)}
                        >
                          <button
                            type="button"
                            onClick={() => openEditor(filePath(file.name))}
                            class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
                          >
                            <span class="flex items-center gap-1">
                              <Pencil size={12} /> Edit
                            </span>
                          </button>
                        </Show>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await downloadFile(filePath(file.name));
                            } catch (e) {
                              console.error("Download failed", e);
                            }
                          }}
                          class="rounded-lg px-2.5 py-1 text-xs font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
                        >
                          <span class="flex items-center gap-1">
                            <Download size={12} />{" "}
                            {file.type === "directory" ? "ZIP" : "Download"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(file.name, file.type)}
                          disabled={deleting() === file.name}
                          class="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 disabled:opacity-50"
                        >
                          <span class="flex items-center gap-1">
                            {deleting() === file.name ? (
                              <Loader2 size={12} class="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>

      <Show when={editPath()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="mx-4 flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-surface-200 bg-white shadow-xl dark:border-surface-700 dark:bg-surface-900">
            <div class="flex items-center justify-between border-b border-surface-200 px-5 py-3 dark:border-surface-800">
              <span class="font-mono text-sm text-surface-600 dark:text-surface-400">
                {editPath()}
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveFile}
                  disabled={saving()}
                  class="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-accent-600 disabled:opacity-50"
                >
                  {saving() && <Loader2 size={12} class="animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditPath(null)}
                  class="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <textarea
              class="flex-1 resize-none bg-surface-50 p-4 font-mono text-sm outline-none dark:bg-surface-950 dark:text-surface-200"
              value={editContent()}
              onInput={(e) => setEditContent(e.currentTarget.value)}
              spellcheck={false}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Files;
