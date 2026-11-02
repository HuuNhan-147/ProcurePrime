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
        setError("Không thể tải danh sách người dùng");
        Swal.fire("Lỗi", "Không thể tải danh sách người dùng", "error");
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
        setError("Không thể tìm kiếm người dùng");
        Swal.fire("Lỗi", "Không thể tìm kiếm người dùng", "error");
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
        Swal.fire("Thành công", "Cập nhật người dùng thành công", "success");
        setIsEditing(false);
      } catch (err: any) {
        setError("Cập nhật người dùng thất bại");
        Swal.fire("Lỗi", "Cập nhật người dùng thất bại", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, xóa nó!",
      cancelButtonText: "Hủy bỏ",
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
          Swal.fire("Đã xóa!", "Người dùng đã được xóa.", "success");
        } catch (err: any) {
          setError("Xóa người dùng thất bại");
          Swal.fire("Lỗi", "Xóa người dùng thất bại", "error");
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
        setError("Không thể lấy thông tin người dùng");
        Swal.fire("Lỗi", "Không thể lấy thông tin người dùng", "error");
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Khách Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sách tài khoản khách hàng và phân quyền quản trị viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs">
            Tổng cộng: {users.length} người dùng
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4">
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
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            placeholder="Tìm kiếm người dùng theo tên, email hoặc số điện thoại..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading && !isEditing ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600">
              Đang tải danh sách tài khoản...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs font-semibold">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex p-3.5 bg-slate-100 rounded-2xl text-slate-400 mb-2">
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
            <h4 className="font-bold text-slate-800 text-sm">
              Không tìm thấy người dùng nào
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {searchQuery
                ? "Thử với từ khóa tìm kiếm khác"
                : "Hệ thống chưa có người dùng nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Tài Khoản</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Số Điện Thoại</th>
                  <th className="py-3.5 px-4">Vai Trò</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
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
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
                            {user.name || "Chưa cập nhật"}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            ID: {user._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {user.phone ? (
                        <span className="font-mono">{user.phone}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có SĐT</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          user.isAdmin
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isAdmin ? "bg-purple-500" : "bg-blue-500"
                          }`}
                        />
                        {user.isAdmin ? "Quản trị viên (Admin)" : "Khách hàng"}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleSelectUser(user._id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                          title="Chỉnh sửa thông tin"
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
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          title="Xóa người dùng"
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
            </table>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Cập Nhật Thông Tin</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: {selectedUser._id}
                </p>
              </div>
              <button
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
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                  value={selectedUser.name || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
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
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
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
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Phân quyền hệ thống <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-semibold"
                  value={selectedUser.isAdmin ? "admin" : "user"}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      isAdmin: e.target.value === "admin",
                    })
                  }
                >
                  <option value="user">Khách hàng thông thường</option>
                  <option value="admin">Quản trị viên (Super Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm shadow-indigo-600/30"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
