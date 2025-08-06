import React, { useState } from "react";

interface Expectation {
  id: number;
  author: string;
  rating: number;
  date: string;
  content: string;
  likeCount: number;
  isHidden?: boolean;
  isLiked?: boolean;
}

export const Expectations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedExpectationId, setSelectedExpectationId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [newExpectation, setNewExpectation] = useState("");
  const [expectations, setExpectations] = useState<Expectation[]>([
    {
      id: 1,
      author: "김서연",
      rating: 5,
      date: "2024.01.20",
      content: "예매 완료했습니다! 포스터만 봐도 정말 기대되는 작품이에요. 배우 라인업도 훌륭하고 스토리도 흥미로워 보입니다.",
      likeCount: 15,
      isLiked: false
    },
    {
      id: 2,
      author: "정민우",
      rating: 4,
      date: "2024.01.18",
      content: "드디어 티켓팅 성공! 작년 시즌1이 너무 좋았어서 이번 시즌2도 정말 기대하고 있어요. 새로운 캐스팅도 궁금합니다.",
      likeCount: 22,
      isLiked: false
    },
    {
      id: 3,
      author: "이하늘",
      rating: 5,
      date: "2024.01.16",
      content: "원작 소설을 읽고 너무 감동받아서 뮤지컬로는 어떻게 표현될지 정말 궁금해요. 음악과 연출이 기대됩니다!",
      likeCount: 18,
      isLiked: false
    },
    {
      id: 4,
      author: "박지원",
      rating: 5,
      date: "2024.01.14",
      content: "포스트 말론의 라이브를 직접 볼 수 있다니 꿈만 같아요. 무대 연출과 음향이 정말 기대됩니다.",
      likeCount: 31,
      isLiked: false
    },
    {
      id: 5,
      author: "최수진",
      rating: 4,
      date: "2024.01.12",
      content: "친구들과 함께 가기로 했는데 정말 설레요. 공연장 분위기도 기대되고 음악도 너무 좋을 것 같아요.",
      likeCount: 12,
      isLiked: false
    },
    {
      id: 6,
      author: "김지훈",
      rating: 5,
      date: "2024.01.10",
      content: "포스트 말론의 라이브를 직접 볼 수 있다니 꿈만 같아요. 무대 연출과 음향이 정말 기대됩니다.",
      likeCount: 28,
      isLiked: false
    },
    {
      id: 7,
      author: "박미영",
      rating: 4,
      date: "2024.01.08",
      content: "원작 소설을 읽고 너무 감동받아서 뮤지컬로는 어떻게 표현될지 정말 궁금해요. 음악과 연출이 기대됩니다!",
      likeCount: 19,
      isLiked: false
    },
    {
      id: 8,
      author: "이준호",
      rating: 5,
      date: "2024.01.06",
      content: "드디어 티켓팅 성공! 작년 시즌1이 너무 좋았어서 이번 시즌2도 정말 기대하고 있어요. 새로운 캐스팅도 궁금합니다.",
      likeCount: 35,
      isLiked: false
    },
    {
      id: 9,
      author: "정수진",
      rating: 4,
      date: "2024.01.04",
      content: "예매 완료했습니다! 포스터만 봐도 정말 기대되는 작품이에요. 배우 라인업도 훌륭하고 스토리도 흥미로워 보입니다.",
      likeCount: 16,
      isLiked: false
    },
    {
      id: 10,
      author: "최민수",
      rating: 5,
      date: "2024.01.02",
      content: "포스트 말론의 히트곡들을 라이브로 들을 수 있어서 정말 행복할 것 같아요. 무대 위에서의 에너지가 기대됩니다.",
      likeCount: 42,
      isLiked: false
    },
    {
      id: 11,
      author: "김영희",
      rating: 4,
      date: "2023.12.30",
      content: "연말을 장식하는 최고의 공연이 될 것 같아요. 포스트 말론의 카리스마 넘치는 무대 매너도 인상적일 것 같습니다.",
      likeCount: 23,
      isLiked: false
    }
  ]);

  const expectationsPerPage = 10;
  const totalPages = Math.ceil(expectations.length / expectationsPerPage);
  const startIndex = (currentPage - 1) * expectationsPerPage;
  const endIndex = startIndex + expectationsPerPage;
  const currentExpectations = expectations.slice(startIndex, endIndex);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-base leading-6 ${index < rating ? "text-[#ffd700]" : "text-[#dddddd]"
          }`}
      >
        ★
      </span>
    ));
  };

  const handleLike = (expectationId: number) => {
    setExpectations(prevExpectations =>
      prevExpectations.map(expectation =>
        expectation.id === expectationId
          ? {
            ...expectation,
            isLiked: !expectation.isLiked,
            likeCount: expectation.isLiked ? expectation.likeCount - 1 : expectation.likeCount + 1
          }
          : expectation
      )
    );
  };

  const handleReport = (expectationId: number) => {
    setSelectedExpectationId(expectationId);
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }

    // 실제로는 API 호출하여 신고 데이터를 서버에 전송
    console.log(`기대평 ID ${selectedExpectationId} 신고: ${reportReason}`);

    // 모달 닫기 및 상태 초기화
    setShowReportModal(false);
    setSelectedExpectationId(null);
    setReportReason("");

    // 신고 접수 완료 메시지
    alert("신고가 접수되었습니다.");
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedExpectationId(null);
    setReportReason("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSubmitExpectation = () => {
    if (!newExpectation.trim()) {
      alert("기대평 내용을 입력해주세요.");
      return;
    }

    const newExpectationData: Expectation = {
      id: expectations.length + 1,
      author: "나",
      rating: 0,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace('.', ''),
      content: newExpectation,
      likeCount: 0,
      isLiked: false
    };

    setExpectations(prev => [newExpectationData, ...prev]);
    setNewExpectation("");
  };

  return (
    <div>
      <h3 className="text-2xl font-semibold text-[#212121] mb-8">
        기대평
      </h3>

      {/* 기대평 작성 폼 */}
      <div className="w-full p-6 rounded-lg border border-[#0000001a] mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#212121] mb-2">
            기대평 작성
          </label>
          <textarea
            value={newExpectation}
            onChange={(e) => setNewExpectation(e.target.value)}
            placeholder="기대감을 자유롭게 작성해주세요."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base leading-6"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmitExpectation}
            className="bg-black hover:bg-gray-800 text-white font-medium text-base px-6 py-3 rounded-[10px] transition-colors"
          >
            등록
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {currentExpectations.map((expectation) => (
          <div
            key={expectation.id}
            className="w-full p-6 rounded-lg border border-[#0000001a]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-base text-[#212121] font-normal">
                  {expectation.author}
                </span>
              </div>
              <span className="text-sm text-[#00000099] font-normal">
                {expectation.date}
              </span>
            </div>

            <div className="mb-4">
              {expectation.isHidden ? (
                <p className="text-base text-[#00000080] font-normal">
                  비공개 처리된 기대평입니다.
                </p>
              ) : (
                <p className="text-base text-black font-normal leading-6">
                  {expectation.content}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(expectation.id)}
                  className={`flex items-center gap-2 text-sm font-normal transition-colors ${expectation.isLiked
                    ? "text-red-500"
                    : "text-[#00000099] hover:text-red-500"
                    }`}
                >
                  <span className="text-lg">
                    {expectation.isLiked ? "❤️" : "🤍"}
                  </span>
                  <span>좋아요</span>
                  <span>{expectation.likeCount}</span>
                </button>
              </div>
              <button
                onClick={() => handleReport(expectation.id)}
                className="text-sm text-[#00000099] font-normal hover:text-red-500 transition-colors"
              >
                신고
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#00000099] border-[#00000033] hover:bg-gray-50"
                }`}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${currentPage === page
                  ? "bg-black text-white border-black"
                  : "text-[#00000099] border-[#00000033] hover:bg-gray-50"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${currentPage === totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#00000099] border-[#00000033] hover:bg-gray-50"
                }`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#e7eaff] rounded-lg p-6 mt-8">
        <h4 className="text-base font-semibold text-[#212121] mb-4">
          주요 안내사항
        </h4>
        <div className="space-y-2">
          <p className="text-sm text-black font-normal">
            • 기대평은 공연 예매 전후에 자유롭게 작성하실 수 있습니다.
          </p>
          <p className="text-sm text-black font-normal">
            • 부적절한 내용이나 광고성 글은 관리자에 의해 삭제될 수 있습니다.
          </p>
          <p className="text-sm text-black font-normal">
            • 타인에게 불쾌감을 주는 표현은 자제해주시기 바랍니다.
          </p>
          <p className="text-sm text-black font-normal">
            • 스포일러가 포함된 내용은 다른 관람객을 위해 주의해주세요.
          </p>
          <p className="text-sm text-black font-normal">
            • 허위 정보나 과장된 내용은 작성하지 말아주세요.
          </p>
        </div>
      </div>

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[1001] bg-black bg-opacity-30">
          <div className="bg-white w-[411px] rounded-[10px] shadow-lg border border-gray-200">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="[font-family:'Segoe_UI-Bold',Helvetica] font-bold text-black text-xl tracking-[0] leading-[30px] mb-4">
                  신고하기
                </h3>
                <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-base tracking-[0] leading-6 mb-6">
                  신고 사유를 입력해주세요
                </p>
              </div>

              <div className="mb-6">
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="신고 사유를 입력해주세요..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [font-family:'Roboto-Regular',Helvetica] font-normal text-black text-base tracking-[0] leading-6"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-base tracking-[0] leading-6"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-base tracking-[0] leading-6"
                >
                  신고하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 