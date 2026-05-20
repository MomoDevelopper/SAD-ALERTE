"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiBase, getStoredToken } from "../../../lib/client-auth";

type AdminUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "agent" | "admin";
  actif: boolean;
  date_creation: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setError("Session absente. Connectez-vous.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${getApiBase()}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json().catch(() => ({}))) as { users?: AdminUser[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de charger les utilisateurs.");
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const pendingUsers = useMemo(() => users.filter((user) => !user.actif), [users]);
  const activeUsers = useMemo(() => users.filter((user) => user.actif), [users]);

  async function updateUserStatus(userId: number, actif: boolean) {
    const token = getStoredToken();
    if (!token) {
      setError("Session absente. Connectez-vous.");
      return;
    }
    setActionUserId(userId);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${getApiBase()}/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ actif }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Action refusée.");
      }
      await loadUsers();
      if (actif) {
        setSuccessMessage("Compte activé. Notifiez l'agent de se connecter via l'application mobile.");
      } else {
        setSuccessMessage("Compte désactivé.");
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setActionUserId(null);
    }
  }

  async function updateUserRole(userId: number, role: "agent" | "admin") {
    const token = getStoredToken();
    if (!token) {
      setError("Session absente. Connectez-vous.");
      return;
    }
    setActionUserId(userId);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${getApiBase()}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Action refusée.");
      }
      await loadUsers();
      setSuccessMessage(role === "admin" ? "Utilisateur promu administrateur." : "Utilisateur repassé agent de terrain.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
    } finally {
      setActionUserId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs et rôles</h1>
        <p className="text-sm text-gray-500">Activez les demandes d’accès et gérez les comptes.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {successMessage && (
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{successMessage}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="En attente d'activation" value={loading ? "..." : pendingUsers.length} />
        <StatCard label="Utilisateurs actifs" value={loading ? "..." : activeUsers.length} />
        <StatCard label="Total utilisateurs" value={loading ? "..." : users.length} />
      </div>

      <UsersTable
        title="Demandes en attente"
        loading={loading}
        users={pendingUsers}
        actionUserId={actionUserId}
        emptyText="Aucune demande en attente."
        actionLabel="Activer"
        actionKind="activate"
        onAction={(id) => updateUserStatus(id, true)}
      />

      <UsersTable
        title="Comptes actifs"
        loading={loading}
        users={activeUsers}
        actionUserId={actionUserId}
        emptyText="Aucun compte actif."
        actionLabel="Désactiver"
        actionKind="deactivate"
        onAction={(id) => updateUserStatus(id, false)}
        onRoleAction={(user) => updateUserRole(user.id, user.role === "admin" ? "agent" : "admin")}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function UsersTable(props: {
  title: string;
  loading: boolean;
  users: AdminUser[];
  actionUserId: number | null;
  emptyText: string;
  actionLabel: string;
  actionKind: "activate" | "deactivate";
  onAction: (id: number) => void;
  onRoleAction?: (user: AdminUser) => void;
}) {
  const { title, loading, users, actionUserId, emptyText, actionLabel, actionKind, onAction, onRoleAction } = props;
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4 font-semibold text-gray-800">{title}</div>
      <div className="p-4">
        {loading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 pr-3">Nom</th>
                  <th className="pb-2 pr-3">Email</th>
                  <th className="pb-2 pr-3">Rôle</th>
                  <th className="pb-2 pr-3">Créé le</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="py-2 pr-3 text-gray-900">{user.prenom} {user.nom}</td>
                    <td className="py-2 pr-3 text-gray-700">{user.email}</td>
                    <td className="py-2 pr-3 text-gray-700">{user.role === "admin" ? "Administrateur" : "Agent de terrain"}</td>
                    <td className="py-2 pr-3 text-gray-600">{new Date(user.date_creation).toLocaleString()}</td>
                    <td className="py-2 space-x-2">
                      <button
                        type="button"
                        onClick={() => onAction(user.id)}
                        disabled={actionUserId === user.id}
                        aria-label={`${actionLabel} ${user.prenom} ${user.nom}`}
                        title={`${actionLabel} ${user.prenom} ${user.nom}`}
                        className={
                          actionKind === "activate"
                            ? "rounded bg-green-600 px-3 py-1.5 text-white disabled:opacity-60"
                            : "rounded bg-gray-700 px-3 py-1.5 text-white disabled:opacity-60"
                        }
                      >
                        {actionUserId === user.id ? "..." : actionLabel}
                      </button>
                      {onRoleAction && (
                        <button
                          type="button"
                          onClick={() => onRoleAction(user)}
                          disabled={actionUserId === user.id}
                          aria-label={`${user.role === "admin" ? "Rendre agent" : "Promouvoir admin"} ${user.prenom} ${user.nom}`}
                          title={`${user.role === "admin" ? "Rendre agent" : "Promouvoir admin"} ${user.prenom} ${user.nom}`}
                          className="rounded bg-blue-700 px-3 py-1.5 text-white disabled:opacity-60"
                        >
                          {actionUserId === user.id ? "..." : user.role === "admin" ? "Rendre agent" : "Promouvoir admin"}
                        </button>
                      )}
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
