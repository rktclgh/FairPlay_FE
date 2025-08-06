import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export const VenueInfo = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && mapRef.current) {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
          level: 3
        };

        const map = new window.kakao.maps.Map(mapRef.current, options);

        // 고척스카이돔 좌표로 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(37.4981, 126.8667);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });

        marker.setMap(map);
        map.setCenter(markerPosition);

        // 장소 검색 서비스 사용
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch('고척스카이돔', (results: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            if (results.length > 0) {
              const place = results[0];
              const newPosition = new window.kakao.maps.LatLng(place.y, place.x);
              
              // 마커 위치 업데이트
              marker.setPosition(newPosition);
              map.setCenter(newPosition);
              
              // 인포윈도우 추가
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px;font-size:12px;">${place.place_name}</div>`
              });
              infowindow.open(map, marker);
            }
          }
        });
      }
    };

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao) {
      loadKakaoMap();
    } else {
      // API 로드 대기
      const checkKakaoMap = setInterval(() => {
        if (window.kakao) {
          clearInterval(checkKakaoMap);
          loadKakaoMap();
        }
      }, 100);
    }
  }, []);

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="text-base text-[#00000099] font-normal w-16">장소</span>
          <span className="text-base text-black font-normal">고척스카이돔</span>
        </div>

        <div className="flex items-center">
          <span className="text-base text-[#00000099] font-normal w-16">주소</span>
          <span className="text-base text-black font-normal">서울 구로구 경인로 430</span>
        </div>

        <div className="w-full h-[690px] bg-gray-200 rounded-lg overflow-hidden mt-8">
          <div ref={mapRef} className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
}; 