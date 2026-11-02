import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IProduct } from "../types/product";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api/OrderApi";
import { CheckCircle2 } from "lucide-react";

interface IShippingAddress {
  fullname: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface IOrderData {
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  organization: string;
  taxCode: string;
  quotationNumber: string;
}

const CreateOrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [orderData, setOrderData] = useState<IOrderData>({
    shippingAddress: {
      fullname: "",
      phone: "",
      address: "",
      city: "",
      country: "Việt Nam",
    },
    paymentMethod: "BankTransfer",
    organization: "",
    taxCode: "",
    quotationNumber: "",
  });

  const [products, setProducts] = useState<IProduct[]>([]);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>("");

  useEffect(() => {
    if (location.state?.products) {
      const updatedProducts = (location.state.products as IProduct[]).map(
        (p: IProduct) => ({
          ...p,
          quantity: p.quantity || 1,
        })
      );
      setProducts(updatedProducts);
    } else if (location.state?.product) {
      const singleProduct: IProduct = {
        ...(location.state.product as IProduct),
        quantity: (location.state.product as IProduct).quantity || 1,
      };
      setProducts([singleProduct]);
      setProduct(singleProduct);
    } else {
      navigate("/products");
    }
  }, [location, navigate]);

  // Chi phí & Ngân sách B2B
  const SHIPPING_FEE = 0; // Miễn phí giao hàng dự án B2B & On-site
  const TAX_RATE = 0.1;

  const subtotal = products.reduce(
    (sum, prod) => sum + prod.price * prod.quantity,
    0
  );

