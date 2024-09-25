import { Request, Response, NextFunction } from "express-serve-static-core";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/asyncError";
import Layout from "../schemas/layout.schema";
import cloudinary from "cloudinary";
import { LayoutTypes } from "../utils/types";

// create layout
export const createLayout = CatchAsyncError(
  async (
    request: Request<{}, {}, LayoutTypes>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { type, banner } = request.body;
      const isTypeExist = await Layout.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exist`, 400));
      }
      if (type === "Banner") {
        const { image, title, subTitle } = banner;
        const myCloud = await cloudinary.v2.uploader.upload(
          image as unknown as string,
          {
            folder: "layout",
          }
        );
        const bannerData = {
          type: "Banner",
          banner: {
            image: {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            },
            title,
            subTitle,
          },
        };
        await Layout.create(bannerData);
      }
      if (type === "FAQ") {
        const { faq } = request.body;
        const faqItems = await Promise.all(
          faq.map(async (item) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await Layout.create({ type: "FAQ", faq: faqItems });
      }
      if (type === "Categories") {
        const { categories } = request.body;
        const categoriesItems = await Promise.all(
          categories.map(async (item) => {
            return {
              title: item.title,
            };
          })
        );
        await Layout.create({
          type: "Categories",
          categories: categoriesItems,
        });
      }

      response.status(201).send({
        success: true,
        message: "Layout created successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout
export const editLayout = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { type } = request.body;
      if (type === "Banner") {
        const bannerData: any = await Layout.findOne({ type: "Banner" });

        const { image, title, subTitle } = request.body;

        const data = image.startsWith("https")
          ? bannerData
          : await cloudinary.v2.uploader.upload(image, {
              folder: "layout",
            });

        const banner = {
          type: "Banner",
          image: {
            public_id: image.startsWith("https")
              ? bannerData.banner.image.public_id
              : data?.public_id,
            url: image.startsWith("https")
              ? bannerData.banner.image.url
              : data?.secure_url,
          },
          title,
          subTitle,
        };

        await Layout.findByIdAndUpdate(bannerData._id, { banner });
      }

      if (type === "FAQ") {
        const { faq } = request.body;
        const FaqItem = await Layout.findOne({ type: "FAQ" });
        const faqItems = await Promise.all(
          faq.map(async (item: any) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await Layout.findByIdAndUpdate(FaqItem?._id, {
          type: "FAQ",
          faq: faqItems,
        });
      }
      if (type === "Categories") {
        const { categories } = request.body;
        const categoriesData = await Layout.findOne({
          type: "Categories",
        });
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await Layout.findByIdAndUpdate(categoriesData?._id, {
          type: "Categories",
          categories: categoriesItems,
        });
      }

      response.status(200).json({
        success: true,
        message: "Layout Updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get layout by type
export const getLayoutByType = CatchAsyncError(
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { type } = request.params;
      const layout = await Layout.findOne({ type });
      response.status(201).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
