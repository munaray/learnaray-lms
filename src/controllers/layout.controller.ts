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
        message: `${type} Layout Created Successfully`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Edit layout
export const editLayout = CatchAsyncError(
  async (
    request: Request<{}, {}, LayoutTypes>,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { type, banner } = request.body;
      if (type === "Banner") {
        const findBanner = await Layout.findOne({ type: "Banner" });

        const { image, title, subTitle } = banner;

        if (findBanner) {
          await cloudinary.v2.uploader.destroy(
            findBanner.banner.image.public_id
          );
        } else {
          return next(new ErrorHandler("Banner does not exist", 404));
        }

        const myCloud = await cloudinary.v2.uploader.upload(
          image as unknown as string,
          {
            folder: "layout",
          }
        );

        const bannerData = {
          type: "Banner",
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };

        await Layout.findByIdAndUpdate(findBanner.id, { bannerData });
      }

      if (type === "FAQ") {
        const { faq } = request.body;

        const FaqItem = await Layout.findOne({ type: "FAQ" });
        if (!FaqItem) {
          return next(new ErrorHandler("Faq Items does not exist", 404));
        }

        const faqItems = await Promise.all(
          faq.map(async (item) => {
            return {
              question: item.question,
              answer: item.answer,
            };
          })
        );
        await Layout.findByIdAndUpdate(FaqItem.id, {
          type: "FAQ",
          faq: faqItems,
        });
      }

      if (type === "Categories") {
        const { categories } = request.body;

        const categoriesData = await Layout.findOne({
          type: "Categories",
        });
        if (!categoriesData) {
          return next(new ErrorHandler("Category data does not exist", 404));
        }

        const categoriesItems = await Promise.all(
          categories.map(async (item) => {
            return {
              title: item.title,
            };
          })
        );
        await Layout.findByIdAndUpdate(categoriesData.id, {
          type: "Categories",
          categories: categoriesItems,
        });
      }

      response.status(201).send({
        success: true,
        message: `${type} Layout Updated successfully`,
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
      const { type } = request.body;
      const layout = await Layout.findOne({ type });
      response.status(200).send({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
