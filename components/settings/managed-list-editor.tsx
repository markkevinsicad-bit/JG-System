"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/shared/toast";

export function ManagedListEditor({
  items,
  addAction,
  toggleAction,
  placeholder,
}: {
  items: { id: string; name: string; is_active: boolean }[];
  addAction: (formData: FormData) => Promise<{ error?: string }>;
  toggleAction: (id: string, isActive: boolean) => Promise<{ error?: string }>;
  placeholder: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    const result = await addAction(formData);
    setAdding(false);

    if (result.error) {
      setError(result.error);
    } else {
      setName("");
      showToast("Added successfully.");
      router.refresh();
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const result = await toggleAction(id, isActive);
    if (result.error) showToast(result.error, "error");
    else router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="max-w-xs"
        />
        <Button type="submit" size="sm" loading={adding}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </form>
      {error && <p className="mb-3 text-xs text-red">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleToggle(item.id, item.is_active)}
            title={item.is_active ? "Click to deactivate" : "Click to activate"}
          >
            <Badge tone={item.is_active ? "green" : "gray"}>{item.name}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
