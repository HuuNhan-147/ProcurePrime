import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, ArrowLeft, FileText } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";
import { useCart } from "../context/CartContext";
import { QuotationModal } from "../components/procurement/QuotationModal";
import { BudgetProgressBar } from "../components/procurement/BudgetProgressBar";

const CartPage = () => {
  const {
    cartItems,
    itemsPrice,
    discountPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    removeFromCart,
    updateQuantity,
    fetchCart,
  } = useCart();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quotationNumber, setQuotationNumber] = useState<string | null>(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [exportingQuote, setExportingQuote] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleExportQuotation = async () => {
    if (!cartItems || cartItems.length === 0) return;
    setExportingQuote(true);
    try {
      const itemsPayload = cartItems.map((ci) => ({
        productName: ci.product.name,
        unitPrice: ci.product.price,
        quantity: ci.quantity,
      }));
      const res = await fetch("http://localhost:5000/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsPayload,
          organization: {
            name: "Doanh Nghiệp Thu Mua B2B",
            taxCode: "0101234567",
            address: "Việt Nam",
            phone: "0901234567",
            status: "ACTIVE",
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuotationNumber(data.data.quotationNumber);
        setIsQuotationModalOpen(true);
      } else {
        alert(data.message || "Không thể tạo báo giá");
      }
    } catch (err: any) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setExportingQuote(false);
    }
  };

  const loadCart = async () => {
    if (!token) {
      setError("Vui lòng đăng nhập để xem giỏ hàng!");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fetchCart();
      if (cartItems.length === 0) {
        // Có thể fetchCart vừa chạy xong và cập nhật context rỗng
        // Nhưng component sẽ re-render khi cartItems cập nhật.
      }
    } catch (err: any) {
      console.error(err);
      setError("Không thể lấy thông tin giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      setError("Không thể xóa sản phẩm.");
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (err) {
      console.error("Lỗi khi cập nhật số lượng:", err);
      setError("Không thể cập nhật số lượng sản phẩm.");
    }
  };

  const handleBuyNow = () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    const products = cartItems.map((item) => ({
      _id: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
      countInStock: item.product.countInStock,
    }));

    navigate("/create", {
      state: {
        products,
        summary: {
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCartEmpty = !cartItems || cartItems.length === 0;

  if (error || isCartEmpty) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          {error || "Giỏ hàng của bạn đang trống"}
        </h2>
        <p className="text-gray-600 mb-6">
          Hãy khám phá cửa hàng và thêm sản phẩm vào giỏ hàng!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Giỏ hàng của bạn
        </h1>
        <div className="flex items-center text-gray-600">
          <Link to="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-blue-600">Giỏ hàng</span>
        </div>
      </div>

      <div className="lg:flex gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-gray-100 p-4 text-gray-600 font-medium">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-3 text-center">Số lượng</div>
              <div className="col-span-2 text-center">Thành tiền</div>
            </div>

            {cartItems.map((item) => (
              <CartItem
                key={item.product._id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        <div className="lg:w-1/3 mt-8 lg:mt-0 space-y-4">
          <BudgetProgressBar currentTotal={totalPrice} maxBudget={100_000_000} />

          <CartSummary
            itemsPrice={itemsPrice}
            discountPrice={discountPrice}
            shippingPrice={shippingPrice}
            taxPrice={taxPrice}
            totalPrice={totalPrice}
            onBuyNow={handleBuyNow}
          />

          <button
            onClick={handleExportQuotation}
            disabled={exportingQuote || cartItems.length === 0}
            className="w-full bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-800 hover:from-indigo-800 hover:to-blue-900 text-white py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50 text-sm"
          >
            <FileText className="w-4 h-4" />
            {exportingQuote ? "Đang Khởi Tạo Báo Giá..." : "📄 Xuất Báo Giá Thương Mại B2B"}
          </button>
        </div>
      </div>

      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        quotationNumber={quotationNumber}
      />
    </div>
  );
};

export default CartPage;
