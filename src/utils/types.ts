import { Document } from "mongoose";

/* USER TYPES */
export interface UserTypes extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (plain: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

export interface RegistrationDataTypes {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  avatar?: string;
}

export interface NewUserTypes {
  user: UserTypes;
  activationCode: string;
}

export interface ActivationPayloadTypes {
  user: UserTypes;
  activationCode: string;
}

export interface ActivationTokenTypes {
  token: string;
  activationCode: string;
}

export interface ActivationRequestTypes {
  userActivationToken: string;
  userActivationCode: string;
}

export interface EmailOptionTypes {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export interface LoginRequestTypes {
  email: string;
  password: string;
}

export interface TokenOptionTypes {
  maxAge: number;
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
}

export interface SocialAuthBodyTypes {
  email: string;
  name: string;
  avatar: string;
}

export interface UpdateUserInfoTypes {
  name?: string;
  email?: string;
}

export interface UpdatePasswordTypes {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfilePictureTypes {
  avatar: string;
}

/* COURSE TYPES */

export interface CommentTypes extends Document {
  user: UserTypes;
  question: string;
  questionReplies: CommentTypes[];
}

export interface ReviewTypes extends Document {
  user?: UserTypes;
  rating?: number;
  comment: string;
  commentReplies?: ReviewTypes[];
}

export interface LinkTypes extends Document {
  title: string;
  url: string;
}

export interface CourseDataTypes extends Document {
  title: string;
  description: string;
  videoUrl: string;
  videoThumbnail: object;
  videoSection: string;
  videoLength: number;
  videoPlayer: string;
  links: LinkTypes[];
  suggestion: string;
  questions: CommentTypes[];
}

export interface CourseTypes extends Document {
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: object;
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: ReviewTypes[];
  courseData: CourseDataTypes[];
  ratings?: number;
  purchased: number;
}

export interface AddReviewDataTypes {
  review: string;
  rating: number;
  userId: string;
  comment: string;
  courseId: string;
  reviewId: string;
}

export interface AddQuestionDataTypes {
  question: string;
  courseId: string;
  contentId: string;
}

export interface AddAnswerDataTypes {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

/* ORDERS TYPES */
export interface OrderTypes extends Document {
  courseId: string;
  userId?: string;
  payment_info: object;
}

/* NOTIFICATION TYPES */
export interface NotificationOptionTypes extends Document {
  title: string;
  message: string;
  status: string;
  userId: string;
}

/* LAYOUT TYPES */

export interface FaqItemTypes extends Document {
  question: string;
  answer: string;
}

export interface CategoryTypes extends Document {
  title: string;
}

export interface BannerImageTypes extends Document {
  public_id: string;
  url: string;
}

export interface LayoutTypes extends Document {
  type: string;
  faq: FaqItemTypes[];
  categories: CategoryTypes[];
  banner: {
    image: BannerImageTypes;
    title: string;
    subTitle: string;
  };
}
