import React, { useState, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import type {
    ReviewSaveRequestDto,
    PossibleReviewResponseDto,
    EventDto,
    ReviewDto,
    ReviewResponseDto,
    ReviewUpdateRequestDto
} from "../../services/types/reviewType";
import {
    saveReview,
    getPossibleSaveReview,
    getReviewsByMember,
    updateReview,
    deleteReview
} from "../../services/review";
import { useTranslation } from "react-i18next";


export const MyPageMyReview = () => {
    const { t } = useTranslation();
    /** 초기 세팅 데이터 */
    const [savedReviews, setSavedReviews] = useState<ReviewResponseDto[] | null>(null); // 작성한 리뷰
    const [writeReviewsState, setWriteReviewsState] = useState<PossibleReviewResponseDto[] | null>(null) // 리뷰 작성 가능한 이벤트 

    /** 선택 항목 */
    const [selectAll, setSelectAll] = useState(false);
    const [selectedReviews, setSelectedReviews] = useState<number[]>([]); // 선택한 리뷰들
    const [editingReview, setEditingReview] = useState<ReviewDto | null>(); // 수정하려는 리뷰 
    const [selectReservationId, setSelectReservationId] = useState<number | null>(null);

    const [selectedEvent, setSelectedEvent] = useState<EventDto | null>();// 선택한 이벤트

    /** 리뷰 내용 */
    const [rating, setRating] = useState(0); // 별점
    const [reviewText, setReviewText] = useState(""); // 리뷰 내용
    const [isPrivate, setIsPrivate] = useState(false); // 공개, 비공개 여부

    const [activeTab, setActiveTab] = useState<'write' | 'my'>('write');
    const [isEditMode, setIsEditMode] = useState(false); // 작성 또는 수정 모드 
    const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제 모달
    const [deleteType, setDeleteType] = useState<'bulk' | 'single'>('bulk');
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

    // 초기 로딩
    useEffect(() => {
        // 작성 가능한 행사 조회
        const fetchWriteReviews = async () => {
            const res = await getPossibleSaveReview(0); // currentPage를 0으로 변경
            setWriteReviewsState(res?.content ?? null);
        }

        // 작성한 리뷰 조회
        const fetchUserReviews = async () => {
            const res = await getReviewsByMember(0); // currentPage를 0으로 변경
            setSavedReviews(res?.content ?? null);
        }
        fetchWriteReviews();
        fetchUserReviews();
    }, []);


    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setSelectedReviews(savedReviews?.map(data => data.review.reviewId) ?? []);
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

    const handleBulkDelete = (event: React.MouseEvent) => {
        if (selectedReviews.length === 0) return;

        const rect = event.currentTarget.getBoundingClientRect();
        setModalPosition({ x: rect.left, y: rect.bottom + 10 });
        setDeleteType('bulk');
        setShowDeleteModal(true);
    };

    const handleSingleDelete = (reviewId: number, event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setModalPosition({ x: rect.left, y: rect.bottom + 10 });
        setDeleteType('single');
        setDeleteTargetId(reviewId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (deleteTargetId == null) {
            return;
        }

        const res = await deleteReview(deleteTargetId)

        setSavedReviews((savedReviews ?? []).filter(review => review.review.reviewId !== res.reviewId));
        console.log(res.message);
        // 모달 닫기
        setShowDeleteModal(false);
        setDeleteTargetId(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTargetId(null);
    };

    const handleEventClick = (event: EventDto, reservationId: number) => {

        if (savedReviews?.some(review => review.reservationId === reservationId)) {
            alert("이미 리뷰 작성이 완료된 행사입니다.");
            return;
        }

        setSelectedEvent(event);
        setSelectReservationId(reservationId)
        setRating(0);
        setReviewText("");
        setIsEditMode(false);
        setEditingReview(null);
        setIsPrivate(false);
    };

    // 수정 버튼 선택
    const handleEditReview = (data: ReviewResponseDto) => {
        // 수정할 리뷰 설정
        setEditingReview(data.review);

        // 수정할 리뷰의 이벤트
        const reviewEvent: EventDto = {
            title: data.event.title,
            buildingName: data.event.buildingName,
            address: data.event.address,
            thumbnail: data.event.thumbnail,
            eventScheduleInfo: data.event.eventScheduleInfo,
            viewingScheduleInfo: data.event.viewingScheduleInfo
        }

        // 이벤트 설정
        setSelectedEvent(reviewEvent);

        // 리뷰의 별점, 내용, 공개/비공개여부, 수정모드, 작성탭 설정
        setRating(data.review.star);
        setReviewText(data.review.comment);
        setIsPrivate(!data.review.visible);
        setIsEditMode(true);
        setActiveTab('write');
    };

    // 행사 목록으로 변경
    const handleBackToList = () => {
        // 선택한 이벤트, 리뷰 초기화
        setSelectedEvent(null);
        setSelectReservationId(null)
        // 별점, 내용, 수정모드, 수정리뷰, 공개/비공개 여부 초기화
        setRating(0);
        setReviewText("");
        setIsEditMode(false);
        setEditingReview(null);
        setIsPrivate(false);

        // 수정 모드였다면 내 관람평 탭으로 이동
        if (isEditMode) {
            setActiveTab('my');
            // 스크롤을 맨 위로 올림
            window.scrollTo(0, 0);
        } else {
            // 새로 작성한 관람평의 경우 내 관람평 탭으로 이동
            setActiveTab('my');
            // 스크롤을 맨 위로 올림
            window.scrollTo(0, 0);
        }
    };

    // 리뷰 저장 및 제출 
    const handleSubmitReview = async () => {
        // 입력 검증
        if (rating === 0) {
            toast.error("별점을 선택해주세요.");
            return;
        }

        if (!reviewText.trim()) {
            toast.error("관람평 내용을 입력해주세요.");
            return;
        }

        try {
            // 수정 모드 O 수정하려고 선택한 리뷰 정보
            if (isEditMode && editingReview) {

                if (!savedReviews?.some(data => data.review.reviewId === editingReview.reviewId)) {
                    toast.error("해당 리뷰는 저장되지 않은 리뷰입니다.");
                    return;
                }
                // 수정 모드: 기존 리뷰 업데이트
                const reviewUpdateRequestDto: ReviewUpdateRequestDto = {
                    star: rating,
                    comment: reviewText,
                    visible: !isPrivate
                }

                const res = await updateReview(editingReview.reviewId, reviewUpdateRequestDto);

                setSavedReviews(prev =>
                    (prev ?? []).map(data =>
                        data.review.reviewId === editingReview.reviewId
                            ? { ...data, review: { ...data.review, ...res } }
                            : data
                    )
                );
                toast.success("관람평이 수정되었습니다.");
            } else {
                // 리뷰 저장
                if (selectReservationId == null) {
                    toast.error("예약 정보를 찾을 수 없습니다.");
                    return;
                }

                if (selectedEvent == null) {
                    toast.error("이벤트 정보를 찾을 수 없습니다.");
                    return;
                }

                const saveReviewRequest: ReviewSaveRequestDto = {
                    reservationId: selectReservationId,
                    star: rating,
                    visible: !isPrivate,
                    comment: reviewText
                };
                const res = await saveReview(saveReviewRequest);

                const reviewDto: ReviewDto = {
                    reviewId: res.reviewId,
                    userId: null,
                    nickname: res.nickname,
                    star: res.star,
                    reactions: 0,
                    comment: res.comment,
                    visible: res.visible,
                    createdAt: (() => {
                        // createdAt이 문자열로 오고 있으므로 문자열로 처리
                        const createdAtStr = res.createdAt as unknown as string;
                        if (createdAtStr && typeof createdAtStr === 'string') {
                            // YYYY-MM-DD 형식으로 변환
                            return createdAtStr.slice(0, 10).replace(/-/g, '. ');
                        }
                        // 기본값
                        return new Date().toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).replace(/\. /g, '.').replace('.', '');
                    })()
                }
                const reviewResponse: ReviewResponseDto = {
                    reservationId: selectReservationId,
                    event: selectedEvent,
                    review: reviewDto,
                    owner: true
                }
                setSavedReviews(prev => {
                    const currentReviews = prev ?? [];
                    return [reviewResponse, ...currentReviews];
                });

                // 작성 가능한 행사 목록에서 해당 행사를 제거하거나 hasReview를 true로 업데이트
                setWriteReviewsState(prev =>
                    prev ? prev.filter(item => item.reservationId !== selectReservationId) : null
                );

                toast.success("관람평이 등록되었습니다.");
            }

            // 제출 후 리스트로 돌아가기
            handleBackToList();
        } catch (error: unknown) {
            console.error("관람평 저장/수정 실패:", error);

            // 더 자세한 에러 정보 로깅
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as any;
                console.error("HTTP 상태:", axiosError.response?.status);
                console.error("응답 데이터:", axiosError.response?.data);
                console.error("응답 헤더:", axiosError.response?.headers);
            }

            // 실제 에러가 발생한 경우 에러 메시지 표시
            toast.error("관람평 저장에 실패했습니다. 다시 시도해주세요.");

            // 에러 발생 시 UI 업데이트하지 않음
            return;
        }
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

    const formattedDate = (createdAt: string) => {
        const formatted = createdAt.slice(0, 10).replace(/-/g, ". ");
        return formatted;
    }

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
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

                <TopNav />

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />

                {/* Write Review Content */}
                {activeTab === 'write' && (
                    <div className="absolute top-[263px] left-64 right-0 pb-20">
                        {!selectedEvent ? (
                            // 행사 리스트 표시
                            <div className="flex flex-col gap-8">
                                {writeReviewsState?.map((item) => (
                                    <div
                                        key={item.reservationId}
                                        className="flex gap-6 cursor-pointer p-4 rounded-lg"
                                        onClick={() => handleEventClick(item.event, item.reservationId)}
                                    >
                                        <img
                                            src={item.event.thumbnail}
                                            alt="preview"
                                            className="w-[158px] h-[190px] object-cover"
                                        />
                                        <div className="flex flex-col gap-2 relative">
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-semibold">{item.event.title}</p>
                                                {/* 상태 배지 */}
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.hasReview
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                    }`}>
                                                    {item.hasReview ? (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            작성 완료
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            작성 전
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">일시</div>
                                                <div className="text-sm text-[#000000b2]">{item.event.eventScheduleInfo.startDate}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">장소</div>
                                                <div className="text-sm text-[#000000b2]">{item.event.buildingName !== null ? item.event.buildingName : item.event.address}</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">관람일</div>
                                                <div className="text-sm text-[#000000b2]">
                                                    {item.event.viewingScheduleInfo.date} ({item.event.viewingScheduleInfo.dayOfWeek}) {item.event.viewingScheduleInfo.startTime}
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-sm text-black font-semibold w-12">티켓</div>
                                                <div className="text-sm text-[#000000b2]">{item.ticketContent}</div>
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
                                    className="mb-6 text-sm text-[#00000099] hover:text-black flex items-center gap-2 bg-transparent border-none p-0 focus:outline-none"
                                >
                                    ← 행사 목록으로 돌아가기
                                </button>

                                {/* 행사 정보 */}
                                <div className="flex gap-6 mb-8">
                                    <img
                                        className="w-[158px] h-[190px] object-cover"
                                        alt="Event"
                                        src={selectedEvent.thumbnail}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <p className="text-lg font-semibold">{selectedEvent.title}</p>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">일시</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.eventScheduleInfo.startDate} ~ {selectedEvent.eventScheduleInfo.endDate}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">장소</div>
                                            <div className="text-sm text-[#000000b2]">{selectedEvent.buildingName !== null ? selectedEvent.buildingName : selectedEvent.address}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-sm text-black font-semibold w-12">관람일</div>
                                            <div className="text-sm text-[#000000b2]">
                                                {selectedEvent.viewingScheduleInfo.date} ({selectedEvent.viewingScheduleInfo.dayOfWeek}) {selectedEvent.viewingScheduleInfo.startTime}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 별점 평가 */}
                                <div className="mb-8">
                                    <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-lg leading-[27px] tracking-[0] mb-[37px]">
                                        별점 평가
                                    </h3>

                                    <div className="flex items-center gap-[30px]">
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => {
                                                        if (star === rating) {
                                                            setRating(star - 1);
                                                        } else {
                                                            setRating(star);
                                                        }

                                                    }}
                                                    className="w-[27px] h-[26px] p-0 bg-transparent border-none focus:outline-none"
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
                                        placeholder="관람 후기를 작성해주세요"
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

                                {/* 비공개 설정 */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="private"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                        <label htmlFor="private" className="[font-family:'Roboto-Regular',Helvetica] font-normal text-black text-sm leading-[21px] tracking-[0]">
                                            비공개로 설정
                                        </label>
                                    </div>
                                    <p className="mt-2 [font-family:'Roboto-Regular',Helvetica] font-normal text-[#00000080] text-xs leading-[18px] tracking-[0]">
                                        비공개로 설정하면 다른 사용자에게 관람평이 보이지 않습니다.
                                    </p>
                                </div>

                                {/* 관람평 작성 안내 */}
                                <div className="bg-neutral-100 rounded-lg border-0 mb-8 p-[14px]">
                                    <h4 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-base leading-6 tracking-[0] mb-[26px]">
                                        관람평 작성 안내
                                    </h4>

                                    <ul className="space-y-2">
                                        <li className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 관람평은 실제 관람 후기를 바탕으로 작성해주세요.
                                        </li>
                                        <li className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 욕설, 비방, 광고성 내용은 삭제될 수 있습니다.
                                        </li>
                                        <li className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 작성된 관람평은 다른 이용자들에게 공개됩니다.
                                        </li>
                                        <li className="[font-family:'Roboto-Regular',Helvetica] font-normal text-[#000000b2] text-sm leading-[21px] tracking-[0]">
                                            • 허위 정보나 부적절한 내용이 포함된 경우 제재를 받을 수 있습니다.
                                        </li>
                                    </ul>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={handleBackToList}
                                        className="px-6 py-2 border border-gray-300 rounded-[10px] text-gray-600 bg-white hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        취소
                                    </button>

                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={rating === 0 || reviewText.length < 20}
                                        className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${rating > 0 && reviewText.length >= 20
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-400 text-white cursor-not-allowed'
                                            }`}
                                    >
                                        {isEditMode ? '수정' : '등록'}
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
                        <div className="absolute w-[947px] h-[51px] top-[263px] left-64 bg-neutral-100 rounded-lg flex items-center justify-between px-3.5">
                            <div className="flex items-center">
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

                            {/* 일괄 삭제 버튼 */}
                            {selectedReviews.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors [font-family:'Roboto-Medium',Helvetica] font-medium"
                                >
                                    선택 삭제 ({selectedReviews.length}개)
                                </button>
                            )}
                        </div>

                        {/* Review Cards */}
                        <div className="absolute top-[334px] left-64 space-y-4 pb-20">
                            {savedReviews?.map((data) => (
                                <div key={data.review.reviewId} className="w-[947px] rounded-lg border border-[#0000001f] bg-white p-5 relative">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedReviews.includes(data.review.reviewId)}
                                        onChange={(e) => handleSelectReview(data.review.reviewId, e.target.checked)}
                                        className="absolute top-[21px] left-[19px] w-[17px] h-[18px] bg-white border border-[#666666]"
                                    />

                                    {/* Action Buttons */}
                                    <div className="absolute top-[21px] right-[19px] flex gap-1">
                                        <button
                                            onClick={() => handleEditReview(data)}
                                            className="w-10 h-7 text-xs font-medium border border-[#0000001f] bg-white rounded flex items-center justify-center hover:bg-gray-50 whitespace-nowrap focus:outline-none"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={(e) => handleSingleDelete(data.review.reviewId, e)}
                                            className="w-10 h-7 text-xs font-medium bg-[#ff3838] text-white border border-[#ff3838] rounded flex items-center justify-center hover:bg-[#e62e2e] whitespace-nowrap focus:outline-none"
                                        >
                                            삭제
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="ml-[31px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="[font-family:'Roboto-SemiBold',Helvetica] font-semibold text-black text-base leading-6">
                                                {data.event.title}
                                            </h3>
                                            {/* 공개/비공개 배지 */}
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${data.review.visible
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                }`}>
                                                {data.review.visible ? (
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                        공개
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                                        </svg>
                                                        비공개
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mb-4">
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#000000b2] text-sm leading-[21px]">
                                                {data.event.viewingScheduleInfo.date} ({data.event.viewingScheduleInfo.dayOfWeek}) {data.event.viewingScheduleInfo.startTime}
                                            </span>
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#000000b2] text-sm leading-[21px]">
                                                {data.event.buildingName}
                                            </span>
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex items-center gap-1 mb-4">
                                            {renderStars(data.review.star)}
                                            {/* <span className="ml-2 [font-family:'Roboto-Regular',Helvetica] text-[#00000099] text-sm">
                                                {data.review.createdAt}
                                            </span> */}
                                        </div>

                                        {/* Review Content */}
                                        <p className="[font-family:'Roboto-Regular',Helvetica] text-black text-sm leading-[21px] mb-4 max-w-[888px]">
                                            {data.review.comment}
                                        </p>

                                        {/* Like Count and Date */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 fill-red-500 text-red-500" viewBox="0 0 24 24">
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                                <span className="[font-family:'Roboto-Regular',Helvetica] text-[#00000099] text-sm">
                                                    좋아요 {data.review.reactions}개
                                                </span>
                                            </div>
                                            <span className="[font-family:'Roboto-Regular',Helvetica] text-[#00000080] text-xs">
                                                작성일: {formattedDate(data.review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 삭제 확인 모달 */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50">
                        <div
                            className="bg-white rounded-lg border border-[#0000001f] p-6 w-[400px] shadow-lg absolute"
                            style={{
                                left: `${modalPosition.x}px`,
                                top: `${modalPosition.y}px`,
                                transform: 'translateX(-50%)'
                            }}
                        >
                            <h3 className="text-lg font-semibold mb-4">
                                {deleteType === 'bulk' ? '일괄 삭제 확인' : '삭제 확인'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {deleteType === 'bulk'
                                    ? `선택된 ${selectedReviews.length}개의 관람평을 삭제하시겠습니까?`
                                    : '이 관람평을 삭제하시겠습니까?'
                                }
                                <br />
                                <span className="text-red-500 font-medium">삭제된 관람평은 복구할 수 없습니다.</span>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 