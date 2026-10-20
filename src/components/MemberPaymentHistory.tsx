import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/useAuth";
import { db } from "../firebase/firebaseConfig";
import { membershipCall, certificationError } from "../firebase/certification";

type Payment = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt?: Timestamp;
};

export default function MemberPaymentHistory() {
  const { user } = useAuth();
  return user ? <PaymentRecords key={user.uid} uid={user.uid} /> : null;
}

function PaymentRecords({ uid }: { uid: string }) {
  const [receiptError, setReceiptError] = useState('');
  const [downloading, setDownloading] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const paymentsQuery = query(
      collection(db, "paymentOrders"),
      where("uid", "==", uid)
    );

    const unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        const records = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            reference: String(data.reference ?? doc.id),
            amount: Number(data.amountMinor ?? 0),
            currency: String(data.currency ?? "NGN"),
            status: String(data.status ?? "pending"),
            createdAt: data.createdAt,
          };
        });

        records.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) -
            (a.createdAt?.toMillis?.() ?? 0)
        );

        setPayments(records);
        setLoading(false);
        setError("");
      },
      (caught) => {
      console.error("Payment History Firebase Error:", caught);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load payment history."
      );
      setLoading(false);
    }
    );

    return () => unsubscribe();
  }, [uid]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

  async function receipt(reference: string) {
    setReceiptError(''); setDownloading(reference);
    try {
      const result = await membershipCall<{ reference: string; receiptId: string; fullName: string; amountMinor: number; currency: string; confirmedAt: string }>('membershipPaymentReceipt', { reference });
      const text = ['ASBESOC NIGERIA — PAYMENT RECEIPT', `Receipt: ${result.receiptId}`, `Reference: ${result.reference}`, `Member: ${result.fullName}`, `Amount: ${formatAmount(result.amountMinor,result.currency)}`, `Verified: ${result.confirmedAt}`, 'Purpose: Annual membership', 'Status: Paid — verified by server'].join('\r\n');
      const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
      const anchor=document.createElement('a');anchor.href=url;anchor.download=`${result.reference}-receipt.txt`;anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    } catch(error) { setReceiptError(certificationError(error)); } finally { setDownloading(''); }
  }

  return (
    <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#063b25]">
        Payment History
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        View your ASBESOC membership transactions.
      </p>

      {loading && (
        <p className="mt-6 text-gray-500">
          Loading your payments...
        </p>
      )}

      {error && (
        <p className="mt-6 text-red-600" role="alert">
          {error}
        </p>
      )}
      {receiptError && <p role="alert" className="mt-4 text-red-600">{receiptError}</p>}

      {!loading && !error && payments.length === 0 && (
        <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
          <p className="font-medium text-gray-700">
            No payment history yet.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your membership transactions will appear here
            after payment processing begins.
          </p>
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#063b25] text-white">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Reference</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Receipt</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-100"
                >
                  <td className="p-3">
                    {payment.createdAt?.toDate?.()
                      .toLocaleDateString("en-NG") ?? "-"}
                  </td>

                  <td className="p-3 font-mono text-xs">
                    {payment.reference}
                  </td>

                  <td className="p-3 font-semibold">
                    {formatAmount(
                      payment.amount,
                      payment.currency
                    )}
                  </td>

                  <td className="p-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium capitalize text-gray-700">
                      {payment.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="p-3">{payment.status === 'paid' && <button className="text-emerald-800 underline" disabled={!!downloading} onClick={() => void receipt(payment.reference)}>{downloading === payment.reference ? 'Preparing…' : 'Download receipt'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
