import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit2, Phone, Mail } from "lucide-react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import {
    getAttendeesReservation,
    updateAttendee
} from "../../services/attendee";
import type {
    AttendeeUpdateRequestDto,
    AttendeeInfoResponseDto
} from "../../services/types/attendeeType";
import EditParticipantModal from "../../components/EditParticipantModal";


export default function ParticipantList(): JSX.Element {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventName, reservationId, reservationDate, scheduleDate, startTime } = location.state || {};
    const [participants, setParticipants] = useState<AttendeeInfoResponseDto[]>([]);
    const [isPossibleEdit, setIsPossibleEdit] = useState<boolean>(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [possibleDate, setPossibleDate] = useState("");
    const [selectedParticipant, setSelectedParticipant] = useState<AttendeeInfoResponseDto | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchParticipant = async () => {

            if (!isOneDayBeforeEvent(scheduleDate)) {
                setIsPossibleEdit(false);
            }
            const res = await getAttendeesReservation(Number(reservationId));
            setParticipants(res.attendees);
            console.log("setParticipants 완료");
            console.log("reservationDate:" + reservationDate);
            console.log("scheduleDate:" + scheduleDate);
        }
        fetchParticipant();
    }, []);


    const isOneDayBeforeEvent = (dateStr: string | null) => {
        if (!dateStr) return false;

        const nowTime = new Date(); // 현재 날짜와 시간
        // 행사 시작 시각 (scheduleDate + startTime)
        const eventStart = new Date(`${scheduleDate}T${startTime}`);

        const eventDate = new Date(dateStr);
        eventDate.setHours(0, 0, 0, 0); // 시분초 초기화

        const reservationDateObj = new Date(reservationDate);
        reservationDateObj.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneDayBefore = new Date(eventDate);
        oneDayBefore.setDate(eventDate.getDate() - 1);

        const twoDaysBefore = new Date(eventDate);
        twoDaysBefore.setDate(eventDate.getDate() - 2);

        // 1. 예약날짜가 행사 하루 전인 경우 → 행사 하루 전까지 수정 가능
        if (reservationDateObj.getTime() === oneDayBefore.getTime()) {
            setPossibleDate(oneDayBefore.toLocaleDateString("ko-KR",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                })
            );
            console.log("reservationDate" + reservationDate + " oneDayBefore: " + oneDayBefore);
            return true;
        }

        // 2. 예약날짜가 행사 당일일 경우 -> 행사 당일 + 시작시간까지 수정 가능
        if ((reservationDateObj.getTime() === eventDate.getTime()) && (nowTime.getTime() < eventStart.getTime())) {
            setPossibleDate(today.toLocaleDateString("ko-KR",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                })
            );
            return true;
        }

        // 3. 그 외 → 행사 이틀 전까지만 가능
        if (reservationDateObj.getTime() <= twoDaysBefore.getTime()) {
            setPossibleDate(twoDaysBefore.toLocaleDateString("ko-KR",
                {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                })
            );
            console.log("reservationDate" + reservationDate + " twoDaysBefore: " + twoDaysBefore);

            return true;
        }
        return false;
    };

    const handleBack = () => {
        navigate('/mypage/tickets');
    };

    const handleEdit = (participant: AttendeeInfoResponseDto) => {
        setSelectedParticipant(participant);
        setIsEditModalOpen(true);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        setSelectedParticipant(null);
    };

    const handleEditSave = async (updatedParticipant: AttendeeInfoResponseDto) => {
        // 참여자 목록에서 해당 참여자 업데이트
        const updatedParticipants = participants.map(p =>
            p.attendeeId === updatedParticipant.attendeeId ? updatedParticipant : p
        );
        setParticipants(updatedParticipants);

        const data: AttendeeUpdateRequestDto = {
            reservationId: updatedParticipant.reservationId,
            name: updatedParticipant.name,
            email: updatedParticipant.email,
            phone: updatedParticipant.phone
        }

        const res = await updateAttendee(Number(updatedParticipant.attendeeId), data);

        setParticipants(prev =>
            prev.map(p =>
                p.attendeeId === updatedParticipant.attendeeId ? updatedParticipant : p
            )
        );
        alert("참여자 정보가 수정되었습니다.");
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "날짜 미정";
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0); // 시분초 초기화

        const oneDayBeforeEvent = new Date(date);
        oneDayBeforeEvent.setDate(date.getDate() - 1);

        return oneDayBeforeEvent.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-full md:w-[1256px] min-h-screen relative">
                {/* 모바일 햄버거 버튼 - 상단바 좌측 아래에 위치 */}
                <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="md:hidden fixed top-20 left-4 z-50 p-3 bg-transparent"
                >
                    {isMobileSidebarOpen ? (
                        <HiOutlineX className="w-6 h-6 text-gray-600" />
                    ) : (
                        <HiOutlineMenu className="w-6 h-6 text-gray-600" />
                    )}
                </button>

                {/* 모바일 사이드바 오버레이 */}
                {isMobileSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                {/* 모바일 사이드바 */}
                <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}>
                    <div className="p-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2"
                        >
                            <HiOutlineX className="w-6 h-6 text-gray-600" />
                        </button>
                        <AttendeeSideNav className="!relative !top-0 !left-0" />
                    </div>
                </div>

                {/* 데스크톱 사이드바 - 웹화면에서 절대적으로 고정 */}
                <div className="hidden md:block">
                    <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                </div>

                <TopNav />



                {/* 웹 콘텐츠 - 웹화면에서 원래 위치로 유지 */}
                <div className="hidden md:block absolute top-[239px] left-64 right-0">
                    <div className="w-[921px] bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_0px_0px_transparent,0px_2px_8px_#0000001a] p-8">
                        {/* 헤더 */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-gray-100 rounded-[10px] transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <div>
                                    <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-xl tracking-[0] leading-[30px]">
                                        참여자 목록
                                    </h2>
                                    <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-sm mt-1">
                                        {eventName}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                총 <span className="font-semibold text-gray-900">{participants.length}</span>명의 참여자
                            </div>
                        </div>

                        {/* 내용 */}
                        <div className="overflow-y-auto">
                            {participants.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-lg mb-2">등록된 참여자가 없습니다</div>
                                    <div className="text-gray-500 text-sm">참여자 정보 입력을 통해 참여자를 등록해주세요.</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                                    번호
                                                </th>
                                                <th className="text-left py-3 px-4 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                                    이름
                                                </th>
                                                <th className="text-left py-3 px-4 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                                    휴대폰 번호
                                                </th>
                                                <th className="text-left py-3 px-4 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                                    이메일
                                                </th>
                                                <th className="text-center py-3 px-4 [font-family:'Roboto-SemiBold',Helvetica] font-semibold text-gray-700 text-sm">
                                                    수정
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {participants.map((participant, index) => (
                                                <tr key={participant.attendeeId} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 px-4 [font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-sm">
                                                        {participant.name}
                                                        {index == 0 && (
                                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                계정 주인
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                        {participant.phone}
                                                    </td>
                                                    <td className="py-3 px-4 [font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                        {participant.email}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {!(index == 0) && (
                                                            <button
                                                                onClick={() => handleEdit(participant)}
                                                                disabled={!isPossibleEdit}
                                                                className={`p-2 rounded-[10px] transition-colors
                                                                    ${isPossibleEdit
                                                                        ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                                        : "text-gray-300 cursor-not-allowed"
                                                                    }`}
                                                                title="수정"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-sm mt-1 text-right">
                                        <span className="font-semibold text-gray-900">{possibleDate}</span>까지 수정 가능
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 모바일 콘텐츠 - 모바일에서 맨 왼쪽으로 이동 */}
                <div className="md:hidden block w-full px-4 py-4 mt-20">
                    <div className="bg-white rounded-[10px] border border-solid border-[#0000001f] shadow-[0px_2px_8px_#0000001a] p-4">
                        {/* 모바일 헤더 */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleBack}
                                    className="p-2 hover:bg-gray-100 rounded-[10px] transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                                </button>
                                <div>
                                    <h2 className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-lg tracking-[0] leading-[26px]">
                                        참여자 목록
                                    </h2>
                                    <p className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-sm mt-1">
                                        {eventName}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                총 <span className="font-semibold text-gray-900">{participants.length}</span>명
                            </div>
                        </div>

                        {/* 모바일 내용 */}
                        <div className="space-y-4">
                            {participants.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-base mb-2">등록된 참여자가 없습니다</div>
                                    <div className="text-gray-500 text-sm">참여자 정보 입력을 통해 참여자를 등록해주세요.</div>
                                </div>
                            ) : (
                                <>
                                    {participants.map((participant, index) => (
                                        <div key={participant.attendeeId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="[font-family:'Roboto-Medium',Helvetica] font-medium text-gray-900 text-base">
                                                            {participant.name}
                                                        </span>
                                                        {index == 0 && (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                계정 주인
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!(index == 0) && (
                                                    <button
                                                        onClick={() => handleEdit(participant)}
                                                        disabled={!isPossibleEdit}
                                                        className={`p-2 rounded-[8px] transition-colors
                                                            ${isPossibleEdit
                                                                ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                                : "text-gray-300 cursor-not-allowed"
                                                            }`}
                                                        title="수정"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                        {participant.phone}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-700 text-sm">
                                                        {participant.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="[font-family:'Roboto-Regular',Helvetica] font-normal text-gray-600 text-sm mt-4 text-center">
                                        <span className="font-semibold text-gray-900">{possibleDate}</span>까지 수정 가능
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <EditParticipantModal
                isOpen={isEditModalOpen}
                onClose={handleEditClose}
                participant={selectedParticipant}
                onSave={handleEditSave}
            />
        </div>
    );
} 