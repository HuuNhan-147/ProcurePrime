import { tx, uiMessage, uiText, useLocale, localizedSwal } from "../i18n";
import { AccessibleDialog } from "../components/ui/PresentationAccess";
import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
  getUserById,
  searchUsers,
} from "../api/UserApi";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import AdminPagination from "./AdminPagination";

const AdminUserManagement = () => {
  useLocale();
  const { getToken } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchUsers = async () => {
    const token = getToken();
    if (token) {
      try {
        setLoading(true);
        const data = await getAllUsers(token);
        setUsers(data);
      } catch (err: any) {
        setError(uiMessage("adminUsers:unableToLoadUsers"));
        localizedSwal(Swal, uiMessage("adminUsers:error"), uiMessage("adminUsers:unableToLoadUsers"), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [getToken]);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const token = getToken();

    if (token) {
      try {
        setLoading(true);
        if (query.trim() === "") {
          await fetchUsers();
        } else {
          const results = await searchUsers(query, token);
          setUsers(results);
        }
      } catch (err: any) {
        setError(uiMessage("adminUsers:unableToSearchUsers"));
        localizedSwal(Swal, uiMessage("adminUsers:error"), uiMessage("adminUsers:unableToSearchUsers"), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateUser = async (userId: string, updatedData: any) => {
    const token = getToken();
    if (token) {
      try {
        setLoading(true);
        const updatedUser = await updateUserByAdmin(userId, updatedData, token);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === updatedUser._id ? updatedUser : user
          )
        );
        localizedSwal(Swal, uiMessage("adminUsers:success"), uiMessage("adminUsers:userUpdatedSuccessfully"), "success");
        setIsEditing(false);
      } catch (err: any) {
        setError(uiMessage("adminUsers:unableToUpdateUser"));
        localizedSwal(Swal, uiMessage("adminUsers:error"), uiMessage("adminUsers:unableToUpdateUser"), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await localizedSwal(Swal, {
      title: uiMessage("adminUsers:areYouSure"),
      text: uiMessage("adminUsers:youCannotUndoThisAction"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: uiMessage("adminUsers:yesDelete"),
      cancelButtonText: uiMessage("adminUsers:cancel"),
    });

    if (result.isConfirmed) {
      const token = getToken();
      if (token) {
        try {
          setLoading(true);
          await deleteUser(userId, token);
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user._id !== userId)
          );
          localizedSwal(Swal, uiMessage("adminUsers:deleted"), uiMessage("adminUsers:theUserHasBeenDeleted"), "success");
        } catch (err: any) {
          setError(uiMessage("adminUsers:unableToDeleteUser"));
          localizedSwal(Swal, uiMessage("adminUsers:error"), uiMessage("adminUsers:unableToDeleteUser"), "error");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleSelectUser = async (userId: string) => {
    const token = getToken();
    if (token) {
      try {
        setLoading(true);
        const user = await getUserById(userId, token);
        setSelectedUser(user);
        setIsEditing(true);
      } catch (err: any) {
        setError(uiMessage("adminUsers:unableToLoadUserDetails"));
        localizedSwal(Swal, uiMessage("adminUsers:error"), uiMessage("adminUsers:unableToLoadUserDetails"), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">{tx("adminUsers:customerManagement")}</h1>
          <p className="text-slate-500 text-sm mt-1">{tx("adminUsers:customerAccountsAndAdministratorAccess")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg">{tx("common:counts.users", {count: users.length})}</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input aria-label={tx("adminUsers:searchByNameEmailOrPhoneNumber")}
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            placeholder={tx("adminUsers:searchByNameEmailOrPhoneNumber")}
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
        {loading && !isEditing ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600">{tx("adminUsers:loadingAccounts")}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs font-semibold">
            {uiText(error)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex p-3.5 bg-slate-100 rounded-lg text-slate-400 mb-2">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{tx("adminUsers:noUsersFound")}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {uiText(searchQuery
                ? tx("adminUsers:tryADifferentSearchTerm")
                : tx("adminUsers:noUsersYet"))}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <div className="pp-table-region" role="region" aria-label={tx("adminUsers:dataTable")} tabIndex={0}><table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-6">{tx("adminUsers:account")}</th>
                  <th scope="col" className="py-3.5 px-4">{tx("adminUsers:email")}</th>
                  <th scope="col" className="py-3.5 px-4">{tx("adminUsers:phoneNumber")}</th>
                  <th scope="col" className="py-3.5 px-4">{tx("adminUsers:role")}</th>
                  <th scope="col" className="py-3.5 px-6 text-right">{tx("adminUsers:actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Cột Tên & Avatar */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#254AD7] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {uiText(user.name?.charAt(0)?.toUpperCase() || "U")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-[#254AD7] transition-colors">
                            {uiText(user.name || tx("adminUsers:notProvided"))}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{tx("adminUsers:id")}{" "}{uiText(user._id?.slice(-8))}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {uiText(user.email)}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.phone ? (
                        <span className="font-mono">{uiText(user.phone)}</span>
                      ) : (
                        <span className="text-slate-400 italic">{tx("adminUsers:noPhoneNumber")}</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={` inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          user.isAdmin
                            ? "bg-[#edf1ff] text-[#254AD7] border border-purple-200"
                            : "bg-[#edf1ff] text-[#254AD7] border border-blue-200"
                        }  `}
                      >
                        <span
                          className={` w-1.5 h-1.5 rounded-full ${
                            user.isAdmin ? "bg-purple-500" : "bg-blue-500"
                          }  `}
                        />
                        {uiText(user.isAdmin ? tx("adminUsers:administratorAdmin") : tx("adminUsers:customer"))}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button aria-label={tx("adminUsers:editDetails")} type="button"
                          onClick={() => handleSelectUser(user._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-[#254AD7] hover:bg-[#edf1ff] border border-transparent hover:border-indigo-100 transition-all"
                          title={tx("adminUsers:editDetails")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button aria-label={tx("adminUsers:deleteUser")} type="button"
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          title={tx("adminUsers:deleteUser")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>

            {/* Pagination Footer */}
            <AdminPagination
              currentPage={currentPage}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[10, 20, 50]}
            />
          </>
        )}
      </div>

      {/* Edit Modal (Glassmorphism backdrop) */}
      {isEditing && selectedUser && (
        <AccessibleDialog onClose={() => setIsEditing(false)} aria-label={tx("adminUsers:editUser")} className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">{tx("adminUsers:updateDetails")}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{tx("adminUsers:id")}{" "}{uiText(selectedUser._id)}
                </p>
              </div>
              <button type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedData = {
                  name: selectedUser.name,
                  email: selectedUser.email,
                  phone: selectedUser.phone,
                  isAdmin: selectedUser.isAdmin,
                };
                handleUpdateUser(selectedUser._id, updatedData);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">{tx("adminUsers:fullName")}{" "}<span className="text-rose-500">*</span>
                </label>
                <input aria-label={tx("adminUsers:fullName")}
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                  value={selectedUser.name || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">{tx("adminUsers:emailAddress")}{" "}<span className="text-rose-500">*</span>
                </label>
                <input aria-label={tx("adminUsers:emailAddress")}
                  type="email"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                  value={selectedUser.email || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">{tx("adminUsers:phoneNumber2")}</label>
                <input aria-label={tx("adminUsers:phoneNumber2")}
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                  value={selectedUser.phone || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">{tx("adminUsers:systemRole")}{" "}<span className="text-rose-500">*</span>
                </label>
                <select aria-label={tx("adminUsers:systemRole")}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-semibold"
                  value={selectedUser.isAdmin ? "admin" : "user"}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      isAdmin: e.target.value === "admin",
                    })
                  }
                >
                  <option value="user">{tx("adminUsers:standardCustomer")}</option>
                  <option value="admin">{tx("adminUsers:administratorSuperAdmin")}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
                >{tx("adminUsers:cancel")}</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#254AD7] hover:bg-[#254AD7] text-white rounded-lg font-bold transition"
                  disabled={loading}
                >
                  {uiText(loading ? tx("adminUsers:saving") : tx("adminUsers:saveChanges"))}
                </button>
              </div>
            </form>
          </div>
        </AccessibleDialog>
      )}
    </div>
  );
};

export default AdminUserManagement;
