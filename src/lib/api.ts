import { createClient } from '@/lib/supabase';

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL ?? 'http://localhost:3009';
const HOSPITAL_BASE = process.env.NEXT_PUBLIC_HOSPITAL_SERVICE_URL ?? 'http://localhost:3001';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? '';
  const tenantId = data.session?.user?.user_metadata?.tenant_id ?? '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
  };
}

async function adminReq<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${ADMIN_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }
  return json.data as T;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${HOSPITAL_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message ?? `Request failed: ${res.status}`);
  }
  return json.data as T;
}

// ─── Admin (super_admin) ────────────────────────────────────────────────────

// 0 = inactive, 1 = active
export type HospitalStatus = 0 | 1;

export type HospitalDto = {
  id: string;
  name: string;
  slug: string;
  type?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  status: HospitalStatus;
  createdAt: string;
};

export type HospitalsPageDto = {
  data: HospitalDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
};

export function getAdminHospitals(params?: { page?: number; limit?: number; status?: HospitalStatus }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status !== undefined) qs.set('status', String(params.status));
  const q = qs.toString();
  return adminReq<HospitalsPageDto>('GET', `/admin/hospitals${q ? `?${q}` : ''}`);
}

export function createHospital(dto: {
  hospital: { name: string; type?: string; phone?: string; email?: string; address?: string; city?: string; country?: string; website?: string };
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
}) {
  return adminReq<{ hospitalId: string; slug: string }>('POST', '/admin/hospitals', dto);
}

export function updateHospital(id: string, dto: Partial<{ name: string; type: string; phone: string; email: string; address: string; city: string; country: string; website: string }>) {
  return adminReq<HospitalDto>('PATCH', `/admin/hospitals/${id}`, dto);
}

export function setHospitalStatus(id: string, status: HospitalStatus) {
  return adminReq<HospitalDto>('PATCH', `/admin/hospitals/${id}/status`, { status });
}

// ─── Hospital Admin — Branches ──────────────────────────────────────────────

export type BranchDto = {
  id: string;
  hospitalId: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt: string;
};

export function getBranches() {
  return req<BranchDto[]>('GET', '/hospital-admin/branches');
}

export function createBranch(dto: { name: string; address?: string; city?: string; phone?: string; email?: string; isMainBranch?: boolean }) {
  return req<BranchDto>('POST', '/hospital-admin/branches', dto);
}

export function updateBranch(id: string, dto: Partial<{ name: string; address: string; city: string; phone: string; email: string; isMainBranch: boolean; isActive: boolean }>) {
  return req<BranchDto>('PATCH', `/hospital-admin/branches/${id}`, dto);
}

export function deleteBranch(id: string) {
  return req<null>('DELETE', `/hospital-admin/branches/${id}`);
}

// ─── Hospital Admin — Roles ─────────────────────────────────────────────────

export type HospitalRoleDto = {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  permissions: Record<string, Record<string, boolean>>;
  isActive: boolean;
  createdAt: string;
};

export function getRoles() {
  return req<HospitalRoleDto[]>('GET', '/hospital-admin/roles');
}

export function createRole(dto: { name: string; description?: string; permissions: Record<string, Record<string, boolean>> }) {
  return req<HospitalRoleDto>('POST', '/hospital-admin/roles', dto);
}

export function updateRole(id: string, dto: Partial<{ name: string; description: string; permissions: Record<string, Record<string, boolean>>; isActive: boolean }>) {
  return req<HospitalRoleDto>('PATCH', `/hospital-admin/roles/${id}`, dto);
}

export function deleteRole(id: string) {
  return req<null>('DELETE', `/hospital-admin/roles/${id}`);
}

// ─── Hospital Admin — Staff ─────────────────────────────────────────────────

export type UserDto = {
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  canLogin: boolean;
  createdAt: string;
};

export function getStaff(branchId: string) {
  return req<UserDto[]>('GET', `/hospital-admin/branches/${branchId}/staff`);
}

export function createStaff(branchId: string, dto: { email?: string; password?: string; firstName: string; lastName: string; hospitalRoleId: string; canLogin?: boolean }) {
  return req<UserDto>('POST', `/hospital-admin/branches/${branchId}/staff`, dto);
}

// ─── Hospital Admin — Patients ──────────────────────────────────────────────

export function getPatients(branchId: string) {
  return req<UserDto[]>('GET', `/hospital-admin/branches/${branchId}/patients`);
}

export function createPatient(branchId: string, dto: { email?: string; password?: string; firstName: string; lastName: string; hospitalRoleId?: string; canLogin?: boolean }) {
  return req<UserDto>('POST', `/hospital-admin/branches/${branchId}/patients`, dto);
}

// ─── Hospital Admin — Login Access ─────────────────────────────────────────

export function toggleLoginAccess(userId: string, dto: { canLogin: boolean; password?: string; email?: string }) {
  return req<UserDto>('PATCH', `/hospital-admin/users/${userId}/login-access`, dto);
}
