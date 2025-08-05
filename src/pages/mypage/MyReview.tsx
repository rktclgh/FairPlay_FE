import React, { useState } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { Star } from "lucide-react";

const reviewsData = [
    {
        id: 1,
        title: "2025 AI & 로봇 박람회",
        date: "2025.01.16 (목) 14:00",
        location: "코엑스 전시장 A홀",
        rating: 5,
        reviewDate: "2025.01.17",
        content: "정말 유익하고 재미있는 박람회였습니다. 최신 AI 기술과 로봇들을 직접 체험해볼 수 있어서 좋았고, 전시 구성도 체계적이었습니다. 특히 휴머노이드 로봇 시연이 인상적이었어요. 다음에도 꼭 참석하고 싶습니다.",
        likes: 12,
        isPublic: true,
        createdAt: "2025.01.17"
    },
    {
        id: 2,
        title: "2024 스마트시티 엑스포",
        date: "2024.12.10 (화) 10:00",
        location: "킨텍스 제1전시장",
        rating: 4,
        reviewDate: "2024.12.11",
        content: "스마트시티 관련 다양한 기술들을 한 번에 볼 수 있어서 좋았습니다. 다만 관람객이 너무 많아서 조금 복잡했어요.",
        likes: 8,
        isPublic: true,
        createdAt: "2024.12.11"
    },
    {
        id: 3,
        title: "2024 푸드테크 페어",
        date: "2024.11.20 (수) 13:00",
        location: "삼성동 코엑스",
        rating: 3,
        reviewDate: "2024.11.21",
        content: "음식 관련 기술들이 흥미로웠지만 체험 기회가 부족했습니다.",
        likes: 3,
        isPublic: false,
        createdAt: "2024.11.21"
    }
];

const writeReviews = [
    {
        id: 1,
        title: "2025 AI & 로봇 박람회",
        dateRange: "2025.01.15 (수) ~ 2025.01.17 (금)",
        viewDate: "2025.01.16 (목) 14:00",
        location: "코엑스 전시장 A홀",
        ticket: "일반 관람권 1매",
        image: "/images/NoImage.png"
    },
    {
        id: 2,
        title: "2025 AI & 로봇 박람회",
        dateRange: "2025.01.15 (수) ~ 2025.01.17 (금)",
        viewDate: "2025.01.16 (목) 14:00",
        location: "코엑스 전시장 A홀",
        ticket: "일반 관람권 1매",
        image: "/images/NoImage.png"
    },
    {
        id: 3,
        title: "2025 AI & 로봇 박람회",
        dateRange: "2025.01.15 (수) ~ 2025.01.17 (금)",
        viewDate: "2025.01.16 (목) 14:00",
        location: "코엑스 전시장 A홀",
        ticket: "일반 관람권 1매",
        image: "/images/NoImage.png"
    },
];

