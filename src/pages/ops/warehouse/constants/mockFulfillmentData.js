// Mock data for warehouse fulfillment, trip gear provisioning, and rental operations testing
export const MOCK_TRIPS = [
  {
    tripId: 'c3b3402b-35cd-4fd1-a4eb-f3573b838639',
    tourName: 'Tour Fansipan 2N1Đ - Chinh phục nóc nhà Đông Dương',
    startAt: '2026-11-08T06:00:00Z',
    endAt: '2026-11-09T18:00:00Z',
    leadGuideName: 'Nguyễn Văn Hùng (HDV chính)',
    totalParticipants: 12,
    totalGroups: 4,
    hasShortage: true,
    items: [
      {
        tripProvidedItemId: 'item-fan-01',
        productName: 'Lều cắm trại 2 người Cloud Up 2',
        variantName: '2 người / Xanh lá',
        sku: 'TENT-2-GREEN',
        tourConfigQuantity: 1,
        quantityBasis: 'PerGroup',
        requiredQuantity: 6,
        assignedCount: 4,
        missingCount: 2,
        preparedByUserName: 'Nguyễn Minh Đức (Thủ kho)',
        status: 'Draft',
        assignedAssets: [
          { assignmentId: 'asg-01', assetCode: 'SD-TENT-CU2-001', status: 'Reserved' },
          { assignmentId: 'asg-02', assetCode: 'SD-TENT-CU2-002', status: 'Reserved' },
          { assignmentId: 'asg-03', assetCode: 'SD-TENT-CU2-003', status: 'Reserved' },
          { assignmentId: 'asg-04', assetCode: 'SD-TENT-CU2-004', status: 'Reserved' },
        ],
      },
      {
        tripProvidedItemId: 'item-fan-02',
        productName: 'Balô trekking trợ lực 40L',
        variantName: '40 lít / Xanh lá',
        sku: 'PACK-40',
        tourConfigQuantity: 1,
        quantityBasis: 'PerPerson',
        requiredQuantity: 12,
        assignedCount: 12,
        missingCount: 0,
        preparedByUserName: 'Nguyễn Minh Đức (Thủ kho)',
        status: 'Ready',
        assignedAssets: Array.from({ length: 12 }, (_, i) => ({
          assignmentId: `asg-pack-${i + 1}`,
          assetCode: `SD-PACK-40-${String(i + 1).padStart(3, '0')}`,
          status: 'Reserved',
        })),
      },
      {
        tripProvidedItemId: 'item-fan-03',
        productName: 'Túi ngủ giữ ấm dã ngoại',
        variantName: 'Tiêu chuẩn / Xanh rêu',
        sku: 'SLEEP-WARM',
        tourConfigQuantity: 1,
        quantityBasis: 'PerPerson',
        requiredQuantity: 12,
        assignedCount: 10,
        missingCount: 2,
        preparedByUserName: 'Nguyễn Minh Đức (Thủ kho)',
        status: 'Draft',
        assignedAssets: Array.from({ length: 10 }, (_, i) => ({
          assignmentId: `asg-sleep-${i + 1}`,
          assetCode: `SD-SLEEP-${String(i + 1).padStart(3, '0')}`,
          status: 'Reserved',
        })),
      },
      {
        tripProvidedItemId: 'item-fan-04',
        productName: 'Đèn lều sạc USB',
        variantName: 'Sạc USB / Xanh rêu',
        sku: 'LIGHT-USB',
        tourConfigQuantity: 1,
        quantityBasis: 'PerGroup',
        requiredQuantity: 6,
        assignedCount: 6,
        missingCount: 0,
        preparedByUserName: 'Nguyễn Minh Đức (Thủ kho)',
        status: 'Ready',
        assignedAssets: Array.from({ length: 6 }, (_, i) => ({
          assignmentId: `asg-lamp-${i + 1}`,
          assetCode: `SD-LAMP-${String(i + 1).padStart(3, '0')}`,
          status: 'Reserved',
        })),
      },
    ],
  },
  {
    tripId: '0794d4dc-7cd5-4502-9d59-aaf7f4cde45b',
    tourName: 'Tour Tà Năng - Phan Dũng 3N2Đ (Cung trekking đẹp nhất miền Nam)',
    startAt: '2026-11-15T05:00:00Z',
    endAt: '2026-11-17T20:00:00Z',
    leadGuideName: 'Trần Văn Nam (HDV trưởng)',
    totalParticipants: 16,
    totalGroups: 5,
    hasShortage: false,
    items: [
      {
        tripProvidedItemId: 'item-tn-01',
        productName: 'Lều cắm trại 2 người Cloud Up 2',
        variantName: '2 người / Xanh lá',
        sku: 'TENT-2-GREEN',
        tourConfigQuantity: 1,
        quantityBasis: 'PerGroup',
        requiredQuantity: 8,
        assignedCount: 8,
        missingCount: 0,
        preparedByUserName: 'Nguyễn Minh Đức (Thủ kho)',
        status: 'Ready',
        assignedAssets: Array.from({ length: 8 }, (_, i) => ({
          assignmentId: `asg-tn-tent-${i + 1}`,
          assetCode: `SD-TENT-CU2-${String(i + 1).padStart(3, '0')}`,
          status: 'Reserved',
        })),
      },
    ],
  },
  {
    tripId: '1066c26d-c2aa-4dc5-bd1d-de5156659488',
    tourName: 'Tour săn mây đỉnh Lảo Thẩn 2N1Đ - Y Tý mộng mơ',
    startAt: '2026-11-22T06:30:00Z',
    endAt: '2026-11-23T19:00:00Z',
    leadGuideName: 'Lê Hoàng Anh',
    totalParticipants: 8,
    totalGroups: 3,
    hasShortage: false,
    items: [],
  },
  {
    tripId: '12846525-2f91-4079-8782-667b5ea1f14f',
    tourName: 'Tour Vườn Quốc Gia Bidoup - Núi Bà',
    startAt: '2026-11-29T06:00:00Z',
    endAt: '2026-11-30T17:30:00Z',
    leadGuideName: 'Vũ Quốc Đạt',
    totalParticipants: 10,
    totalGroups: 3,
    hasShortage: true,
    items: [],
  },
  {
    tripId: '405482ab-eef6-4dc9-8984-b6ee098ecf20',
    tourName: 'Tour Pù Luông mùa lúa chín - Khám phá bản làng Thanh Hóa',
    startAt: '2026-12-06T07:00:00Z',
    endAt: '2026-12-07T18:00:00Z',
    leadGuideName: 'Hoàng Minh Tuấn',
    totalParticipants: 14,
    totalGroups: 4,
    hasShortage: true,
    items: [],
  },
];

