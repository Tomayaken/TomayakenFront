
export type Shelter = {
  id: number;
  name: string;
  currentCount: number;
  predictedCount: number;
  capacity: number;
};

export type Supply = {
  id: number;
  shelterName: string;
  itemName: string;
  stock: number;
  required: number;
  unit: string;
};

// 避難所データ
export const shelters: Shelter[] = [
  {
    id: 1,
    name: "避難所A",
    currentCount: 100,
    predictedCount: 40,
    capacity: 200,
  },
  {
    id: 2,
    name: "避難所B",
    currentCount: 95,
    predictedCount: 30,
    capacity: 100,
  },
  {
    id: 3,
    name: "避難所C",
    currentCount: 50,
    predictedCount: 15,
    capacity: 150,
  },
];

// 物資データ
export const supplies: Supply[] = [
  {
    id: 1,
    shelterName: "避難所A",
    itemName: "食料",
    stock: 120,
    required: 150,
    unit: "食",
  },
  {
    id: 2,
    shelterName: "避難所B",
    itemName: "飲料水",
    stock: 100,
    required: 180,
    unit: "本",
  },
  {
    id: 3,
    shelterName: "避難所C",
    itemName: "毛布",
    stock: 40,
    required: 60,
    unit: "枚",
  },
];

// 移動中避難者数（仮データ）
export const movingEvacuees = 100;

// ダッシュボードの集計データ
export const dashboardData = [
  {
    label: "総避難所数",
    value: shelters.length,
    unit: "か所",
  },
  {
    label: "総避難者数",
    value: shelters.reduce(
      (sum, shelter) => sum + shelter.currentCount,
      0
    ),
    unit: "人",
  },
  {
    label: "移動中避難者数",
    value: movingEvacuees,
    unit: "人",
  },
  {
    label: "到着見込み人数",
    value: shelters.reduce(
      (sum, shelter) => sum + shelter.predictedCount,
      0
    ),
    unit: "人",
  },
  {
    label: "物資不足数",
    value: supplies.filter(
      (supply) => supply.stock < supply.required
    ).length,
    unit: "件",
  },
];
