import { Schema, model } from "mongoose";
import {
  BannerImageTypes,
  CategoryTypes,
  FaqItemTypes,
  LayoutTypes,
} from "@/utils/types";

const faqSchema = new Schema<FaqItemTypes>({
  question: { type: String },
  answer: { type: String },
});

const categorySchema = new Schema<CategoryTypes>({
  title: { type: String },
});

const bannerImageSchema = new Schema<BannerImageTypes>({
  public_id: { type: String },
  url: { type: String },
});

const layoutSchema = new Schema<LayoutTypes>({
  type: { type: String },
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerImageSchema,
    title: { type: String },
    subTitle: { type: String },
  },
});

const LayoutModel = model<LayoutTypes>("Layout", layoutSchema);

export default LayoutModel;