export const MOCK_ORDERS = {
  'RT-202611-001': {
    orderCode: 'RT-202611-001',
    customerName: 'Hoàng Minh Tuấn',
    customerPhone: '0912 345 678',
    rentalStartAt: '2026-11-05T08:00:00Z',
    rentalEndAt: '2026-11-08T18:00:00Z',
    orderStatus: 'Confirmed',
    depositAmount: 1500000,
    totalRequiredCount: 4,
    scannedCount: 2,
    handoverItems: [
      {
        rentalOrderItemId: 'roi-01',
        productName: 'Lều cắm trại 2 người',
        variantName: '2 người / Xanh lá',
        variantSku: 'TENT-2-GREEN',
        quantityRequired: 2,
        scannedCount: 2,
        scannedAssets: [
          { assignmentId: 'as-01', assetCode: 'SD-TENT-CU2-001', scannedAt: '2026-11-04T08:30:00Z' },
          { assignmentId: 'as-02', assetCode: 'SD-TENT-CU2-002', scannedAt: '2026-11-04T08:31:00Z' },
        ],
      },
      {
        rentalOrderItemId: 'roi-02',
        productName: 'Balô trekking 40L',
        variantName: '40 lít / Xanh lá',
        variantSku: 'PACK-40',
        quantityRequired: 2,
        scannedCount: 0,
        scannedAssets: [],
      },
    ],
    returnItems: [
      {
        rentalOrderItemId: 'roi-01',
        productName: 'Lều cắm trại 2 người',
        variantName: '2 người / Xanh lá',
        variantSku: 'TENT-2-GREEN',
        quantityRequired: 2,
        returnedCount: 1,
        assets: [
          {
            assignmentId: 'as-01',
            assetCode: 'SD-TENT-CU2-001',
            status: 'Returned',
            conditionNote: 'Tốt, khô ráo',
            damageFee: null,
          },
          {
            assignmentId: 'as-02',
            assetCode: 'SD-TENT-CU2-002',
            status: 'Pending',
            conditionNote: null,
            damageFee: null,
          },
        ],
      },
      {
        rentalOrderItemId: 'roi-02',
        productName: 'Balô trekking 40L',
        variantName: '40 lít / Xanh lá',
        variantSku: 'PACK-40',
        quantityRequired: 2,
        returnedCount: 1,
        assets: [
          {
            assignmentId: 'as-03',
            assetCode: 'SD-PACK-40-001',
            status: 'Returned',
            conditionNote: 'Khóa kéo trơn tru',
            damageFee: null,
          },
          {
            assignmentId: 'as-04',
            assetCode: 'SD-PACK-40-002',
            status: 'Lost',
            conditionNote: 'Khách báo thất lạc trong rừng',
            damageFee: 450000,
          },
        ],
      },
    ],
    charges: [
      {
        id: 'chg-01',
        chargeType: 'DamageCompensation',
        amount: 150000,
        reason: 'Rách nhẹ vải ngoài lều SD-TENT-CU2-002',
        equipmentAssetCode: 'SD-TENT-CU2-002',
        status: 'Assessed',
        createdAt: '2026-11-04T08:00:00Z',
      },
      {
        id: 'chg-02',
        chargeType: 'LostEquipment',
        amount: 450000,
        reason: 'Mất Balo trekking SD-PACK-40-002',
        equipmentAssetCode: 'SD-PACK-40-002',
        status: 'Assessed',
        createdAt: '2026-11-04T08:15:00Z',
      },
    ],
  },
  'RT-202611-002': {
    orderCode: 'RT-202611-002',
    customerName: 'Nguyễn Thị Bích Phương',
    customerPhone: '0988 776 655',
    rentalStartAt: '2026-11-07T07:00:00Z',
    rentalEndAt: '2026-11-09T20:00:00Z',
    orderStatus: 'Confirmed',
    depositAmount: 2000000,
    totalRequiredCount: 3,
    scannedCount: 3,
    handoverItems: [
      {
        rentalOrderItemId: 'roi-11',
        productName: 'Lều gia đình 4 người',
        variantName: '4 người / Cam đất',
        variantSku: 'TENT-4',
        quantityRequired: 1,
        scannedCount: 1,
        scannedAssets: [
          { assignmentId: 'as-11', assetCode: 'SD-TENT-4P-001', scannedAt: '2026-11-04T08:35:00Z' },
        ],
      },
      {
        rentalOrderItemId: 'roi-12',
        productName: 'Đèn lều sạc USB',
        variantName: 'Sạc USB / Xanh rêu',
        variantSku: 'LIGHT-USB',
        quantityRequired: 2,
        scannedCount: 2,
        scannedAssets: [
          { assignmentId: 'as-12', assetCode: 'SD-LAMP-001', scannedAt: '2026-11-04T08:36:00Z' },
          { assignmentId: 'as-13', assetCode: 'SD-LAMP-002', scannedAt: '2026-11-04T08:36:30Z' },
        ],
      },
    ],
    returnItems: [
      {
        rentalOrderItemId: 'roi-11',
        productName: 'Lều gia đình 4 người',
        variantName: '4 người / Cam đất',
        variantSku: 'TENT-4',
        quantityRequired: 1,
        returnedCount: 1,
        assets: [
          {
            assignmentId: 'as-11',
            assetCode: 'SD-TENT-4P-001',
            status: 'Returned',
            conditionNote: 'Hoàn hảo, sạch sẽ',
            damageFee: null,
          },
        ],
      },
    ],
    charges: [],
  },
  'RT-202611-003': {
    orderCode: 'RT-202611-003',
    customerName: 'Trịnh Quốc Bảo',
    customerPhone: '0903 112 233',
    rentalStartAt: '2026-11-10T09:00:00Z',
    rentalEndAt: '2026-11-12T17:00:00Z',
    orderStatus: 'Draft',
    depositAmount: 800000,
    totalRequiredCount: 2,
    scannedCount: 0,
    handoverItems: [
      {
        rentalOrderItemId: 'roi-21',
        productName: 'Túi ngủ giữ ấm',
        variantName: 'Tiêu chuẩn / Xanh rêu',
        variantSku: 'SLEEP-WARM',
        quantityRequired: 2,
        scannedCount: 0,
        scannedAssets: [],
      },
    ],
    returnItems: [],
    charges: [],
  },
};

