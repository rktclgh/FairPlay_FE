import React from 'react';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export interface Creator {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  bio: string;
  responsibilities?: string[]; // 담당 업무 목록
  github?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/creators/${creator.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
    >
      {/* 프로필 이미지 영역 */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {creator.profileImage ? (
          <img
            src={creator.profileImage}
            alt={creator.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className="text-4xl text-gray-600 font-bold">
              {creator.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-6">
        {/* 이름과 역할 */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {creator.name}
          </h3>
          <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
            {creator.role}
          </p>
        </div>

        {/* 간단한 소개 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {creator.bio}
        </p>

        {/* 소셜 링크 아이콘 */}
        <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
          {creator.github && (
            <a
              href={creator.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-black transition-colors"
              aria-label="GitHub"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          )}
          {creator.linkedin && (
            <a
              href={creator.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-blue-700 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
          )}
          {creator.instagram && (
            <a
              href={creator.instagram}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-pink-600 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="w-5 h-5" />
            </a>
          )}
          {creator.twitter && (
            <a
              href={creator.twitter}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
          )}
          {creator.website && (
            <a
              href={creator.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-600 hover:text-green-600 transition-colors"
              aria-label="Website"
            >
              <FaGlobe className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* 이메일 */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">
            {creator.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
