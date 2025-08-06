import React from "react";
import { useParams } from "react-router-dom";

interface ExternalLinkProps {
  isOpen: boolean;
  onClose: () => void;
  officialUrl?: string;
  externalLinks?: { url: string; displayText: string; }[];
}

export const ExternalLink = ({ isOpen, onClose, officialUrl, externalLinks }: ExternalLinkProps) => {
  const { eventId } = useParams();

  const linksToDisplay = [];

  if (officialUrl) {
    linksToDisplay.push({
      id: 'official',
      name: '공식 예매처',
      url: officialUrl,
      description: '행사 공식 웹사이트를 통해 예매하실 수 있습니다.'
    });
  }

  if (externalLinks && externalLinks.length > 0) {
    externalLinks.forEach((link, index) => {
      linksToDisplay.push({
        id: `external-${index}`,
        name: link.displayText,
        url: link.url,
        description: `${link.displayText}를 통해 예매하실 수 있습니다.`
      });
    });
  }

  const handleExternalBooking = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[1001] bg-black bg-opacity-30"
    >
      <div className="bg-white w-[800px] h-[700px] rounded-[10px] border border-solid border-[#0000006b] shadow-[0px_2px_8px_#0000001a] relative">
        {/* 제목 제거 (동적 데이터 없음) */}
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-transparent hover:bg-gray-100 rounded-full transition-colors text-gray-600 font-bold text-lg focus:outline-none focus:ring-0"
        >
          ×
        </button>

        {/* 제목 */}
        <p className="absolute top-[58px] left-0 right-0 text-center font-semibold text-black text-[32px] leading-10">
          POST MALONE LIVE IN SEOUL 2025
        </p>

        {/* 구분선 */}
        <div className="absolute w-[200px] h-px top-[120px] left-1/2 transform -translate-x-1/2 bg-[#0000004c]" />

        {/* 안내 메시지 */}
        <p className="absolute top-[159px] left-0 right-0 text-center text-black text-xl leading-7 font-normal">
          해당 행사는 외부 예매처를 통해 예매하실 수 있습니다.
        </p>

        {/* 예매처 목록 */}
        <div className="absolute top-[220px] left-0 right-0 px-8">
          <div className="space-y-4">
            {linksToDisplay.length > 0 ? (
              linksToDisplay.map((partner) => (
                <div key={partner.id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-lg border border-solid border-[#0000001a]">
                  {/* 예매처 정보 */}
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-[50px] bg-white rounded flex items-center justify-center border border-gray-200">
                      {/* 로고 대신 텍스트 표시 */}
                      <span className="text-sm font-medium text-gray-600">{partner.name}</span>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-black">{partner.name}</p>
                      <p className="text-sm text-gray-600">{partner.description}</p>
                    </div>
                  </div>

                  {/* 예매 버튼 */}
                  <button
                    onClick={() => handleExternalBooking(partner.url)}
                    className="w-[120px] h-[50px] bg-[#ef6156] hover:bg-[#d85147] rounded-[10px] text-white font-semibold text-lg transition-colors"
                  >
                    예매하기
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                현재 이용 가능한 외부 예매처가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="absolute bottom-[120px] left-8 right-8 bg-[#0000000d] rounded-md border border-solid border-[#0000001a] p-4">
          <div className="flex items-start gap-3">
            <div className="w-4 h-4 mt-1">
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[#000000b2] text-sm leading-5 font-normal">
              외부 사이트로 이동합니다. 예매, 환불 및 티켓 수령은 해당 예매처의 정책을 따릅니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};;

export default ExternalLink; 