export const MOCK_CATALOG_VARIANTS = [
  { id: '11111111-1111-1111-1111-111111111101', productName: 'Lều cắm trại 2 người', variantName: '2 người / xanh lá', sku: 'TENT-2-GREEN' },
  { id: '11111111-1111-1111-1111-111111111102', productName: 'Lều cắm trại 2 người', variantName: '2 người / màu cát', sku: 'TENT-2-SAND' },
  { id: '11111111-1111-1111-1111-111111111103', productName: 'Lều gia đình 4 người', variantName: '4 người / Cam đất', sku: 'TENT-4' },
  { id: '11111111-1111-1111-1111-111111111104', productName: 'Lều trekking siêu nhẹ', variantName: '1 người / Xanh rêu', sku: 'TENT-LIGHT' },
  { id: '11111111-1111-1111-1111-111111111105', productName: 'Balô trekking 40L', variantName: '40 lít / Xanh lá', sku: 'PACK-40' },
  { id: '11111111-1111-1111-1111-111111111106', productName: 'Balô trekking 60L', variantName: '60 lít / Xanh rêu', sku: 'PACK-60' },
  { id: '11111111-1111-1111-1111-111111111107', productName: 'Balô đi bộ 20L', variantName: '20 lít / Cam đất', sku: 'PACK-20' },
  { id: '11111111-1111-1111-1111-111111111108', productName: 'Túi ngủ giữ ấm', variantName: 'Tiêu chuẩn / Xanh rêu', sku: 'SLEEP-WARM' },
  { id: '11111111-1111-1111-1111-111111111109', productName: 'Đệm ngủ tự bơm', variantName: 'Một người / Xanh lá', sku: 'MAT-AIR' },
  { id: '11111111-1111-1111-1111-111111111110', productName: 'Đèn lều sạc USB', variantName: 'Sạc USB / Xanh rêu', sku: 'LIGHT-USB' },
];

