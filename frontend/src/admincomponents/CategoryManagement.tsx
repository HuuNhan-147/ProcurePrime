import { tx, uiMessage, uiText, useLocale, localizedSwal } from "../i18n";
import { AccessibleDialog } from "../components/ui/PresentationAccess";
import React, { useState, useEffect } from "react";
import {
  fetchCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../api/CategoryApi";
import Swal from "sweetalert2";
import { ICategory } from "../types/category";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  List,
  LayoutGrid
} from 'lucide-react';
import AdminPagination from "./AdminPagination";

const CategoryManagement = () => {
  useLocale();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ICategory[]>([]);
  
  // Form State
  const [categoryData, setCategoryData] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });
  
  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(8);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = categories.filter(
      cat => 
        cat.name.toLowerCase().includes(lowerTerm) || 
        cat.description.toLowerCase().includes(lowerTerm)
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategory();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      localizedSwal(Swal, uiMessage("adminCategories:error"), uiMessage("adminCategories:unableToLoadCategories"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (category?: ICategory) => {
    if (category) {
      setIsEditing(true);
      setEditingId(category._id);
      setCategoryData({ name: category.name, description: category.description });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setCategoryData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset state after animation might be better, but immediate is fine for now
    setTimeout(() => {
        setIsEditing(false);
        setEditingId(null);
        setCategoryData({ name: "", description: "" });
    }, 200);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryData.name.trim()) {
        localizedSwal(Swal, uiMessage("adminCategories:warning"), uiMessage("adminCategories:categoryNameIsRequired"), "warning");
        return;
    }

    const data = {
      name: categoryData.name,
      description: categoryData.description,
    };

    try {
      setIsLoading(true);
      if (isEditing && editingId) {
        await updateCategory(editingId, data);
        localizedSwal(Swal, {
            icon: 'success',
            title: uiMessage("adminCategories:success"),
            text: uiMessage("adminCategories:categoryUpdatedSuccessfully"),
            timer: 1500,
            showConfirmButton: false
        });
      } else {
        await createCategory(data);
        localizedSwal(Swal, {
            icon: 'success',
            title: uiMessage("adminCategories:success"),
            text: uiMessage("adminCategories:categoryAddedSuccessfully"),
            timer: 1500,
            showConfirmButton: false
        });
      }
      closeModal();
      loadCategories();
    } catch (error) {
      localizedSwal(Swal, uiMessage("adminCategories:error"), isEditing ? uiMessage("adminCategories:unableToUpdate") : uiMessage("adminCategories:unableToAdd"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await localizedSwal(Swal, {
      title: uiMessage("adminCategories:areYouSure"),
      text: uiMessage("adminCategories:thisActionCannotBeUndone"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: uiMessage("adminCategories:delete"),
      cancelButtonText: uiMessage("adminCategories:cancel"),
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(id);
        localizedSwal(Swal, uiMessage("adminCategories:deleted"), uiMessage("adminCategories:theCategoryHasBeenDeleted"), "success");
        loadCategories();
      } catch (error) {
        localizedSwal(Swal, uiMessage("adminCategories:error"), uiMessage("adminCategories:unableToDeleteCategory"), "error");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutGrid className="w-7 h-7 text-[#254AD7]" />{tx("adminCategories:categoryManagement")}</h1>
          <p className="text-slate-500 text-sm mt-1">{tx("adminCategories:organiseProductCategoriesAndHierarchy")}</p>
        </div>
        <button type="button"
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-[#254AD7] hover: hover: text-white font-bold py-2.5 px-5 rounded-lg transition-all text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{tx("adminCategories:addCategory")}</span>
        </button>
      </div>

      {/* Main Content card */}
      <div className="bg-white rounded-lg overflow-hidden border border-slate-200/80">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input aria-label={tx("adminCategories:searchCategoriesByNameOrDescription")}
              type="text"
              className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs transition duration-150"
              placeholder={tx("adminCategories:searchCategoriesByNameOrDescription")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500">{tx("adminCategories:showing")}{" "}
            <span className="font-bold text-slate-800">
              {uiText(filteredCategories.length)}
            </span>{" "}{tx("adminCategories:activeCategories")}</div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="pp-table-region" role="region" aria-label={tx("adminCategories:dataTable")} tabIndex={0}><table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider">
                <th scope="col" className="px-6 py-3.5">{tx("adminCategories:categoryName")}</th>
                <th scope="col" className="px-6 py-3.5">{tx("adminCategories:description")}</th>
                <th scope="col" className="px-6 py-3.5 text-right">{tx("adminCategories:actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="w-6 h-6 text-[#254AD7] animate-spin" />
                      <span className="text-slate-500 font-medium">{tx("adminCategories:loadingCategories")}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <List className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">{tx("adminCategories:noCategoriesFound")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-[#254AD7] transition-colors">
                        {uiText(category.name)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="text-xs text-slate-500 line-clamp-1 max-w-md"
                        title={uiText(category.description)}
                      >
                        {category.description || (
                          <span className="text-slate-300 italic">{tx("adminCategories:noDescription")}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button aria-label={tx("adminCategories:editCategory")} type="button"
                          onClick={() => openModal(category)}
                          className="p-2 rounded-lg text-slate-500 hover:text-[#254AD7] hover:bg-[#edf1ff] border border-transparent hover:border-indigo-100 transition-all"
                          title={tx("adminCategories:editCategory")}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button aria-label={tx("adminCategories:deleteCategory")} type="button"
                          onClick={() => handleDelete(category._id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                          title={tx("adminCategories:deleteCategory")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
        </div>

        {/* Pagination Footer */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredCategories.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemsPerPageOptions={[8, 16, 32]}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AccessibleDialog onClose={closeModal} aria-label={tx("adminCategories:category")}
          className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen p-4 text-center">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 transition-opacity"
              aria-hidden="true"
              onClick={closeModal}
            ></div>

            {/* Modal Panel */}
            <div className="inline-block bg-white rounded-lg text-left overflow-hidden transform transition-all sm:max-w-md sm:w-full z-10 border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <h3
                  className="text-base font-bold text-white"
                  id="modal-title"
                >
                  {uiText(isEditing ? tx("adminCategories:updateCategory") : tx("adminCategories:addCategory"))}
                </h3>
                <button aria-label={tx("adminCategories:close")} type="button"
                  onClick={closeModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >{tx("adminCategories:categoryName2")}{" "}<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={categoryData.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs transition-all"
                      placeholder={tx("adminCategories:eGPhonesTablets")}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >{tx("adminCategories:description2")}{" "}<span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      value={categoryData.description}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs transition-all resize-none"
                      placeholder={tx("adminCategories:describeTheProductGroupAndClassificationCriteria")}
                      required
                    />
                  </div>
                </form>
              </div>

              <div className="bg-slate-50 px-6 py-3.5 sm:flex sm:flex-row-reverse border-t border-slate-100 gap-2.5">
                <button
                  type="submit"
                  form="categoryForm"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-lg px-5 py-2 bg-[#254AD7] hover:bg-[#254AD7] text-xs font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed items-center sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{tx("adminCategories:processing")}</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      {uiText(isEditing ? tx("adminCategories:saveChanges") : tx("adminCategories:createCategory"))}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-2 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-slate-200 px-4 py-2 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all sm:w-auto"
                >{tx("adminCategories:cancel2")}</button>
              </div>
            </div>
          </div>
        </AccessibleDialog>
      )}
    </div>
  );
};

export default CategoryManagement;
