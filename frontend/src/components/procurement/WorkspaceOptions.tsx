import { tx, uiText, useLocale, locale, formatVND } from "../../i18n";
import React, { useState } from "react";

interface OptionRow { name: string; specsSummary: string; quantity: number; unitPrice: number; subtotal: number }

/** Read-only comparison of the current quotation. Does not select or change quote lines. */
export default function WorkspaceOptions({ items }: { items: OptionRow[] }) {
  useLocale();
  const [selected, setSelected] = useState<number[]>([]);
  const visible = selected.filter((index) => index < items.length);
  return <div className="pw-options">
    <h2>{tx("workspace:devicesComparison")}</h2>
    <p className="pw-muted">{tx("workspace:informationFromTheCurrentQuotationSelectLines")}</p>
    {!items.length ? <div className="pw-empty"><h3>{tx("workspace:noDevicesToCompare")}</h3><p>{tx("workspace:continueYourRequestWithAiDeviceDetails")}</p></div> : <>
      <div className="pw-option-list">{items.map((item, index) => <label key={`${index}-${item.name}`} className="pw-option">
        <input type="checkbox" checked={visible.includes(index)} onChange={() => setSelected((current) => current.includes(index) ? current.filter((i) => i !== index) : [...current, index])} />
        <span><strong>{uiText(item.name)}</strong><span>{uiText(item.specsSummary)}</span><span>{formatVND(item.unitPrice)}{" "}{tx("workspace:deviceQuantity3")}{" "}{uiText(item.quantity)}</span></span>
      </label>)}</div>
      {visible.length > 0 && <div className="pw-table-scroll" role="region" aria-label={tx("workspace:compareDevicesFromQuotation")} tabIndex={0}><table><caption>{tx("common:counts.comparison", {count:visible.length})}</caption><thead><tr><th scope="col">{tx("workspace:information")}</th>{visible.map((index) => <th scope="col" key={index}>{uiText(items[index].name)}</th>)}</tr></thead><tbody>
        <tr><th scope="row">{tx("workspace:specificationsFromQuotation")}</th>{visible.map((index) => <td key={index}>{uiText(items[index].specsSummary)}</td>)}</tr>
        <tr><th scope="row">{tx("workspace:quantity")}</th>{visible.map((index) => <td key={index}>{uiText(items[index].quantity)}</td>)}</tr>
        <tr><th scope="row">{tx("workspace:unitPrice")}</th>{visible.map((index) => <td key={index}>{formatVND(items[index].unitPrice)}</td>)}</tr>
      </tbody></table></div>}
    </>}
  </div>;
}