// Danh sách thiết bị mẫu dự phòng cho tìm kiếm trong kho
export const MOCK_ASSETS_CATALOG = [
  {
    id: 'ast-001',
    assetCode: 'SD-TENT-CU2-001',
    productName: 'Lều cắm trại 2 người Cloud Up 2',
    variantName: '2 người / Xanh lá',
    sku: 'TENT-2-GREEN',
    assetStatus: 'Available',
    conditionNote: 'Mới 100%, nguyên tem cọc ghim',
    currentAssignment: null,
    createdAt: '2026-11-04T08:00:00Z',
    updatedAt: '2026-11-04T09:20:00Z',
  },
  {
    id: 'ast-002',
    assetCode: 'SD-TENT-CU2-002',
    productName: 'Lều cắm trại 2 người Cloud Up 2',
    variantName: '2 người / Xanh lá',
    sku: 'TENT-2-GREEN',
    assetStatus: 'Rented',
    conditionNote: 'Tình trạng tốt, vải chống thấm',
    currentAssignment: {
      sourceType: 'RentalOrder',
      sourceCode: 'RT-202611-001',
      status: 'Issued',
      reservedFrom: '2026-11-04T08:00:00Z',
      reservedUntil: '2026-11-07T18:00:00Z',
    },
    createdAt: '2026-11-04T08:05:00Z',
    updatedAt: '2026-11-04T09:15:00Z',
  },
  {
    id: 'ast-003',
    assetCode: 'SD-TENT-4P-0001',
    productName: 'Lều gia đình 4 người',
    variantName: '4 người / Cam đất',
    sku: 'TENT-4',
    assetStatus: 'Available',
    conditionNote: 'Đầy đủ cọc dây và mái che',
    currentAssignment: null,
    createdAt: '2026-11-04T08:10:00Z',
    updatedAt: '2026-11-04T08:10:00Z',
  },
  {
    id: 'ast-004',
    assetCode: 'SD-PACK-40-RED-0002',
    productName: 'Balô trekking 40L',
    variantName: 'Balô 40L / Đỏ (ngừng)',
    sku: 'SD-PACK-40-RED',
    assetStatus: 'Maintenance',
    conditionNote: 'đang bảo trì khóa kéo',
    currentAssignment: null,
    createdAt: '2026-11-04T09:27:00Z',
    updatedAt: '2026-11-04T09:35:00Z',
  },
  {
    id: 'ast-005',
    assetCode: 'SD-PACK-40-001',
    productName: 'Balô trekking 40L',
    variantName: '40 lít / Xanh lá',
    sku: 'PACK-40',
    assetStatus: 'Available',
    conditionNote: 'Khóa YKK êm ái, đai trợ lực tốt',
    currentAssignment: null,
    createdAt: '2026-11-04T08:20:00Z',
    updatedAt: '2026-11-04T08:20:00Z',
  },
  {
    id: 'ast-006',
    assetCode: 'SD-SLEEP-001',
    productName: 'Túi ngủ giữ ấm',
    variantName: 'Tiêu chuẩn / Xanh rêu',
    sku: 'SLEEP-WARM',
    assetStatus: 'Available',
    conditionNote: 'Giặt sạch, bông phồng tốt',
    currentAssignment: null,
    createdAt: '2026-11-04T08:25:00Z',
    updatedAt: '2026-11-04T08:25:00Z',
  },
  {
    id: 'ast-007',
    assetCode: 'SD-LAMP-001',
    productName: 'Đèn lều sạc USB',
    variantName: 'Sạc USB / Xanh rêu',
    sku: 'LIGHT-USB',
    assetStatus: 'Available',
    conditionNote: 'Pin 100%, 3 nấc sáng',
    currentAssignment: null,
    createdAt: '2026-11-04T08:30:00Z',
    updatedAt: '2026-11-04T08:30:00Z',
  },
];

