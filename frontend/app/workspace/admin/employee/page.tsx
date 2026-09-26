"use client";

import { useEffect, useState } from "react";
import { createEmployee, getEmployees } from "@/lib/api";

type Employee = {
  id: number;
  organization_user_id: number;
  name: string;
  email: string;
  role: string;
  organization_id: number;
};

export default function EmployeesPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadEmployees() {
    try {
      setLoadingEmployees(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load employees"
      );
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleCreateEmployee() {
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const employee = await createEmployee({
        name,
        email,
        password,
      });

      setSuccess(
        `Employee created successfully! User ID: ${employee.organization_user_id}`
      );

      setName("");
      setEmail("");
      setPassword("");

      await loadEmployees();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create employee"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-2xl font-bold text-white">
        Employee Management
      </h1>

      <p className="mt-2 text-slate-400">
        Create and manage employees in your organization.
      </p>

      {/* Create Employee */}
      <div className="mt-8 max-w-xl rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Create Employee
        </h2>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          <input
            type="email"
            placeholder="Employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-400">
              {success}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreateEmployee}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          Employees
        </h2>

        {loadingEmployees ? (
          <p className="mt-4 text-slate-400">
            Loading employees...
          </p>
        ) : employees.length === 0 ? (
          <p className="mt-4 text-slate-400">
            No employees found.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-t border-slate-800 bg-slate-950"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {employee.organization_user_id}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {employee.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-300">
                      {employee.email}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-medium text-blue-400">
                        {employee.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}