import React, { useState } from 'react';
import styled from 'styled-components';
import { CollectedCard } from '../types/businessCard';
import { FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaFacebook, FaTwitter, FaGlobe } from 'react-icons/fa';
import { Edit3 } from 'lucide-react';
import DeleteButton from './DeleteButton';

interface FlippableBusinessCardProps {
    card: CollectedCard;
    onDelete?: (cardId: number, ownerName?: string) => void;
    onMemoUpdate?: (cardId: number, memo: string) => void;
    editingMemo?: { cardId: number; memo: string } | null;
    onEditMemo?: (editState: { cardId: number; memo: string } | null) => void;
}

const FlippableBusinessCard: React.FC<FlippableBusinessCardProps> = ({ 
    card, 
    onDelete, 
    onMemoUpdate, 
    editingMemo, 
    onEditMemo 
}) => {
    const { businessCard, collectedAt, memo } = card;
    const [isFlipped, setIsFlipped] = useState(false);
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSocialIcon = (platform: string, url: string) => {
        const iconProps = { size: 20, color: 'white' };
        
        switch (platform) {
            case 'linkedIn':
                return <FaLinkedin {...iconProps} />;
            case 'github':
                return <FaGithub {...iconProps} />;
            case 'instagram':
                return <FaInstagram {...iconProps} />;
            case 'facebook':
                return <FaFacebook {...iconProps} />;
            case 'twitter':
                return <FaTwitter {...iconProps} />;
            default:
                return <FaGlobe {...iconProps} />;
        }
    };

    const socialLinks = [
        { platform: 'linkedIn', url: businessCard.linkedIn },
        { platform: 'github', url: businessCard.github },
        { platform: 'instagram', url: businessCard.instagram },
        { platform: 'facebook', url: businessCard.facebook },
        { platform: 'twitter', url: businessCard.twitter }
    ].filter(link => link.url);

    const handleSaveMemo = () => {
        if (editingMemo && onMemoUpdate) {
            onMemoUpdate(card.id, editingMemo.memo);
        }
    };

    return (
        <StyledWrapper>
            <div className="myCard" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`innerCard ${isFlipped ? 'flipped' : ''}`}>
                    <div className="frontSide">
                        {onDelete && (
                            <div 
                                className="deleteButtonContainer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(card.id, businessCard.name);
                                }}
                            >
                                <DeleteButton />
                            </div>
                        )}
                        
                        <div className="profileImageContainer">
                            {businessCard.profileImageUrl ? (
                                <img 
                                    src={businessCard.profileImageUrl} 
                                    alt="프로필" 
                                    className="profileImage"
                                />
                            ) : (
                                <div className="profilePlaceholder">
                                    <div className="profileIcon">👤</div>
                                </div>
                            )}
                        </div>
                        
                        <div className="cardInfo">
                            <h3 className="name">{businessCard.name || '이름 없음'}</h3>
                            {businessCard.company && (
                                <p className="company">{businessCard.company}</p>
                            )}
                            <p className="collectedDate">수집일: {formatDate(collectedAt)}</p>
                            
                            {/* 메모 섹션 */}
                            <div className="memoSection">
                                <div className="memoHeader">
                                    <strong>메모</strong>
                                    {onEditMemo && editingMemo?.cardId !== card.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditMemo({ cardId: card.id, memo: memo || '' });
                                            }}
                                            className="editButton"
                                            title="메모 수정"
                                        >
                                            <Edit3 size={12} />
                                        </button>
                                    )}
                                    {editingMemo?.cardId === card.id && (
                                        <div className="headerButtons">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveMemo();
                                                }} 
                                                className="headerSaveButton"
                                                title="저장"
                                            >
                                                저장
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditMemo && onEditMemo(null);
                                                }} 
                                                className="headerCancelButton"
                                                title="취소"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {editingMemo?.cardId === card.id ? (
                                    <div className="memoEdit" onClick={(e) => e.stopPropagation()}>
                                        <textarea
                                            value={editingMemo.memo}
                                            onChange={(e) => onEditMemo && onEditMemo({ ...editingMemo, memo: e.target.value })}
                                            className="memoTextarea"
                                            rows={3}
                                            placeholder="메모를 입력하세요 (최대 500자)"
                                            maxLength={500}
                                        />
                                        <div className="memoInfo">
                                            <span className="charCount">
                                                {editingMemo.memo.length}/500자
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="memoDisplay">
                                        {memo || '메모가 없습니다'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="backSide">
                        <div className="backHeader">
                            <h4 className="backTitle">연락처 정보</h4>
                        </div>
                        
                        <div className="contactInfo">
                            <div className="contactSection">
                                {businessCard.position && (
                                    <div className="infoItem">
                                        <div className="infoLabel">직책</div>
                                        <div className="infoValue">{businessCard.position}</div>
                                    </div>
                                )}
                                {businessCard.department && (
                                    <div className="infoItem">
                                        <div className="infoLabel">부서</div>
                                        <div className="infoValue">{businessCard.department}</div>
                                    </div>
                                )}
                                {businessCard.phoneNumber && (
                                    <div className="infoItem mb-2">
                                        <div className="infoLabel">전화</div>
                                        <div className="infoValue">{businessCard.phoneNumber}</div>
                                    </div>
                                )}
                                {businessCard.email && (
                                    <div className="infoItem">
                                        <div className="infoLabel">이메일</div>
                                        <div className="infoValue">{businessCard.email}</div>
                                    </div>
                                )}
                                {businessCard.website && (
                                    <div className="infoItem">
                                        <div className="infoLabel">웹사이트</div>
                                        <div className="infoValue">{businessCard.website}</div>
                                    </div>
                                )}
                                {(businessCard.address || businessCard.placeName) && (
                                    <div className="infoItem">
                                        <div className="infoLabel">주소</div>
                                        <div className="infoValue">{businessCard.address || businessCard.placeName}</div>
                                    </div>
                                )}
                            </div>
                            
                            {socialLinks.length > 0 && (
                                <div className="socialSection">
                                    <div className="socialHeader">소셜 미디어</div>
                                    <div className="socialIcons">
                                        {socialLinks.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="socialIcon"
                                                title={link.platform}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {getSocialIcon(link.platform, link.url)}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {businessCard.description && (
                                <div className="descriptionSection">
                                    <div className="descriptionHeader">소개</div>
                                    <div className="descriptionText">{businessCard.description}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
    .myCard {
        font-family: 'Segoe UI', sans-serif;
        background-color: transparent;
        width: 300px;
        height: 420px;
        perspective: 1000px;
        margin: 10px;
        cursor: pointer;
    }

    .innerCard {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transition: transform 0.8s;
        transform-style: preserve-3d;
    }

    .innerCard.flipped {
        transform: rotateY(180deg);
    }

    .frontSide,
    .backSide {
        position: absolute;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 1.5rem;
        color: white;
        box-shadow: 0 0 0.3em rgba(255, 255, 255, 0.5);
        padding: 20px;
        box-sizing: border-box;
        overflow: hidden;
    }

    .frontSide,
    .frontSide::before {
        background: linear-gradient(43deg, rgb(99, 102, 241) 0%, rgb(167, 139, 250) 46%, rgb(249, 168, 212) 100%);
    }

    .backSide,
    .backSide::before {
        background-image: linear-gradient(160deg, #3ca8d9 0%, #53c0b2 50%, #81c3cc 100%);
    }

    .backSide {
        transform: rotateY(180deg);
    }

    .frontSide::before,
    .backSide::before {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        content: '';
        width: 110%;
        height: 110%;
        position: absolute;
        z-index: -1;
        border-radius: 1em;
        filter: blur(20px);
        animation: animate 5s linear infinite;
    }

    @keyframes animate {
        0% {
            opacity: 0.3;
        }

        80% {
            opacity: 1;
        }

        100% {
            opacity: 0.3;
        }
    }

    .profileImageContainer {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
        margin-top: 16px;
    }

    .profileImage {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid rgba(255, 255, 255, 0.8);
    }

    .profilePlaceholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid rgba(255, 255, 255, 0.8);
    }

    .profileIcon {
        font-size: 32px;
        opacity: 0.8;
    }

    .cardInfo {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .name {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
    }

    .company {
        font-size: 14px;
        margin: 0;
        opacity: 0.9;
    }

    .collectedDate {
        font-size: 12px;
        opacity: 0.8;
    }

    .backHeader {
        text-align: center;
        margin-bottom: 20px;
    }

    .backTitle {
        font-size: 16px;
        font-weight: 700;
        margin: 0;
    }

    .contactInfo {
        flex: 1;
        overflow-y: auto;

        /* 스크롤바 스타일링 */

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(103, 232, 249, 0.6);
            border-radius: 10px;

            &:hover {
                background: rgba(103, 232, 249, 0.8);
            }
        }
    }

    .contactSection {
        margin-bottom: 16px;
    }

    .infoItem {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
        padding: 8px 0;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .infoLabel {
        font-size: 10px;
        font-weight: 600;
        opacity: 0.8;
        margin-bottom: 4px;
        text-transform: uppercase;
    }

    .infoValue {
        font-size: 12px;
        word-break: break-word;
    }

    .socialSection {
        margin-bottom: 16px;
    }

    .socialHeader {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        text-align: center;
    }

    .socialIcons {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .descriptionSection {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
    }

    .descriptionHeader {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
        text-align: center;
    }

    .descriptionText {
        font-size: 11px;
        line-height: 1.4;
        opacity: 0.9;
        text-align: center;
    }

    .socialIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
    }

    .deleteButtonContainer {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
        cursor: pointer;
        transform: scale(0.9);
        transform-origin: top right;
    }

    .deleteButtonContainer .button {
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
    }

    .deleteButtonContainer .button:hover {
        width: 36px !important;
        border-radius: 50% !important;
    }

    .deleteButtonContainer .button::before {
        display: none !important;
    }

    .deleteButtonContainer .svgIcon {
        width: 14px !important;
    }

    .deleteButtonContainer .button:hover .bin-bottom {
        width: 16px !important;
    }

    .deleteButtonContainer .button:hover .bin-top {
        width: 16px !important;
    }

    .memoSection {
        margin-top: 20px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        flex-shrink: 0;
        min-height: 120px;
        display: flex;
        flex-direction: column;
    }

    .memoHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
    }

    .editButton {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background 0.3s ease;

        &:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    }

    .headerButtons {
        display: flex;
        gap: 4px;
    }

    .headerSaveButton, .headerCancelButton {
        padding: 4px 8px;
        border: none;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
    }

    .headerSaveButton {
        background: rgba(167, 139, 250, 0.8);
        color: white;

        &:hover {
            background: rgba(167, 139, 250, 1);
        }
    }

    .headerCancelButton {
        background: rgba(255, 255, 255, 0.2);
        color: white;

        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }

    .memoEdit {
        margin-top: 6px;
        display: flex;
        flex-direction: column;
        height: 60px;
    }

    .memoTextarea {
        width: 100%;
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.15);
        color: white;
        font-size: 11px;
        resize: none;
        font-family: inherit;
        height: 45px;
        overflow-y: auto;
        box-sizing: border-box;

        &::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        &:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
        }

        /* 텍스트영역 스크롤바 스타일링 */

        &::-webkit-scrollbar {
            width: 3px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(167, 139, 250, 0.5);
            border-radius: 3px;

            &:hover {
                background: rgba(167, 139, 250, 0.7);
            }
        }
    }

    .memoInfo {
        display: flex;
        justify-content: flex-end;
        margin-top: 2px;
        height: 13px;
        flex-shrink: 0;
    }

    .charCount {
        font-size: 9px;
        color: rgba(255, 255, 255, 0.6);
        font-weight: 500;
    }

    .memoButtons {
        display: flex;
        gap: 4px;
        margin-top: 8px;
        justify-content: center;
        flex-shrink: 0;
    }

    .saveButton, .cancelButton {
        padding: 4px 8px;
        border: none;
        border-radius: 3px;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
    }

    .saveButton {
        background: rgba(34, 197, 94, 0.8);
        color: white;

        &:hover {
            background: rgba(34, 197, 94, 1);
        }
    }

    .cancelButton {
        background: rgba(107, 114, 128, 0.8);
        color: white;

        &:hover {
            background: rgba(107, 114, 128, 1);
        }
    }

    .memoDisplay {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.3;
        word-break: break-word;
        height: 60px;
        overflow-y: auto;
        padding: 6px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        box-sizing: border-box;
        margin-top: 6px;

        /* 스크롤바 스타일링 */

        &::-webkit-scrollbar {
            width: 3px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(167, 139, 250, 0.6);
            border-radius: 10px;

            &:hover {
                background: rgba(167, 139, 250, 0.8);
            }
        }
    }
`;

export default FlippableBusinessCard;