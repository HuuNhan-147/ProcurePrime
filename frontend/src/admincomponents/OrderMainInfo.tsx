import { tx, uiText, useLocale, formatVND, formatDate } from "../i18n";
import React from "react";
import { FiPackage, FiCreditCard, FiTruck } from "react-icons/fi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const OrderMainInfo = ({ order }: { order: any }) => {
  useLocale();
  return (
    <div className="bg-white rounded-lg p-6 lg:col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Trạng thái đơn hàng */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FiPackage className="text-[#254AD7] mr-2" />
            <h2 className="text-lg font-semibold">{tx("adminOrders:orderStatus")}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{tx("adminOrders:orderDate2")}</span>
              <span>
                {uiText(formatDate(new Date(order.createdAt), {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'}))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{tx("adminOrders:status")}</span>
              <span
                className={` px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status
                )}  `}
              >
                {({pending:tx('orders:statusPending'),processing:tx('orders:statusProcessing'),completed:tx('orders:statusCompleted'),cancelled:tx('orders:statusCancelled'),shipped:tx('orders:statusShipped')} as Record<string,string>)[order.status] || order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Thanh toán */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FiCreditCard className="text-green-500 mr-2" />
            <h2 className="text-lg font-semibold">{tx("adminOrders:payment")}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{tx("adminOrders:method")}</span>
              <span>{({BankTransfer:tx('orders:bankTransfer'),COD:tx('orders:cashOnDelivery')} as Record<string,string>)[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{tx("adminOrders:availability")}</span>
              <span
                className={
                  order.isPaid
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {uiText(order.isPaid ? tx("adminOrders:paid") : tx("adminOrders:unpaid"))}
              </span>
            </div>
          </div>
        </div>

        {/* Vận chuyển */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FiTruck className="text-[#254AD7] mr-2" />
            <h2 className="text-lg font-semibold">{tx("adminOrders:delivery")}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{tx("adminOrders:availability")}</span>
              <span
                className={
                  order.isDelivered
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {uiText(order.isDelivered ? tx("adminOrders:delivered") : tx("adminOrders:processing"))}
              </span>
            </div>
            {order.deliveredAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">{tx("adminOrders:deliveryDate")}</span>
                <span>
                  {uiText(formatDate(new Date(order.deliveredAt), {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'}))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">{tx("adminOrders:product")}</h2>
        <div className="overflow-x-auto">
          <div className="pp-table-region" role="region" aria-label={tx("adminOrders:dataTable")} tabIndex={0}><table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminOrders:products")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminOrders:unitPrice")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminOrders:quantity")}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tx("adminOrders:lineTotal")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.orderItems.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
  className="h-10 w-10 rounded"
  src={item.image || "/images/no-image.png"}
  alt={uiText(item.name)}
  onError={(e) => {
    (e.currentTarget as HTMLImageElement).src = "/images/no-image.png";
  }}
/>

                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {uiText(item.name)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {uiText(item.product)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatVND(item.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {uiText(item.quantity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatVND(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>

      
      {/* Tổng kết */}
      <div className="bg-gray-50 p-4 rounded-lg">
        {(() => {
          const subTotal = order.orderItems.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
          );
          const tax = subTotal * 0.1;
          const shippingFee = 30000;
          const finalTotal = subTotal + tax + shippingFee;

          return (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{tx("adminOrders:subtotal")}</span>
                <span>{formatVND(subTotal)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{tx("adminOrders:tax10Vat")}</span>
                <span>{formatVND(tax)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">{tx("adminOrders:deliveryFee")}</span>
                <span>{formatVND(shippingFee)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold">{tx("adminOrders:total")}</span>
                <span className="text-xl font-bold text-[#254AD7]">
                  {formatVND(finalTotal)}</span>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default OrderMainInfo;
