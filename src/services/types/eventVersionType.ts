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
    subCategoryId: number;
    regionCodeId: number;
    reentryAllowed: boolean;
    checkInAllowed: boolean;
    checkOutAllowed: boolean;
    hostCompany: string;
    age: boolean;
    externalLinks: ExternalLinkSnapshot[];
}

export interface ExternalLinkSnapshot {
    url: string;
    displayText: string;
}

export interface TicketSnapshot {
    // Define ticket snapshot properties based on TicketSnapshotDto if available
    // Assuming it has at least these fields for now
    ticketId: number;
    name: string;
    price: number;
}

export interface EventVersionComparison {
    eventId: number;
    version1: number;
    version2: number;
    snapshot1: EventSnapshot;
    snapshot2: EventSnapshot;
    fieldDifferences: Record<string, { oldValue: any; newValue: any }>;
}
