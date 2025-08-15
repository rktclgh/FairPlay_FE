import React, { useState, useEffect } from "react";
import type {
  ReviewForEventResponseDto,
  ReviewWithOwnerDto
} from "../../services/types/reviewType";
import { updateReaction } from "../../services/review";

interface ReviewsProps {
  data: ReviewForEventResponseDto | null;
  currentPage: number;   
  onPageChange: (page: number) => void;
}

// 행사 상세페이지 리뷰 컴포넌트
export const Reviews = ({ data, currentPage, onPageChange }: ReviewsProps) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reviews, setReviews] = useState<ReviewWithOwnerDto[]>(data?.reviews?.content ?? []);
  const totalPages = data?.reviews?.totalPages ?? 1;

  // props로 전달된 리뷰 목록이 변경되면 동기화
  useEffect(() => {
    setReviews(data?.reviews?.content ?? []);
  }, [data?.reviews?.content]);

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

  const handleLike = async (reviewId: number) => {

    if(reviews.find(review => review.review.reviewId === reviewId)?.owner) {
      alert("본인이 작성한 관람평은 좋아요할 수 없습니다.");
      return;
    }

    const res = await updateReaction({ reviewId });
    // 서버에서 내려준 최신 카운트로 동기화
    setReviews(prev => prev.map(r =>
      r.review.reviewId === res.reviewId
        ? { ...r, review: { ...r.review, reactions: res.count } }
        : r
    ));
  };

  const handleReport = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }

    // 실제로는 API 호출하여 신고 데이터를 서버에 전송
    console.log(`관람평 ID ${selectedReviewId} 신고: ${reportReason}`);

    // 모달 닫기 및 상태 초기화
    setShowReportModal(false);
    setSelectedReviewId(null);
    setReportReason("");

    // 신고 접수 완료 메시지
    alert("신고가 접수되었습니다.");
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReviewId(null);
    setReportReason("");
  };

  // 별점 평균 계산 (공개된 관람평만, 별점 기반)
  const calculateAverageRating = (): string => {
    const visibleReviews = reviews.filter(currentReview => currentReview.review.visible);
    if (visibleReviews.length === 0) return "0.00";

    const totalRating = visibleReviews.reduce((sum, currentReview) => sum + currentReview.review.star, 0);
    return (totalRating / visibleReviews.length).toFixed(2);
  };

  const averageRating = calculateAverageRating();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-semibold text-[#212121]">
          관람평
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const rating = parseFloat(averageRating);
              const fullStars = Math.floor(rating);
              const hasPartialStar = index === fullStars && rating % 1 > 0;
              const isFullStar = index < fullStars;
              const isPartialStar = hasPartialStar;

              return (
                <span
                  key={index}
                  className={`text-xl leading-6 relative ${isFullStar ? "text-[#ffd700]" : "text-[#dddddd]"
                    }`}
                >
                  ★
                  {isPartialStar && (
                    <span
                      className="absolute top-0 left-0 text-[#ffd700] overflow-hidden"
                      style={{ width: `${(rating % 1) * 100}%` }}
                    >
                      ★
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <span className="text-lg font-medium text-[#212121]">
            {averageRating}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(currentReview => (
          <div
            key={currentReview.review.reviewId}
            className="w-full p-6 rounded-lg border border-[#0000001a]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-base text-[#212121] font-normal">
                  test
                </span>
                <div className="flex gap-1">
                  {renderStars(currentReview.review.star)}
                </div>
              </div>
              <span className="text-sm text-[#00000099] font-normal">
                {currentReview.review.createdAt}
              </span>
            </div>

            <div className="mb-4">
              {!currentReview.review.visible ? (
                <p className="text-base text-[#00000080] font-normal">
                  비공개 처리된 관람평입니다.
                </p>
              ) : (
                <p className="text-base text-black font-normal leading-6">
                  {currentReview.review.comment}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(currentReview.review.reviewId)}
                  className={`flex items-center gap-2 text-sm font-normal transition-colors ${currentReview.liked
                    ? "text-red-500"
                    : "text-[#00000099] hover:text-red-500"
                    }`}
                >
                  <span className="text-lg">
                    {currentReview.liked ? "❤️" : "🤍"}
                  </span>
                  <span>좋아요</span>
                  <span>{currentReview.review.reactions}</span>
                </button>
              </div>
              <button
                onClick={() => handleReport(currentReview.review.reviewId)}
                className="text-sm text-[#00000099] font-normal hover:text-red-500 transition-colors"
              >
                신고
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() =>  onPageChange(currentPage -1)}
              disabled={currentPage === 0}
              className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${currentPage === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-[#00000099] border-[#00000033] hover:bg-gray-50"
                }`}
            >
              &lt;
            </button>
            {/* 페이지 번호 버튼 */}
            {Array.from({ length: totalPages }, (_, page) => (
              <button
                key={page}
                onClick={() =>  onPageChange(page)} // 0-based
                className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${currentPage === page
                  ? "bg-black text-white border-black"
                  : "text-[#00000099] border-[#00000033] hover:bg-gray-50"
                  }`}
              >
                {page + 1}
              </button>
            ))}
            {/* 다음 페이지 버튼 */}
            <button
              onClick={() =>  onPageChange(currentPage + 1 )}
              disabled={currentPage === totalPages - 1}
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
            • 관람평은 실제 공연을 관람한 후 작성해주시기 바랍니다.
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