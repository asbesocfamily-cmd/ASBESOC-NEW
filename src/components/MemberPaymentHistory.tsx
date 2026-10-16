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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    const paymentsQuery = query(
      collection(db, "paymentOrders"),
      where("uid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      paymentsQuery,
      (snapshot) => {
        const records = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            reference: String(data.reference ?? doc.id),
            amount: Number(data.amount ?? 0),
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
  }, [user]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount / 100);
  };

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
                      .toLocaleDateString("en-NG") ?? "â€”"}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
