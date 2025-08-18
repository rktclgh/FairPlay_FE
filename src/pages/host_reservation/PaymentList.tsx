import React, { useState } from "react";
import { TopNav } from "../../components/TopNav";
import { HostSideNav } from "../../components/HostSideNav";

export const PaymentList: React.FC = () => {
    interface PaymentItem {
        paidAt: string;
        merchantUid: string;
        reservationNumber: string;
        method: string;
        amount: number;
        status: "COMPLETED" | "PENDING" | "CANCELLED" | "FAILED";
        buyerName: string;
    }

    const [payments] = useState<PaymentItem[]>([
        {
            paidAt: "2025-01-10 14:23",
            merchantUid: "ORDER-20250110-0001",
            reservationNumber: "RES-20250110-1001",
            method: "카드",
            amount: 35000,
            status: "COMPLETED",
            buyerName: "김민수",
        },
        {
            paidAt: "2025-01-10 15:10",
            merchantUid: "ORDER-20250110-0002",
            reservationNumber: "RES-20250110-1002",
            method: "계좌이체",
            amount: 120000,
            status: "PENDING",
            buyerName: "이영희",
        },
        {
            paidAt: "2025-01-11 09:41",
            merchantUid: "ORDER-20250111-0003",
            reservationNumber: "RES-20250111-1003",
            method: "카드",
            amount: 0,
            status: "COMPLETED",
            buyerName: "박준호",
        },
        {
            paidAt: "2025-01-11 10:05",
            merchantUid: "ORDER-20250111-0004",
            reservationNumber: "RES-20250111-1004",
            method: "가상계좌",
            amount: 50000,
            status: "FAILED",
            buyerName: "정가영",
        },
        {
            paidAt: "2025-01-12 18:22",
            merchantUid: "ORDER-20250112-0005",
            reservationNumber: "RES-20250112-1005",
            method: "카드",
            amount: 70000,
            status: "CANCELLED",
            buyerName: "최도현",
        },
    ]);

    const formatAmount = (won: number) => (won === 0 ? "무료" : `${won.toLocaleString()}원`);
    const statusPill = (status: PaymentItem["status"]) => {
        const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case "COMPLETED":
                return `${base} bg-emerald-100 text-emerald-800`;
            case "PENDING":
                return `${base} bg-blue-100 text-blue-800`;
            case "CANCELLED":
                return `${base} bg-gray-100 text-gray-800`;
            case "FAILED":
                return `${base} bg-rose-100 text-rose-800`;
            default:
                return `${base} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <TopNav />

                <div className="top-[137px] left-64 absolute">
                    <h1 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl tracking-[0] leading-[54px] whitespace-nowrap">
                        예약/결제 목록
                    </h1>
                </div>

                <HostSideNav className="!absolute !left-0 !top-[117px]" />

                <div className="absolute left-64 top-[220px] w-[949px] pb-20">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b">
                            <div
                                className="grid gap-2 p-4 items-center w-full"
                                style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr' }}
                            >
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">결제일시</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">주문번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">예약번호</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">결제수단</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">결제금액</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">결제상태</div>
                                <div className="[font-family:'Roboto-Bold',Helvetica] font-bold text-gray-700 text-sm text-center">구매자</div>
                            </div>
                        </div>

                        <div>
                            {payments.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">표시할 데이터가 없습니다.</div>
                            ) : (
                                payments.map((p) => (
                                    <div key={p.merchantUid} className="border-b hover:bg-gray-50 transition-colors">
                                        <div
                                            className="grid gap-2 p-4 items-center w-full"
                                            style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr 1fr' }}
                                        >
                                            <div className="text-gray-900 text-sm text-center">{p.paidAt}</div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{p.merchantUid}</div>
                                            <div className="text-gray-900 text-sm text-center whitespace-nowrap">{p.reservationNumber}</div>
                                            <div className="text-gray-900 text-sm text-center">{p.method}</div>
                                            <div className="text-gray-900 text-sm text-center">{formatAmount(p.amount)}</div>
                                            <div className="flex items-center justify-center text-center">
                                                <span className={statusPill(p.status)}>
                                                    {p.status === 'COMPLETED' ? '결제완료' : p.status === 'PENDING' ? '결제대기' : p.status === 'CANCELLED' ? '결제취소' : '결제실패'}
                                                </span>
                                            </div>
                                            <div className="text-gray-900 text-sm text-center">{p.buyerName}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentList;