// Hàm sinh dữ liệu Gantt trực quan theo khoảng thời gian thực tế
export function generateMockGanttData(startDateStr, daysCount = 14) {
  const baseStart = new Date(startDateStr);
  const addDays = (d, n) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy.toISOString();
  };

  const day1 = addDays(baseStart, 0);
  const day3 = addDays(baseStart, 2);
  const day4 = addDays(baseStart, 3);
  const day6 = addDays(baseStart, 5);
  const day8 = addDays(baseStart, 7);

  const variantGroups = [
    {
      productVariantId: 'var-gantt-01',
      variantName: 'Lều cắm trại 2 người Cloud Up 2 (2 người / Xanh lá)',
      sku: 'TENT-2-GREEN',
      totalAssets: 4,
      dailyOccupancy: Array.from({ length: daysCount }, (_, i) => ({
        date: addDays(baseStart, i),
        occupiedCount: i >= 0 && i <= 3 ? 2 : i >= 4 && i <= 7 ? 3 : 1,
        totalCount: 4,
        isOverbooked: false,
      })),
      assets: [
        {
          equipmentAssetId: 'ast-g-01',
          assetCode: 'SD-TENT-CU2-001',
          status: 'Issued',
          assignments: [
            {
              assignmentId: 'asg-g-1',
              sourceType: 'RentalOrder',
              sourceCode: 'RT-202611-001',
              status: 'Issued',
              reservedFrom: day1,
              reservedUntil: day4,
            },
            {
              assignmentId: 'asg-g-2',
              sourceType: 'TripProvided',
              sourceCode: 'Fansipan 2N1Đ',
              status: 'Reserved',
              reservedFrom: day6,
              reservedUntil: day8,
            },
          ],
        },
        {
          equipmentAssetId: 'ast-g-02',
          assetCode: 'SD-TENT-CU2-002',
          status: 'Reserved',
          assignments: [
            {
              assignmentId: 'asg-g-3',
              sourceType: 'TripProvided',
              sourceCode: 'Fansipan 2N1Đ',
              status: 'Reserved',
              reservedFrom: day3,
              reservedUntil: day6,
            },
          ],
        },
        {
          equipmentAssetId: 'ast-g-03',
          assetCode: 'SD-TENT-CU2-003',
          status: 'Available',
          assignments: [],
        },
        {
          equipmentAssetId: 'ast-g-04',
          assetCode: 'SD-TENT-CU2-004',
          status: 'Available',
          assignments: [],
        },
      ],
    },
    {
      productVariantId: 'var-gantt-02',
      variantName: 'Balô trekking trợ lực 40L (40 lít / Xanh lá)',
      sku: 'PACK-40',
      totalAssets: 4,
      dailyOccupancy: Array.from({ length: daysCount }, (_, i) => ({
        date: addDays(baseStart, i),
        occupiedCount: i >= 1 && i <= 5 ? 2 : 1,
        totalCount: 4,
        isOverbooked: false,
      })),
      assets: [
        {
          equipmentAssetId: 'ast-g-05',
          assetCode: 'SD-PACK-40-001',
          status: 'Issued',
          assignments: [
            {
              assignmentId: 'asg-g-4',
              sourceType: 'RentalOrder',
              sourceCode: 'RT-202611-001',
              status: 'Issued',
              reservedFrom: day1,
              reservedUntil: day4,
            },
          ],
        },
        {
          equipmentAssetId: 'ast-g-06',
          assetCode: 'SD-PACK-40-002',
          status: 'Reserved',
          assignments: [
            {
              assignmentId: 'asg-g-5',
              sourceType: 'TripProvided',
              sourceCode: 'Tà Năng 3N2Đ',
              status: 'Reserved',
              reservedFrom: day4,
              reservedUntil: day8,
            },
          ],
        },
        {
          equipmentAssetId: 'ast-g-07',
          assetCode: 'SD-PACK-40-003',
          status: 'Available',
          assignments: [],
        },
        {
          equipmentAssetId: 'ast-g-08',
          assetCode: 'SD-PACK-40-RED-0002',
          status: 'Maintenance',
          assignments: [],
        },
      ],
    },
    {
      productVariantId: 'var-gantt-03',
      variantName: 'Đèn lều sạc USB (Sạc USB / Xanh rêu)',
      sku: 'LIGHT-USB',
      totalAssets: 3,
      dailyOccupancy: Array.from({ length: daysCount }, (_, i) => ({
        date: addDays(baseStart, i),
        occupiedCount: i >= 2 && i <= 6 ? 1 : 0,
        totalCount: 3,
        isOverbooked: false,
      })),
      assets: [
        {
          equipmentAssetId: 'ast-g-09',
          assetCode: 'SD-LAMP-001',
          status: 'Issued',
          assignments: [
            {
              assignmentId: 'asg-g-6',
              sourceType: 'RentalOrder',
              sourceCode: 'RT-202611-002',
              status: 'Issued',
              reservedFrom: day3,
              reservedUntil: day6,
            },
          ],
        },
        {
          equipmentAssetId: 'ast-g-10',
          assetCode: 'SD-LAMP-002',
          status: 'Available',
          assignments: [],
        },
        {
          equipmentAssetId: 'ast-g-11',
          assetCode: 'SD-LAMP-003',
          status: 'Available',
          assignments: [],
        },
      ],
    },
  ];

  return {
    from: day1,
    to: addDays(baseStart, daysCount - 1),
    totalAssets: 11,
    inUseCount: 4,
    availableCount: 7,
    variantGroups,
  };
}

// Hàm sinh danh sách thiết bị khả dụng theo SKU để gán cho đồ cấp chuyến đi
export function generateAvailableAssetsForSku(sku, productName = 'Thiết bị') {
  const cleanSku = (sku || 'EQ').toUpperCase();
  return [
    {
      assetId: `avail-${cleanSku}-002`,
      assetCode: `${cleanSku}-0002`,
      productName,
      conditionNote: 'Mới 100%, sẵn sàng trong kho',
      assetStatus: 'Available',
    },
    {
      assetId: `avail-${cleanSku}-003`,
      assetCode: `${cleanSku}-0003`,
      productName,
      conditionNote: 'Tình trạng tốt, đã kiểm tra đạt chuẩn',
      assetStatus: 'Available',
    },
    {
      assetId: `avail-${cleanSku}-004`,
      assetCode: `${cleanSku}-0004`,
      productName,
      conditionNote: 'Phụ kiện đầy đủ, nguyên túi đựng',
      assetStatus: 'Available',
    },
    {
      assetId: `avail-${cleanSku}-005`,
      assetCode: `${cleanSku}-0005`,
      productName,
      conditionNote: 'Sẵn sàng trong kho',
      assetStatus: 'Available',
    },
    {
      assetId: `avail-${cleanSku}-006`,
      assetCode: `${cleanSku}-0006`,
      productName,
      conditionNote: 'Kiểm tra đạt chuẩn trước tour',
      assetStatus: 'Available',
    },
  ];
}

