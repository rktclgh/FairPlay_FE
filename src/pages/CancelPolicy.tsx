import React from "react";

interface CancelPolicyProps {
  bookingInfo?: {
    qrTicketInfo?: string[];
    entryMethod?: string[];
    cancellationFees?: string[];
    refundMethod?: string[];
    importantNotices?: string[];
  };
}

export const CancelPolicy = ({ bookingInfo }: CancelPolicyProps) => {
  // 기본값 설정
  const defaultBookingInfo = {
    qrTicketInfo: [
      "• 예매(결제) 완료 즉시, [마이페이지 > 나의 예매/QR]에서 QR 티켓을 확인하실 수 있습니다.",
      "• QR 티켓은 문자 또는 이메일로도 발송되며, 행사 당일 입장 시 해당 QR 코드를 제시해 주세요.",
      "• 티켓 출력 없이 스마트폰만으로 입장 가능합니다."
    ],
    entryMethod: [
      "• 행사 당일, 입장 게이트에서 QR 코드를 스캔하여 입장하실 수 있습니다.",
      "• 원활한 입장을 위해 공연 시작 30분 전까지 도착해주시기 바랍니다.",
      "• 네트워크 상황에 따라 QR 코드 로딩이 지연될 수 있으니, 미리 티켓을 캡처 또는 저장해두시는 것을 권장합니다."
    ],
    cancellationFees: [
      "• 예매 후 7일 이내: 무료 취소",
      "• 예매 후 8일~공연 10일 전: 티켓금액의 10%",
      "• 공연 9일 전~7일 전: 티켓금액의 20%",
      "• 공연 6일 전~3일 전: 티켓금액의 30%",
      "• 공연 2일 전~당일: 취소 불가"
    ],
    refundMethod: [
      "• 온라인 취소: 예매 사이트에서 직접 취소",
      "• 전화 취소: 예매처 고객센터 연락",
      "• 환불 기간: 취소 신청 후 3~5 영업일"
    ],
    importantNotices: [
      "• 티켓 분실 시 재발급이 불가능하니 주의하시기 바랍니다.",
      "• 공연 일정 및 출연진은 주최측 사정에 의해 변경될 수 있습니다."
    ]
  };

  const info = bookingInfo || defaultBookingInfo;

  return (
    <div>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-[#212121]">
          예매 안내
        </h3>

        <div>
          <h4 className="text-base font-semibold text-[#212121] mb-4">
            모바일 QR 티켓 발급
          </h4>
          <div className="space-y-3">
            {info.qrTicketInfo?.map((item, index) => (
              <p key={index} className="text-base text-black">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-[#212121] mb-4">
            입장 방법
          </h4>
          <div className="space-y-3">
            {info.entryMethod?.map((item, index) => (
              <p key={index} className="text-base text-black">
                {item}
              </p>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#212121]">
          취소 및 환불 안내
        </h3>

        <div>
          <h4 className="text-base font-semibold text-[#212121] mb-4">
            취소 수수료
          </h4>
          <div className="space-y-3">
            {info.cancellationFees?.map((item, index) => (
              <p key={index} className="text-base text-black">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-[#212121] mb-4">
            환불 방법
          </h4>
          <div className="space-y-3">
            {info.refundMethod?.map((item, index) => (
              <p key={index} className="text-base text-black">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-[#e7eaff] rounded-lg p-6">
          <h4 className="text-base font-semibold text-[#212121] mb-4">
            주요 안내사항
          </h4>
          <div className="space-y-2">
            {info.importantNotices?.map((item, index) => (
              <p key={index} className="text-sm text-black">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 