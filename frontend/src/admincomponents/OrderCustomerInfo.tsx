import { tx, uiText, useLocale } from "../i18n";
import React from "react";
import { FiUser, FiHome } from "react-icons/fi";

const OrderCustomerInfo = ({ order }: { order: any }) => {
  useLocale();
  const { user, shippingAddress } = order;
  return (
    <>
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiUser className="text-[#254AD7] mr-2" />
          <h2 className="text-lg font-semibold">{tx("adminOrders:customer")}</h2>
        </div>
        <div className="space-y-3">
          <div><p className="text-sm text-gray-500">{tx("adminOrders:customerName")}</p><p className="font-medium">{uiText(user?.name)}</p></div>
          <div><p className="text-sm text-gray-500">{tx("adminOrders:email")}</p><p className="font-medium">{uiText(user?.email)}</p></div>
          <div><p className="text-sm text-gray-500">{tx("adminOrders:phoneNumber")}</p><p className="font-medium">{uiText(shippingAddress?.phone)}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FiHome className="text-green-500 mr-2" />
          <h2 className="text-lg font-semibold">{tx("adminOrders:deliveryAddress")}</h2>
        </div>
        <div className="space-y-3">
          <div><p className="text-sm text-gray-500">{tx("adminOrders:fullName")}</p><p className="font-medium">{uiText(shippingAddress?.fullname)}</p></div>
          <div><p className="text-sm text-gray-500">{tx("adminOrders:address")}</p><p className="font-medium">{uiText(shippingAddress?.address)}</p></div>
          <div><p className="text-sm text-gray-500">{tx("adminOrders:city")}</p><p className="font-medium">{uiText(shippingAddress?.city)}</p></div>
          <div><p className="text-sm text-gray-500">{tx("adminOrders:notes")}</p><p className="font-medium italic">{uiText(shippingAddress?.note || tx("adminOrders:noNotes"))}</p></div>
        </div>
      </div>
    </>
  );
};

export default OrderCustomerInfo;