// -------------------------------------------------------------
// BỘ LƯU TRỮ VĨNH VIỄN (PERSISTENT STORE) VÀO LOCALSTORAGE
// Giúp duy trì toàn vẹn dữ liệu khi chuyển tab, refresh hoặc test offline
// -------------------------------------------------------------

const STORAGE_PREFIX = 'rentrek_ops_';

function safeGet(key, defaultVal) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw.replaceAll('Phạm Việt Bách', 'Nguyễn Minh Đức')) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function safeSet(key, val) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch {
    // ignore
  }
}

// 1. Handover Checklist
export function getPersistentOrderHandover(orderCode) {
  const code = orderCode || 'RT-202611-001';
  const defaultOrder = MOCK_ORDERS[code] || MOCK_ORDERS['RT-202611-001'];
  const stored = safeGet(`handover_${code}`, null);
  if (stored) return { data: stored };

  const initial = {
    orderCode: defaultOrder.orderCode,
    customerName: defaultOrder.customerName,
    customerPhone: defaultOrder.customerPhone,
    rentalStartAt: defaultOrder.rentalStartAt,
    rentalEndAt: defaultOrder.rentalEndAt,
    orderStatus: defaultOrder.orderStatus,
    totalRequiredCount: defaultOrder.totalRequiredCount,
    scannedCount: defaultOrder.scannedCount,
    items: defaultOrder.handoverItems.map((item) => ({ ...item })),
  };
  safeSet(`handover_${code}`, initial);
  return { data: initial };
}

export function scanPersistentHandover(orderCode, assetCode) {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderHandover(code).data;

  let found = false;
  const newItems = current.items.map((item) => {
    if (!found && item.scannedCount < item.quantityRequired) {
      found = true;
      return {
        ...item,
        scannedCount: item.scannedCount + 1,
        scannedAssets: [
          ...(item.scannedAssets || []),
          { assignmentId: `asg-${Date.now()}`, assetCode, scannedAt: new Date().toISOString() },
        ],
      };
    }
    return item;
  });

  const nextScannedCount = Math.min(current.totalRequiredCount, (current.scannedCount || 0) + 1);
  const updated = {
    ...current,
    scannedCount: nextScannedCount,
    items: newItems,
  };
  safeSet(`handover_${code}`, updated);
  return { data: updated, message: `Đã quét nhận diện: ${assetCode}` };
}

export function completePersistentHandover(orderCode, incompleteReason = null) {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderHandover(code).data;
  const updated = {
    ...current,
    orderStatus: 'InFulfillment',
    incompleteReason: incompleteReason || null,
  };
  safeSet(`handover_${code}`, updated);
  return { data: updated, message: 'Bàn giao thiết bị cho khách thành công!' };
}

// 2. Return Checklist
export function getPersistentOrderReturn(orderCode) {
  const code = orderCode || 'RT-202611-001';
  const defaultOrder = MOCK_ORDERS[code] || MOCK_ORDERS['RT-202611-001'];
  const stored = safeGet(`return_${code}`, null);
  if (stored) return { data: stored };

  const flatItems = [];
  if (defaultOrder?.returnItems) {
    defaultOrder.returnItems.forEach((group) => {
      group.assets?.forEach((a) => {
        flatItems.push({
          assignmentId: a.assignmentId,
          equipmentAssetId: a.assignmentId,
          assetCode: a.assetCode,
          productName: group.productName,
          variantName: group.variantName,
          status: a.status === 'Lost' ? 'LostOrException' : a.status === 'Returned' ? 'Returned' : 'Issued',
          returnCondition: a.conditionNote ? (a.damageFee ? 'Damaged' : 'Normal') : null,
          conditionNote: a.conditionNote || null,
          variantPriceTier: 500000,
        });
      });
    });
  }

  const initial = {
    orderCode: defaultOrder.orderCode,
    customerName: defaultOrder.customerName,
    rentalEndAt: defaultOrder.rentalEndAt,
    orderStatus: defaultOrder.orderStatus,
    totalIssuedCount: flatItems.length,
    returnedCount: flatItems.filter((i) => i.status === 'Returned' || i.status === 'LostOrException').length,
    items: flatItems,
  };
  safeSet(`return_${code}`, initial);
  return { data: initial };
}