  const totalQuantity = products.reduce((sum, prod) => sum + prod.quantity, 0);
  const discountRate = (totalQuantity >= 10 || subtotal >= 50000000) ? 0.05 : 0;
  const discount = Math.round(subtotal * discountRate);
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * TAX_RATE);
  const total = taxableAmount + SHIPPING_FEE + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (["fullname", "phone", "address", "city"].includes(name)) {
      setOrderData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [name]: value,
        },
      }));
    } else {
      setOrderData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrderSuccess(false);

    const token = getToken();
    if (!token) {
      setError("Vui lòng đăng nhập để tiếp tục");
      setLoading(false);
      return;
    }

    if (products.length === 0 && !product) {
      setError("Không có sản phẩm nào trong yêu cầu mua sắm!");
      setLoading(false);
      return;
    }

    try {
      const orderPayload = {
        orderItems: products.map((prod) => ({
          name: prod.name,
          quantity: prod.quantity,
          image: prod.image,
          price: prod.price,
          product: prod._id,
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        organization: orderData.organization,
        taxCode: orderData.taxCode,
        quotationNumber: orderData.quotationNumber,
      };

      const result = await createOrder(token, orderPayload);
      setCreatedOrderCode(result?.orderCode || result?.data?.orderCode || "");
      setOrderSuccess(true);
    } catch (err: any) {
      console.error("Lỗi khi lập đơn mua sắm B2B:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="flex justify-center mb-5">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Lập Đơn Mua Sắm B2B Thành Công!
          </h1>
          {createdOrderCode && (
            <p className="text-xs font-mono bg-slate-100 text-slate-700 py-1.5 px-3 rounded-md mb-3 inline-block">
              Mã đơn: {createdOrderCode}
            </p>
          )}
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Hồ sơ mua sắm đã được chuyển đến bộ phận dự án. Hóa đơn GTGT điện tử và hợp đồng kinh tế sẽ được gửi theo thông tin doanh nghiệp đăng ký.
          </p>
          <div className="flex flex-col space-y-2.5">
            <button
              onClick={() => navigate("/orders")}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
            >
              Xem Danh Sách Đơn Hàng Mua Sắm
            </button>
            <button
              onClick={() => navigate("/workspace")}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold text-sm"
            >
              Quay Lại Procurement Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Hồ Sơ Mua Sắm Doanh Nghiệp (PO)
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Xác Nhận & Lập Đơn Hàng Doanh Nghiệp
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Vui lòng điền thông tin pháp nhân doanh nghiệp để xuất hóa đơn VAT và hợp đồng bàn giao
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 mb-6 rounded-xl text-sm">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
            {/* 1. THÔNG TIN PHÁP NHÂN DOANH NGHIỆP */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
                1. Thông Tin Doanh Nghiệp (Xuất Hóa Đơn GTGT)
              </h3>

              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="organization" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên Doanh Nghiệp / Cơ Quan Thu Mua *
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    placeholder="VD: CÔNG TY CỔ PHẦN CÔNG NGHỆ VĂN PHÒNG VIỆT"
                    value={orderData.organization}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="taxCode" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã Số Thuế (MST) *
                  </label>
                  <input
                    type="text"
                    id="taxCode"
                    name="taxCode"
                    placeholder="VD: 0101234567"
                    value={orderData.taxCode}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quotationNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Hiệu Báo Giá Tham Chiếu (Nếu có)
                  </label>
                  <input
                    type="text"
                    id="quotationNumber"
                    name="quotationNumber"
                    placeholder="VD: PP-20261102-0001"
                    value={orderData.quotationNumber}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. ĐẠI DIỆN & ĐỊA ĐIỂM GIAO HÀNG */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
                2. Người Đại Diện Thu Mua & Địa Điểm Bàn Giao
              </h3>

              <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                    Người Phụ Trách Nhận Thiết Bị *
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={orderData.shippingAddress.fullname}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Số Điện Thoại Liên Hệ *
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={orderData.shippingAddress.phone}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa Chỉ Trụ Sở / Văn Phòng Bàn Giao On-site *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Tòa nhà, số phòng, đường phố..."
                    value={orderData.shippingAddress.address}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tỉnh / Thành Phố *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={orderData.shippingAddress.city}
                    onChange={handleInputChange}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-xs font-semibold text-slate-700 mb-1">
                    Quốc Gia
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={orderData.shippingAddress.country}
                    className="block w-full border border-slate-200 rounded-lg py-2 px-3 text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* 3. PHƯƠNG THỨC THANH TOÁN */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
                3. Phương Thức Thanh Toán Hợp Đồng
              </h3>
              <div className="mt-1">
                <select
                  value={orderData.paymentMethod}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="block w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="BankTransfer">Chuyển khoản Doanh nghiệp (Có hợp đồng & xuất hóa đơn VAT)</option>
                  <option value="VNPay">Cổng thanh toán điện tử VNPay (Thẻ Doanh nghiệp / QR Code)</option>
                  <option value="COD">Thanh toán khi bàn giao và nghiệm thu On-site</option>
                </select>
              </div>
            </div>

            {/* 4. TỔNG KẾT HẠN MỨC & THIẾT BỊ */}
            <div className="px-6 py-6 bg-slate-50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">
                4. Danh Sách Thiết Bị Mua Sắm ({products.length} dòng)
              </h3>

              <div className="space-y-3">
                {products.map((prod) => (
                  <div key={prod._id} className="flex items-center justify-between py-2 border-b border-slate-200/60 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <p className="text-slate-500 mt-0.5">
                          {prod.price.toLocaleString("vi-VN")} ₫ × {prod.quantity} bộ
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-900">
                      {(prod.price * prod.quantity).toLocaleString("vi-VN")} ₫
                    </div>
                  </div>
                ))}
              </div>

              {/* Tài chính chi tiết */}
              <div className="mt-5 pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính thiết bị:</span>
                  <span className="font-semibold text-slate-900">{subtotal.toLocaleString("vi-VN")} ₫</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Chiết khấu sỉ B2B (5%):</span>
                    <span>-{discount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Phí bàn giao & bảo hành On-site:</span>
                  <span className="text-emerald-700 font-semibold">Miễn phí toàn quốc</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Thuế GTGT VAT (10%):</span>
                  <span className="font-semibold text-slate-900">{tax.toLocaleString("vi-VN")} ₫</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Tổng kinh phí phê duyệt:</span>
                  <span className="text-indigo-600 text-base">{total.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-4 bg-white text-right flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
              >
                {loading ? "Đang xử lý đơn mua sắm..." : "Xác Nhận & Lập Đơn Hàng Mua Sắm (PO)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
