import React, { useState, useRef, useEffect } from "react";
import { AttendeeSideNav } from "./AttendeeSideNav";
import { TopNav } from "../../components/TopNav";

export const MyPageAccount = () => {
    const [selectedBank, setSelectedBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const banks = [
        "KB국민은행",
        "신한은행",
        "우리은행",
        "하나은행",
        "NH농협은행",
        "기업은행",
        "SC제일은행",
        "케이뱅크",
        "카카오뱅크",
        "토스뱅크",
        "새마을금고",
        "신협",
        "수협은행",
        "부산은행",
        "대구은행",
        "광주은행",
        "제주은행",
        "전북은행",
        "경남은행"
    ];

    const handleSave = () => {
        // 저장 로직 구현
        console.log("계좌 정보 저장:", {
            bank: selectedBank,
            accountNumber,
            accountHolder
        });
        alert("계좌 정보가 저장되었습니다.");
    };

    const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 숫자만 허용
        const numericValue = value.replace(/[^0-9]/g, '');
        setAccountNumber(numericValue);
    };

    const handleDropdownClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleBankSelect = (bank: string) => {
        setSelectedBank(bank);
        setIsDropdownOpen(false);
    };

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="bg-white w-[1256px] min-h-screen relative">
                <div className="top-[137px] left-64 [font-family:'Roboto-Bold',Helvetica] font-bold text-black text-2xl absolute tracking-[0] leading-[54px] whitespace-nowrap">
                    환불 계좌 정보
                </div>

                <AttendeeSideNav className="!absolute !left-0 !top-[117px]" />
                                    <TopNav />

                {/* Main form */}
                <div className="absolute w-[509px] h-[250px] top-[239px] left-64">
                    {/* Bank selection */}
                    <div className="mb-2.5">
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                            은행명
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 pr-12 font-normal text-base bg-transparent outline-none text-left cursor-pointer flex items-center ${selectedBank ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                                onClick={handleDropdownClick}
                            >
                                {selectedBank || "선택하세요"}
                            </div>
                            <div
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
                                onClick={handleDropdownClick}
                            >
                                <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ borderTopColor: 'black' }}></div>
                            </div>

                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {banks.map((bank, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                            onClick={() => handleBankSelect(bank)}
                                        >
                                            {bank}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account number */}
                    <div className="mb-2.5">
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                            계좌번호
                        </label>
                        <input
                            type="text"
                            placeholder="- 없이 입력하세요"
                            value={accountNumber}
                            onChange={handleAccountNumberChange}
                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${accountNumber ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                        />
                    </div>

                    {/* Account holder */}
                    <div>
                        <label className="[font-family:'Roboto-Bold',Helvetica] font-bold text-black text-[15px] leading-[30px] tracking-[0] block text-left mb-1">
                            예금주
                        </label>
                        <input
                            type="text"
                            placeholder="예금주명을 정확히 입력하세요"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className={`w-full h-[54px] border-0 border-b border-[#0000001a] rounded-none pl-0 font-normal text-base bg-transparent outline-none text-left ${accountHolder ? 'text-black font-medium' : 'text-[#0000004c]'}`}
                        />
                    </div>
                </div>

                {/* Save button */}
                <div className="absolute top-[580px] left-64 w-[509px] flex justify-center">
                    <button
                        onClick={handleSave}
                        disabled={!selectedBank || !accountNumber || !accountHolder}
                        className={`px-6 py-2 rounded-[10px] transition-colors text-sm ${selectedBank && accountNumber && accountHolder
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                    >
                        저장하기
                    </button>
                </div>

                <div className="absolute w-[1256px] h-[205px] top-[1002px] left-0 bg-white border-t [border-top-style:solid] border-[#0000001f]">
                    <p className="absolute top-[62px] left-[515px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-base text-center leading-6 tracking-[0] whitespace-nowrap">
                        간편하고 안전한 행사 관리 솔루션
                    </p>

                    <div className="absolute top-[118px] left-[450px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        이용약관
                    </div>

                    <div className="absolute top-[118px] left-[534px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        개인정보처리방침
                    </div>

                    <div className="absolute top-[118px] left-[669px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        고객센터
                    </div>

                    <div className="absolute top-[118px] left-[752px] [font-family:'Segoe_UI-Regular',Helvetica] font-normal text-[#666666] text-sm text-center leading-[21px] tracking-[0] whitespace-nowrap">
                        회사소개
                    </div>
                </div>
            </div>
        </div>
    );
}; 