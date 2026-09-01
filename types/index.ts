export type UserRole = "admin" | "staff";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type ProjectStatus = "active" | "completed" | "on_hold" | "archived";

export type ServiceType =
  | "FDAS"
  | "Fire Sprinkler System"
  | "Preventive Maintenance"
  | "Testing & Commissioning"
  | "Repair & Troubleshooting"
  | "Installation"
  | "System Upgrade"
  | "Engineering / Design"
  | "Supply"
  | "Other";

export type Project = {
  id: string;
  project_code: string;
  name: string;
  client_name: string;
  site_location: string;
  service_type: ServiceType;
  description: string | null;
  contract_value: number;
  budget: number;
  status: ProjectStatus;
  start_date: string;
  end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Derived / joined fields used in Phase 1 UI (demo data)
  expenses?: number;
  progress?: number;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export type ExpenseStatus = "pending" | "approved" | "rejected";
export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";

export type Expense = {
  id: string;
  project_id: string;
  category_id: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor_name: string | null;
  payment_method: PaymentMethod;
  status: ExpenseStatus;
  submitted_by: string;
  receipt_path: string | null;
  created_at: string;
  updated_at: string;
  // Joined display fields (demo data)
  project_name?: string;
  category_name?: string;
  submitted_by_name?: string;
};

export type DocumentCategory =
  | "Contracts"
  | "Quotations"
  | "Purchase Orders"
  | "Service Reports"
  | "Receipts"
  | "Project Documents"
  | "Other";

export type AppDocument = {
  id: string;
  project_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  // Joined display fields (demo data)
  project_name?: string;
  category?: DocumentCategory;
  uploaded_by_name?: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
};

export type BudgetStatus = "healthy" | "warning" | "near_limit" | "over_budget";
