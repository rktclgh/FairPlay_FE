import React, { useState, useEffect } from "react";
import { TopNav } from "../../components/TopNav";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
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
    const { eventName } = location.state || {};
    const [participants, setParticipants] = useState<AttendeeInfoResponseDto[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<AttendeeInfoResponseDto | null>(null);

    useEffect(() => {

        const fetchParticipant = async () => {
            const res = await getAttendeesReservation(Number(reservationId));
            setParticipants(res.attendees);
        }
        fetchParticipant();
    }, []);

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

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    참여자 목록
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                                    <TopNav />

                <div className="absolute top-[239px] left-64 right-0">
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
                                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-[10px] transition-colors"
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
                                </div>
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