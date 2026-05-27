import { useEffect, useState } from "react";
import api from "../api/axios";
import paymentService from "../services/paymentService";

interface PaymentResponse {
    paymentId: number;
    merchantUid: string;
    amount: number;
    quantity: number;
    price: number;
    status: string;
    requestedAt: string;
}

const IMP_CODE = "imp12487764"; // 포트원 가맹점 코드
const user = {
    email: "his8457@naver.com",
    name: "hwanginseon",
};

function usePortone() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);
}

export default function PaymentTest(): JSX.Element {
    const [loading, setLoading] = useState(false);
    usePortone();

    const onClickPayment = async () => {
        setLoading(true);
        try {
            const { IMP } = window;
            if (!IMP) {
                alert("포트원 SDK 로딩 실패");
                setLoading(false);
                return;
            }

            const eventId = 1;
            const scheduleId = 1;
            const ticketId = 2;
            const quantity = 2;
            const price = 50;
            const amount = quantity * price;
            const paymentTargetType = "RESERVATION";
            const merchantUid = await paymentService.generateMerchantUid(paymentTargetType);

            IMP.init(IMP_CODE);
            // 1. 결제 준비 (DB에 결제 정보 미리 등록)
            await paymentService.savePaymentRequest({
                eventId,
                paymentTargetType,
                quantity,
                price,
                amount,
                merchantUid,
                pgProvider: "uplus",
                scheduleId,
                ticketId
            });

            // 2. 결제 요청
            IMP.request_pay(
                {
                    pg: "uplus",
                    pay_method: "card",
                    merchant_uid: merchantUid,
                    name: "공연 티켓 결제",
                    amount,
                    buyer_email: user.email,
                    buyer_name: user.name
                },
                async (rsp) => {
                    if (rsp.success) {
                        if (!rsp.imp_uid) {
                            alert("결제 승인번호를 확인할 수 없습니다.");
                            setLoading(false);
                            return;
                        }

                        // 3. 결제 검증 (백엔드에서 imp_uid로 포트원 검증)
                        await paymentService.completePayment({
                            impUid: rsp.imp_uid,
                            merchantUid: rsp.merchant_uid,
                            amount: rsp.paid_amount ?? amount,
                            applyNum: rsp.apply_num,
                            scheduleId,
                            ticketId
                        });
                        alert("결제 성공!");
                        setLoading(false);
                    } else {
                        alert("결제 실패: " + rsp.error_msg);
                        setLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error("결제 테스트 실패:", error);
            alert("결제 요청에 실패했습니다.");
            setLoading(false);
        }
    };




    // 전체 취소(환불)
    const onClickPaymentCancel = async () => {
        setLoading(true);
        try {
            const paymentId = 1;
            const merchantUid = 'TICKET_202508082211_15224';

            await api.post<PaymentResponse>("/api/refunds/" + paymentId + "/request", {
                merchantUid: merchantUid,
                refundRequestAmount: 30,
                reason: '테스트 결제 환불1'
            });
            alert("환불 요청이 성공적으로 접수되었습니다.");
        } catch {
            alert("환불 요청에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const onClickRefundApprove = async () => {
        setLoading(true);
        try {
            const refundId = 3; // 환불 요청 ID (실제로는 환불 요청 후 받은 ID 사용)

            await api.post<PaymentResponse>("/api/refunds/" + refundId + "/approve");
            alert("환불이 승인되었습니다.");
        } catch {
            alert("환불 승인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="flex space-x-4">
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={onClickPayment}
                >
                    결제 요청
                </button>
                <button
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={onClickPaymentCancel}
                >
                    결제 취소(환불)
                </button>
                <button
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={onClickRefundApprove}
                    disabled={loading}
                >
                    환불 승인
                </button>
            </div>
        </div>
    );
}