export function scanPersistentReturn(orderCode, payload) {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderReturn(code).data;

  const newItems = current.items.map((i) =>
    i.assetCode.toLowerCase() === payload.assetCode.toLowerCase()
      ? {
          ...i,
          status: 'Returned',
          returnCondition: payload.returnCondition || 'Normal',
          conditionNote: payload.conditionNote || (payload.returnCondition === 'Normal' ? 'Tốt, nguyên vẹn' : 'Có hư hại'),
        }
      : i
  );

  const returnedCount = newItems.filter((i) => i.status === 'Returned' || i.status === 'LostOrException').length;
  const updated = {
    ...current,
    returnedCount,
    items: newItems,
  };
  safeSet(`return_${code}`, updated);

  // Nếu có phụ phí hư hại, tạo phí trong persistent charges
  if (payload.createDamageCharge && payload.damageChargeAmount) {
    createPersistentRentalCharge(code, {
      chargeType: 'DamageCompensation',
      amount: payload.damageChargeAmount,
      reason: payload.damageReason || `Hư hại thiết bị ${payload.assetCode}`,
      equipmentAssetCode: payload.assetCode,
    });
  }

  return { data: updated, message: `Đã nhận lại thiết bị: ${payload.assetCode}` };
}

export function reportLostPersistentAsset(orderCode, payload) {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderReturn(code).data;

  let lostCode = 'SD-EQ';
  const newItems = current.items.map((i) => {
    if (i.equipmentAssetId === payload.assetId || i.assignmentId === payload.assetId || i.assetCode === payload.assetCode) {
      lostCode = i.assetCode;
      return {
        ...i,
        status: 'LostOrException',
        returnCondition: 'Lost',
        conditionNote: `Báo mất: ${payload.reason}`,
      };
    }
    return i;
  });

  const returnedCount = newItems.filter((i) => i.status === 'Returned' || i.status === 'LostOrException').length;
  const updated = {
    ...current,
    returnedCount,
    items: newItems,
  };
  safeSet(`return_${code}`, updated);

  if (payload.lossChargeAmount) {
    createPersistentRentalCharge(code, {
      chargeType: 'LostEquipment',
      amount: payload.lossChargeAmount,
      reason: `Mất thiết bị ${lostCode}: ${payload.reason}`,
      equipmentAssetCode: lostCode,
    });
  }

  return { data: updated, message: `Đã ghi nhận báo mất thiết bị: ${lostCode}` };
}

export function completePersistentReturn(orderCode, notes = '') {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderReturn(code).data;
  const updated = {
    ...current,
    orderStatus: 'Returned',
    completionNotes: notes,
  };
  safeSet(`return_${code}`, updated);
  return { data: updated, message: 'Đã hoàn tất thu hồi đơn thuê' };
}

// 3. Rental Charges & Settlement
export function getPersistentOrderCharges(orderCode) {
  const code = orderCode || 'RT-202611-001';
  const defaultOrder = MOCK_ORDERS[code] || MOCK_ORDERS['RT-202611-001'];
  const stored = safeGet(`charges_${code}`, null);
  if (stored) return { data: stored };

  const initial = (defaultOrder.charges || []).map((c) => ({
    rentalChargeId: c.id,
    chargeType: c.chargeType,
    amount: c.amount,
    reason: c.reason,
    equipmentAssetCode: c.equipmentAssetCode,
    status: c.status,
    createdByName: 'Nguyễn Minh Đức (Thủ kho)',
    createdAt: c.createdAt,
  }));
  safeSet(`charges_${code}`, initial);
  return { data: initial };
}

export function createPersistentRentalCharge(orderCode, payload) {
  const code = orderCode || 'RT-202611-001';
  const current = getPersistentOrderCharges(code).data;
  const newCharge = {
    rentalChargeId: `chg-${Date.now()}`,
    chargeType: payload.chargeType || 'LateReturn',
    amount: Number(payload.amount) || 0,
    reason: payload.reason,
    equipmentAssetCode: payload.equipmentAssetCode || payload.equipmentAssetId || '—',
    status: 'Draft',
    createdByName: 'Nguyễn Minh Đức (Thủ kho)',
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newCharge];
  safeSet(`charges_${code}`, updated);
  return { data: newCharge, message: 'Tạo phí phát sinh thành công' };
}

export function assessPersistentRentalCharge(chargeId) {
  // Tìm qua mọi đơn
  Object.keys(MOCK_ORDERS).forEach((code) => {
    const list = getPersistentOrderCharges(code).data;
    if (list.some((c) => c.rentalChargeId === chargeId)) {
      const updated = list.map((c) => (c.rentalChargeId === chargeId ? { ...c, status: 'Assessed' } : c));
      safeSet(`charges_${code}`, updated);
    }
  });
  return { message: 'Đã chốt phí phát sinh (Assessed)' };
}

export function voidPersistentRentalCharge(chargeId, payload) {
  Object.keys(MOCK_ORDERS).forEach((code) => {
    const list = getPersistentOrderCharges(code).data;
    if (list.some((c) => c.rentalChargeId === chargeId)) {
      const updated = list.map((c) =>
        c.rentalChargeId === chargeId ? { ...c, status: 'Voided', voidReason: payload?.voidReason } : c
      );
      safeSet(`charges_${code}`, updated);
    }
  });
  return { message: 'Đã miễn trừ khoản phí (Voided)' };
}

