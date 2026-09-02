import { z } from "zod";

export const projectSchema = z.object({
  project_code: z.string().trim().min(3, "Project code is required").max(30),
  name: z.string().trim().min(3, "Project name is required").max(150),
  client_name: z.string().trim().min(2, "Client name is required").max(150),
  site_location: z.string().trim().min(2, "Site location is required").max(200),
  service_type: z.string().trim().min(1, "Service type is required"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  contract_value: z.coerce.number().min(0, "Contract value cannot be negative"),
  budget: z.coerce.number().min(0, "Budget cannot be negative"),
  status: z.enum(["planning", "active", "on_hold", "completed", "archived"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().or(z.literal("")),
});

export const expenseSchema = z.object({
  project_id: z.string().uuid("Select a project"),
  category_id: z.string().uuid("Select a category"),
  description: z.string().trim().min(3, "Description is required").max(500),
  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than zero")
    .finite("Enter a valid amount"),
  expense_date: z.string().min(1, "Date is required"),
  vendor_name: z.string().trim().max(150).optional().or(z.literal("")),
  payment_method: z.enum(["cash", "bank_transfer", "card", "other"]),
});

export const rejectExpenseSchema = z.object({
  expense_id: z.string().uuid(),
  rejection_reason: z.string().trim().min(5, "Please explain why this expense is being rejected").max(500),
});

export const staffSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(150),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.enum(["admin", "staff"]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});

export const serviceTypeSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
});

export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
