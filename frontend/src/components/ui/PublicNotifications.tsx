import React from "react";
import { ToastContainer, Slide, type CloseButtonProps } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import { tx, useLocale } from "../../i18n";

function NotificationClose({ closeToast }: CloseButtonProps) {
  useLocale();
  return <button type="button" className="pp-toast-close" aria-label={tx("common:notifications.dismiss")} onClick={(event) => { event.stopPropagation(); closeToast(true); }}><X size={18} aria-hidden="true" /></button>;
}
const renderClose = (props: CloseButtonProps) => <NotificationClose {...props} />;

export default function PublicNotifications() {
  useLocale();
  return <div className="pp-toast-host"><ToastContainer ariaLabel={tx("common:notifications.name")} closeButton={renderClose} transition={Slide} /></div>;
}
