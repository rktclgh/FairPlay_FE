import React, { useState } from "react";

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  content: string;
  likeCount: number;
  isHidden?: boolean;
  isLiked?: boolean;
}

export const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      author: "김민수",
      rating: 5,
      date: "2024.01.15",
      content: "정말 감동적인 공연이었습니다. 배우들의 연기력이 뛰어나고 무대 연출도 훌륭했어요. 특히 2막의 클라이맥스 장면은 잊을 수 없을 것 같습니다.",
      likeCount: 24,
      isLiked: false
    },
    {
      id: 2,
      author: "박지영",
      rating: 4,
      date: "2024.01.12",
      content: "전체적으로 만족스러운 공연이었습니다. 음향과 조명이 인상적이었고, 스토리 전개도 흥미로웠어요. 다만 좌석이 조금 불편했던 점이 아쉬웠습니다.",
      likeCount: 18,
      isLiked: false
    },
    {
      id: 3,
      author: "이준호",
      rating: 5,
      date: "2024.01.10",
      content: "",
      likeCount: 31,
      isHidden: true,
      isLiked: false
    },
    {
      id: 4,
      author: "최영희",
      rating: 5,
      date: "2024.01.08",
      content: "포스트 말론의 라이브 퍼포먼스가 정말 대단했어요. 무대 위에서의 에너지가 관객들에게까지 전달되어 환상적인 분위기였습니다.",
      likeCount: 42,
      isLiked: false
    },
    {
      id: 5,
      author: "정수민",
      rating: 4,
      date: "2024.01.05",
      content: "음악은 정말 좋았지만 좌석이 조금 멀어서 아쉬웠어요. 그래도 전체적으로 만족스러운 공연이었습니다.",
      likeCount: 15,
      isLiked: false
    },
    {
      id: 6,
      author: "박현우",
      rating: 5,
      date: "2024.01.03",
      content: "기대 이상의 공연이었습니다. 포스트 말론의 목소리와 무대 연출이 완벽하게 어우러져 잊을 수 없는 경험이었어요.",
      likeCount: 28,
      isLiked: false
    },
    {
      id: 7,
      author: "김소영",
      rating: 3,
      date: "2024.01.01",
      content: "음향이 조금 아쉬웠지만 전체적으로 괜찮은 공연이었습니다. 다음에는 더 좋은 좌석에서 관람하고 싶어요.",
      likeCount: 8,
      isLiked: false
    },
    {
      id: 8,
      author: "이민수",
      rating: 5,
      date: "2023.12.30",
      content: "연말을 장식하는 최고의 공연이었습니다. 포스트 말론의 히트곡들을 라이브로 들을 수 있어서 정말 행복했어요.",
      likeCount: 35,
      isLiked: false
    },
    {
      id: 9,
      author: "최지원",
      rating: 4,
      date: "2023.12.28",
      content: "무대 연출과 조명이 정말 훌륭했어요. 포스트 말론의 카리스마 넘치는 무대 매너도 인상적이었습니다.",
      likeCount: 22,
      isLiked: false
    },
    {
      id: 10,
      author: "정다은",
      rating: 5,
      date: "2023.12.25",
      content: "크리스마스에 포스트 말론 공연을 보다니 꿈만 같았어요. 모든 것이 완벽했고 평생 기억에 남을 것 같습니다.",
      likeCount: 47,
      isLiked: false
    },
    {
      id: 11,
      author: "박준호",
      rating: 4,
      date: "2023.12.22",
      content: "좋은 공연이었지만 입장 시간이 조금 길어서 아쉬웠어요. 그래도 공연 자체는 만족스러웠습니다.",
      likeCount: 12,
      isLiked: false
    }
  ]);

  const reviewsPerPage = 10;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-base leading-6 ${
          index < rating ? "text-[#ffd700]" : "text-[#dddddd]"
        }`}
      >
        ★
      </span>
    ));
  };

  const handleLike = (reviewId: number) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              isLiked: !review.isLiked,
              likeCount: review.isLiked ? review.likeCount - 1 : review.likeCount + 1
            }
          : review
      )
    );
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 별점 평균 계산
  const calculateAverageRating = (): string => {
    const visibleReviews = reviews.filter(review => !review.isHidden);
    if (visibleReviews.length === 0) return "0.00";
    
    const totalRating = visibleReviews.reduce((sum, review) => sum + review.rating, 0);
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
                   className={`text-xl leading-6 relative ${
                     isFullStar ? "text-[#ffd700]" : "text-[#dddddd]"
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
        {currentReviews.map((review) => (
          <div
            key={review.id}
            className="w-full p-6 rounded-lg border border-[#0000001a]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-base text-[#212121] font-normal">
                  {review.author}
                </span>
                <div className="flex gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className="text-sm text-[#00000099] font-normal">
                {review.date}
              </span>
            </div>

            <div className="mb-4">
              {review.isHidden ? (
                <p className="text-base text-[#00000080] font-normal">
                  비공개 처리된 관람평입니다.
                </p>
              ) : (
                <p className="text-base text-black font-normal leading-6">
                  {review.content}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleLike(review.id)}
                  className={`flex items-center gap-2 text-sm font-normal transition-colors ${
                    review.isLiked 
                      ? "text-red-500" 
                      : "text-[#00000099] hover:text-red-500"
                  }`}
                >
                  <span className="text-lg">
                    {review.isLiked ? "❤️" : "🤍"}
                  </span>
                  <span>좋아요</span>
                  <span>{review.likeCount}</span>
                </button>
              </div>
              <button
                onClick={() => handleReport(review.id)}
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
              className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${
                currentPage === 1
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
                className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${
                  currentPage === page
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
              className={`px-3 py-2 rounded border text-sm font-normal transition-colors ${
                currentPage === totalPages
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
         <div className="fixed inset-0 flex items-center justify-center z-50">
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