import React, {useEffect, useRef} from "react";
import {loadKakaoMap} from "../../lib/loadKakaoMap";

declare global {
    interface Window {
        kakao: any;
    }
}

interface VenueInfoProps {
    placename: string;
    address: string;
    latitude: number;
    longitude: number;
    placeUrl?: string;
    locationDetail?: string;
}

export const VenueInfo = ({placename, address, latitude, longitude, placeUrl, locationDetail}: VenueInfoProps) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadKakaoMap(() => {
            if (!window.kakao?.maps || !mapRef.current) return;

            const map = new window.kakao.maps.Map(mapRef.current, {
                center: new window.kakao.maps.LatLng(latitude, longitude),
                level: 2,
            });

            const imageSrc = "/images/marker_map_icon.png", // 마커이미지의 주소입니다
                imageSize = new window.kakao.maps.Size(64, 69), // 마커이미지의 크기입니다
                imageOption = {offset: new window.kakao.maps.Point(30, 80)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.

            const zoomControl = new window.kakao.maps.ZoomControl();
            map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

            const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(latitude, longitude),
                image: markerImage,
                map,
            });

            const position = new window.kakao.maps.LatLng(latitude, longitude);

            const placeId = placeUrl?.match(/\/(\d+)(\/)?$/)?.[1] ?? null;

            // 커스텀 오버레이 content 정의
            const customHtml = `
            <div style="position: relative; display: inline-block">
              <div style="
                padding: 10px 14px;
                background: white;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0px 2px 6px rgba(0,0,0,0.2);
                line-height: 1.5rem;
                white-space: nowrap;
              ">
                ${placename}<br />
                <a href="https://map.kakao.com/link/map/${placeId}" target="_blank" rel="noopener noreferrer" style="color:#5555be;">지도 크게 보기</a>
                &nbsp; | &nbsp;
                <a href="https://map.kakao.com/link/to/${placeId}" target="_blank" rel="noopener noreferrer" style="color:#5555be;">길찾기</a>
              </div>
              <div style="
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: -10px;
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 10px solid white;
              "></div>
            </div>
            `;

// 오버레이 생성 및 지도에 표시
            const customOverlay = new window.kakao.maps.CustomOverlay({
                position,
                content: customHtml,
                yAnchor: 2.5, // 마커 아래쪽 정렬
            });

            customOverlay.setMap(map);
        });
    }, [placename, address, latitude, longitude, placeUrl, locationDetail]);

    return (
        <div>
            <div className="space-y-4">
                <div className="flex items-center">
                    <span className="text-base text-[#00000099] font-normal w-20">장소</span>
                    <span className="text-base text-black font-normal">{placename}</span>
                </div>

                <div className="flex items-center">
                    <span className="text-base text-[#00000099] font-normal w-20">주소</span>
                    <span className="text-base text-black font-normal">{address}</span>
                </div>

                {locationDetail && (
                    <div className="flex items-center">
                        <span className="text-base text-[#00000099] font-normal w-20">상세 주소</span>
                        <span className="text-base text-black font-normal">{locationDetail}</span>
                    </div>
                )}

                <div className="w-full h-[690px] bg-gray-200 rounded-lg overflow-hidden mt-8">
                    <div ref={mapRef} className="w-full h-full"></div>
                </div>
            </div>
        </div>
    );
};
