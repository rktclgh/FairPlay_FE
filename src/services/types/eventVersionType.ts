export interface EventVersion {
    eventVersionId: number;
    eventId: number;
    versionNumber: number;
    updatedBy: number;
    updatedAt: string; // LocalDateTime is serialized as string
    snapshot: EventSnapshot;
}

export interface EventSnapshot {
    // from Event
    eventCode: string;
    titleKr: string;
    titleEng: string;
    hidden: boolean;
    managerId: number;
    eventStatusCodeId: number;
    tickets: TicketSnapshot[];

    // from EventDetail
    locationId: number;
    locationDetail: string;
    hostName: string;
    contactInfo: string;
    bio: string;
    content: string;
    policy: string;
    officialUrl: string;
    eventTime: number;
    thumbnailUrl: string;
    bannerUrl: string;
    startDate: string; // LocalDate is serialized as string
    endDate: string; // LocalDate is serialized as string
    mainCategoryId: number;
    mainCategoryName: string;
    subCategoryId: number;
    subCategoryName: string;
    regionCodeId: number;
    reentryAllowed: boolean;
    checkInAllowed: boolean;
    checkOutAllowed: boolean;
    hostCompany: string;
    age: boolean;
    externalLinks: ExternalLinkSnapshot[];

    // from Location
    placeName: string;
    latitude: number;
    longitude: number;
    address: string;

    // from Manager
    businessNumber: string;
    managerName: string;
    managerPhone: string;
    managerEmail: string;
}

export interface ExternalLinkSnapshot {
    url: string;
    displayText: string;
}

export interface TicketSnapshot {
    name: string;
    description: string;
    ticketStatusCodeId: number;
    stock: number;
    price: number;
    maxPurchase: number;
    visible: boolean;
    deleted: boolean;
    types: string; // TypesEnum from backend
}

export interface EventVersionComparison {
    eventId: number;
    version1: number;
    version2: number;
    snapshot1: EventSnapshot;
    snapshot2: EventSnapshot;
    fieldDifferences: any; // JSON 형태의 필드별 차이점
}
