export interface Question {
  id: string;
  category: string;
  text: string;
  options: string[];
  allowCustom: boolean;
}

export const questions: Question[] = [
  {
    id: "industry",
    category: "行业",
    text: "你在哪个行业工作？",
    options: ["互联网/科技", "金融", "教育", "医疗", "创意/设计", "自由职业"],
    allowCustom: true,
  },
  {
    id: "mbti",
    category: "性格",
    text: "你的 MBTI 是？",
    options: ["INTJ", "INFP", "ENFP", "ENTJ", "ISFJ", "ESTP", "不确定"],
    allowCustom: true,
  },
  {
    id: "dietary",
    category: "忌口",
    text: "有什么忌口吗？",
    options: ["无忌口", "不吃辣", "素食", "不吃海鲜", "清真", "低碳水"],
    allowCustom: true,
  },
  {
    id: "flavor",
    category: "口味",
    text: "最喜欢什么口味？",
    options: ["麻辣", "清淡", "甜口", "酸辣", "咸鲜", "什么都吃"],
    allowCustom: true,
  },
  {
    id: "vibe",
    category: "氛围",
    text: "约饭最看重什么氛围？",
    options: ["安静聊天", "热闹聚会", "精致仪式感", "随意自在", "户外野餐"],
    allowCustom: true,
  },
  {
    id: "budget",
    category: "预算",
    text: "人均预算大概多少？",
    options: ["50以内", "50-100", "100-200", "200-500", "500+", "看心情"],
    allowCustom: false,
  },
];