export const MyPageMyReview = () => {
    const [activeTab, setActiveTab] = useState<'write' | 'my'>('write');
    const [selectedReviews, setSelectedReviews] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [reviews, setReviews] = useState(reviewsData);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState("");

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedReviews(reviewsData.map(review => review.id));
        } else {
            setSelectedReviews([]);
        }
    };

    const handleSelectReview = (reviewId: number, checked: boolean) => {
        if (checked) {
            setSelectedReviews([...selectedReviews, reviewId]);
        } else {
            setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
            setSelectAll(false);
        }
    };

    const handleEventClick = (event: any) => {
        setSelectedEvent(event);
        setRating(0);
        setReviewText("");
    };

    const handleBackToList = () => {
        setSelectedEvent(null);
        setRating(0);
        setReviewText("");
    };

    const handleSubmitReview = () => {
        // 여기에 리뷰 제출 로직 추가
        console.log("리뷰 제출:", {
            event: selectedEvent,
            rating,
            reviewText
        });
        // 제출 후 리스트로 돌아가기
        handleBackToList();
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <svg
                key={index}
                className={`w-4 h-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                viewBox="0 0 24 24"
            >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ));
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] h-[1351px] relative">
                <div className="absolute w-[947px] h-[107px] top-[137px] left-64">
                    <div className="absolute top-0 left-0 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl leading-[54px] tracking-[0] whitespace-nowrap">
                        관람평
                    </div>

                    <div className="absolute w-[947px] h-[55px] top-[52px] left-0">
                        <div className="w-[947px] top-[13px] border-b border-[#0000001a] absolute h-[42px] left-0 [border-bottom-style:solid]" />

                        <div
                            onClick={() => setActiveTab('write')}
                            className={`absolute top-0 left-[137px] w-[200px] h-[54px] flex justify-center items-center text-base cursor-pointer hover:text-gray-700 z-10 focus:outline-none ${activeTab === 'write'
                                ? "[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black"
                                : "[font-family:'Roboto-Regular',Helvetica] font-normal text-black"
                                }`}
                        >
                            관람평 쓰기
                        </div>

                        <div
                            className={`w-[474px] top-3 absolute h-[42px] left-0 border-b ${activeTab === 'write' ? 'border-b-2 border-black' : 'border-[#0000001a]'
                                } z-0`}
                        />

                        <div
                            onClick={() => setActiveTab('my')}
                            className={`absolute top-0 left-[611px] w-[200px] h-[54px] flex justify-center items-center text-base cursor-pointer hover:text-gray-700 z-10 focus:outline-none ${activeTab === 'my'
                                ? "[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black"
                                : "[font-family:'Roboto-Regular',Helvetica] font-normal text-black"
                                }`}
                        >
                            내 관람평
                        </div>

                        <div
                            className={`w-[474px] top-3 absolute h-[42px] left-[474px] border-b ${activeTab === 'my' ? 'border-b-2 border-black' : 'border-[#0000001a]'
                                } z-0`}
                        />
                    </div>
                </div>

                <TopNav className="!absolute !left-0 !top-0" />

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

                {/* Write Review Content */}
                {activeTab === 'write' && (
                    <div className="absolute top-[263px] left-64 right-0">
                        {!selectedEvent ? (
                            // 행사 리스트 표시
                            <div className="flex flex-col gap-8">
                                {writeReviews.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-6 cursor-pointer p-4 rounded-lg"
                                        onClick={() => handleEventClick(item)}
                                    >
                                        <img
                                            src={item.image}
                                            alt="preview"
                                            className="w-[158px] h-[190px] object-cover"
                                        />
                                        <div className="flex flex-col gap-2">
                                            <p className="text-lg font-semibold">{item.title}</p>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">일시</div>
                                                <div className="text-sm text-[#000000b2]">{item.dateRange}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">장소</div>
                                                <div className="text-sm text-[#000000b2]">{item.location}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">관람일</div>
                                                <div className="text-sm text-[#000000b2]">{item.viewDate}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">티켓</div>
                                                <div className="text-sm text-[#000000b2]">{item.ticket}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // 관람평 작성 폼
                            <div className="w-full pb-8">
                                {/* 뒤로가기 버튼 */}
                                <button
                                    onClick={handleBackToList}
                                    className="mb-6 text-sm text-[#00000099] hover:text-black flex items-center gap-2"
                                >
                                    ← 행사 목록으로 돌아가기
                                </button>

                                {/* 행사 정보 */}
                                <div className="flex gap-6 mb-8">
                                    <img
                                        className="w-[158px] h-[190px] object-cover"
                                        alt="Event"
                                        src={selectedEvent.image}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <p className="text-lg font-semibold">{selectedEvent.title}</p>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">일시</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.dateRange}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">장소</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.location}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">관람일</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.viewDate}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">티켓</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.ticket}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 별점 평가 */}
                                <div className="mb-8">
                                    <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-lg leading-[27px] tracking-[0] mb-[37px]">
                                        별점 평가
                                    </h3>

                                    <div className="flex items-center gap-[30px]">
                                        <div className="flex gap-[30px]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setRating(star)}
                                                    className="w-[27px] h-[26px] p-0"
                                                >
                                                    <Star
                                                        className={`w-[25px] h-[23px] ${star <= rating
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#00000099] text-base leading-6 tracking-[0]">
                                            별점을 선택해주세요
                                        </span>
                                    </div>
                                </div>

                                {/* 관람평 작성 */}
                                <div className="mb-8">
                                    <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-lg leading-[27px] tracking-[0] mb-[37px]">
                                        관람평 작성
                                    </h3>

                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        className="w-full h-[166px] rounded-lg border border-[#0000001f] resize-none p-4"
                                        placeholder="관람 후기를 작성해주세요..."
                                    />

                                    <div className="flex justify-between mt-[11px]">
                                        <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#00000080] text-sm leading-[21px] tracking-[0]">
                                            최소 20자 이상 입력해주세요
                                        </span>
                                        <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#00000080] text-sm leading-[21px] tracking-[0]">
                                            {reviewText.length}/1000
                                        </span>
                                    </div>
                                </div>

                                {/* 관람평 작성 안내 */}
                                <div className="bg-neutral-100 rounded-lg border-0 mb-8 p-[14px]">
                                    <h4 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-base leading-6 tracking-[0] mb-[26px]">
                                        관람평 작성 안내
                                    </h4>

                                    <div className="space-y-[21px]">
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 관람평은 실제 관람 후기를 바탕으로 작성해주세요.
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 욕설, 비방, 광고성 내용은 삭제될 수 있습니다.
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 작성된 관람평은 다른 이용자들에게 공개됩니다.
                                        </div>
                                        <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 허위 정보나 부적절한 내용이 포함된 경우 제재를 받을 수 있습니다.
                                        </div>
                                    </div>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex gap-[20px] justify-center">
                                    <button
                                        onClick={handleBackToList}
                                        className="w-[82px] h-[42px] rounded-lg border border-[#0000001f] bg-white hover:bg-gray-50"
                                    >
                                        <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-[#00000099] text-base text-center leading-6 tracking-[0]">
                                            취소
                                        </span>
                                    </button>

                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={rating === 0 || reviewText.length < 20}
                                        className={`w-[82px] h-[42px] rounded-lg border border-[#0000001f] ${rating > 0 && reviewText.length >= 20
                                            ? "bg-black hover:bg-gray-800"
                                            : "bg-[#d9d9d9]"
                                            }`}
                                    >
                                        <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-white text-base text-center leading-6 tracking-[0]">
                                            등록
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* My Review Content */}
                {activeTab === 'my' && (
                    <>
                        {/* Select All Section */}
                        <div className="absolute w-[947px] h-[51px] top-[263px] left-64 bg-neutral-100 rounded-lg flex items-center px-3.5">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="w-[18px] h-[18px] bg-white border border-[#666666]"
                            />
                            <span className="ml-2.5 text-black text-sm leading-[21px] [font-family:'Roboto-Regular',Helvetica] font-normal">
                                전체 선택
                            </span>
                            <span className="ml-6 [font-family:'Roboto-Regular',Helvetica] font-normal text-[#00000099] text-sm">
                                {selectedReviews.length}개 선택됨
                            </span>
                        </div>

                        {/* Review Cards */}
                        <div className="absolute top-[334px] left-64 space-y-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="w-[947px] rounded-lg border border-[#0000001f] bg-white p-5 relative">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedReviews.includes(review.id)}
                                        onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                                        className="absolute top-[21px] left-[19px] w-[17px] h-[18px] bg-white border border-[#666666]"
                                    />

                                    {/* Action Buttons */}
                                    <div className="absolute top-[21px] right-[47px] flex gap-1">
                                        <button className="w-10 h-7 text-xs font-medium border border-[#0000001f] bg-white rounded flex items-center justify-center hover:bg-gray-50 whitespace-nowrap focus:outline-none">
                                            수정
                                        </button>
                                        <button className="w-10 h-7 text-xs font-medium bg-[#ff3838] text-white border border-[#ff3838] rounded flex items-center justify-center hover:bg-[#e62e2e] whitespace-nowrap focus:outline-none">
                                            삭제
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="ml-[31px]">
                                        <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-base leading-6 mb-1">
                                            {review.title}
                                        </h3>
                                        <div className="flex gap-4 mb-4">
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#000000b2] text-sm leading-[21px]">
                                                {review.date}
                                            </span>
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#000000b2] text-sm leading-[21px]">
                                                {review.location}
                                            </span>
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex items-center gap-1 mb-4">
                                            {renderStars(review.rating)}
                                            <span className="ml-2 [font-family:'Roboto-Regular',Helvetica] text-[#00000099] text-sm">
                                                {review.reviewDate}
                                            </span>
                                        </div>

                                        {/* Review Content */}
                                        <p className="[font-family:'Roboto-Regular',Helvetica] text-black text-sm leading-[21px] mb-4 max-w-[888px]">
                                            {review.content}
                                        </p>

                                        {/* Like Count and Date */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 fill-red-500 text-red-500" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                                <span className="[font-family:'Roboto-Regular',Helvetica] text-[#00000099] text-sm">
                                                    좋아요 {review.likes}개
                                                </span>
                                            </div>
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#00000080] text-xs">
                                                작성일: {review.createdAt}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 