export function completePersistentOrder(orderCode) {
  const code = orderCode || 'RT-202611-001';
  const returnObj = getPersistentOrderReturn(code).data;
  safeSet(`return_${code}`, { ...returnObj, orderStatus: 'Completed' });
  const handoverObj = getPersistentOrderHandover(code).data;
  safeSet(`handover_${code}`, { ...handoverObj, orderStatus: 'Completed' });
  return { message: 'Nghiệm thu đóng đơn thuê thành công!' };
}

// 4. Trip Provided Items Persistent Store
export function getPersistentTrip(tripId) {
  const targetId = tripId || MOCK_TRIPS[0].tripId;
  const defaultTrip = MOCK_TRIPS.find((t) => t.tripId === targetId) || MOCK_TRIPS[0];
  const stored = safeGet(`trip_${targetId}`, null);
  if (stored) return { data: stored };

  // Khởi tạo bản sao ban đầu từ MOCK_TRIPS
  const initial = JSON.parse(JSON.stringify(defaultTrip));
  safeSet(`trip_${targetId}`, initial);
  return { data: initial };
}

export function assignPersistentTripAssets(tripId, itemId, assetCodes) {
  const targetId = tripId || MOCK_TRIPS[0].tripId;
  const trip = getPersistentTrip(targetId).data;

  const nextItems = (trip.items || []).map((item) => {
    if (item.tripProvidedItemId === itemId || item.sku === itemId) {
      const existing = item.assignedAssets || [];
      const existingCodes = new Set(existing.map((a) => (a.assetCode || '').toUpperCase()));
      const toAdd = assetCodes
        .filter((c) => !existingCodes.has(c.toUpperCase()))
        .map((code, idx) => ({
          assignmentId: `asg-${Date.now()}-${idx}`,
          assetCode: code,
          status: 'Reserved',
        }));
      const nextAssigned = [...existing, ...toAdd];
      const assignedCount = nextAssigned.length;
      const missingCount = Math.max(0, (item.requiredQuantity || 1) - assignedCount);
      return {
        ...item,
        assignedAssets: nextAssigned,
        assignedCount,
        missingCount,
        status: missingCount === 0 ? 'Ready' : 'Draft',
      };
    }
    return item;
  });

  const updatedTrip = {
    ...trip,
    items: nextItems,
    hasShortage: nextItems.some((i) => (i.missingCount || 0) > 0),
  };
  safeSet(`trip_${targetId}`, updatedTrip);
  return { data: updatedTrip, message: `Đã gán thành công ${assetCodes.length} thiết bị vào chuyến đi` };
}

export function unassignPersistentTripAsset(tripId, assignmentId) {
  const targetId = tripId || MOCK_TRIPS[0].tripId;
  const trip = getPersistentTrip(targetId).data;

  let unassignedCode = '';
  const nextItems = (trip.items || []).map((item) => {
    if (item.assignedAssets?.some((a) => a.assignmentId === assignmentId)) {
      const removed = item.assignedAssets.find((a) => a.assignmentId === assignmentId);
      if (removed) unassignedCode = removed.assetCode;
      const nextAssigned = item.assignedAssets.filter((a) => a.assignmentId !== assignmentId);
      const assignedCount = nextAssigned.length;
      const missingCount = Math.max(0, (item.requiredQuantity || 1) - assignedCount);
      return {
        ...item,
        assignedAssets: nextAssigned,
        assignedCount,
        missingCount,
        status: missingCount === 0 ? 'Ready' : 'Draft',
      };
    }
    return item;
  });

  const updatedTrip = {
    ...trip,
    items: nextItems,
    hasShortage: nextItems.some((i) => (i.missingCount || 0) > 0),
  };
  safeSet(`trip_${targetId}`, updatedTrip);
  return { data: updatedTrip, message: `Đã hủy gán thiết bị ${unassignedCode || ''} khỏi chuyến đi!` };
}

export function issuePersistentTripGear(tripId) {
  const targetId = tripId || MOCK_TRIPS[0].tripId;
  const trip = getPersistentTrip(targetId).data;
  const nextItems = (trip.items || []).map((item) => ({
    ...item,
    status: 'Issued',
    assignedAssets: (item.assignedAssets || []).map((a) => ({ ...a, status: 'Issued' })),
  }));
  const updatedTrip = {
    ...trip,
    status: 'Issued',
    items: nextItems,
  };
  safeSet(`trip_${targetId}`, updatedTrip);
  return { data: updatedTrip, message: 'Xuất kho bàn giao toàn bộ thiết bị cho Hướng dẫn viên thành công!' };
}

export function returnPersistentTripGear(tripId) {
  const targetId = tripId || MOCK_TRIPS[0].tripId;
  const trip = getPersistentTrip(targetId).data;
  const nextItems = (trip.items || []).map((item) => ({
    ...item,
    status: 'Returned',
    assignedAssets: (item.assignedAssets || []).map((a) => ({ ...a, status: 'Returned' })),
  }));
  const updatedTrip = {
    ...trip,
    status: 'Returned',
    items: nextItems,
  };
  safeSet(`trip_${targetId}`, updatedTrip);
  return { data: updatedTrip, message: 'Thu hồi thiết bị từ chuyến đi thành công!' };
}



