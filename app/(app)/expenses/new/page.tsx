"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { demoProjects, demoCategories } from "@/lib/demo-data";

const paymentMethods = ["Cash", "Bank Transfer", "Card", "Other"];

export default function NewExpensePage() {
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Phase 1: form + validation-ready architecture only.
    // Real Supabase insert wiring arrives in Phase 2.
    setTimeout(() => setSubmitting(false), 900);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">New Expense</h1>
        <p className="mt-1 text-sm text-gray-500">Submit a new project expense for review.</p>
      </div>

      <Card className="animate-fade-in-up" hover>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="project">Project</Label>
              <Select id="project" required defaultValue="">
                <option value="" disabled>Select project</option>
                {demoProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select id="category" required defaultValue="">
                <option value="" disabled>Select category</option>
                {demoCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} placeholder="What was this expense for?" required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="amount">Amount (₱)</Label>
              <Input id="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="vendor">Vendor / Supplier</Label>
              <Input id="vendor" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="payment">Payment Method</Label>
              <Select id="payment" required defaultValue="">
                <option value="" disabled>Select method</option>
                {paymentMethods.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>Receipt / Attachment</Label>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-border py-8 text-center transition-colors hover:border-eng-blue hover:bg-eng-blue-light/40">
              <Upload className="mb-2 h-6 w-6 text-gray-400" />
              <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">PNG, JPG, or PDF (max 10MB)</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary">Cancel</Button>
            <Button type="submit" loading={submitting}>
              {submitting ? "Submitting..." : "Submit Expense"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
