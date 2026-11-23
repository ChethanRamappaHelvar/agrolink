import { money, dateTime } from '../utils/format'
import { Badge } from './ui'

/** Printable invoice. prop "data" is the JSON from /orders/{id}/invoice */
export default function Invoice({ data }) {
  const o = data.order
  return (
    <div className="invoice invoice-print">
      <div className="invoice-head">
        <div><div className="logo"><span className="mark">🌾</span><span>Agro<b>Link</b></span></div><p className="muted small">Farmer Marketplace · Tax invoice</p></div>
        <div className="right"><h3 style={{ margin: 0 }}>{data.invoiceNumber}</h3><p className="muted small">Issued {dateTime(data.issuedAt)}<br />Order {o.orderCode}</p></div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
        <div><b>Billed to</b><p className="soft small">{o.shipping.name}<br />{o.shipping.address}<br />{o.shipping.city}, {o.shipping.state} - {o.shipping.pincode}<br />📞 {o.shipping.phone}</p></div>
        <div><b>Sold by</b><p className="soft small">{o.farmer.name} ({o.farmer.userCode})<br />{o.farmer.location}{o.farmer.state ? ', ' + o.farmer.state : ''}</p>
          <b>Payment</b><p className="soft small">{o.payment?.method} · <Badge status={o.payment?.status} /></p></div>
      </div>
      <table className="tbl">
        <thead><tr><th>Product</th><th className="right">Rate</th><th className="right">Qty</th><th className="right">Amount</th></tr></thead>
        <tbody>{o.items.map((i) => <tr key={i.id}><td>{i.name}</td><td className="right">{money(i.price)} / {i.unit}</td><td className="right">{i.quantity}</td><td className="right">{money(i.subtotal)}</td></tr>)}</tbody>
      </table>
      {Number(o.discountAmount) > 0 && <div className="right mt"><span className="soft">Coupon {o.couponCode}: </span><b>− {money(o.discountAmount)}</b></div>}
      <div className="right mt"><span className="soft">Grand total </span><b className="pprice" style={{ fontSize: '1.7rem' }}>{money(data.amount)}</b></div>
      <p className="muted small center mt2">Thank you for supporting local farmers! This is a computer generated invoice.</p>
    </div>
  )
}
