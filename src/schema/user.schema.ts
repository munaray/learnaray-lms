import mongoose, { Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../utils/types";

const passwordRegexPattern: RegExp =
	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema: Schema<User> = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter your name"],
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
			validate: {
				validator: (value: string) => {
					return emailRegexPattern.test(value);
				},
				message: "Please enter a valid email",
			},
			unique: true,
		},
		password: {
			type: String,
			select: false,
			required: [true, "Please enter your password"],
			validate: {
				validator: (value: string) => {
					return passwordRegexPattern.test(value);
				},
				message:
					"password must have minimum of 8 character, at least one uppercase, at least one lowercase, at least one digit, at least one special character",
			},
		},
		avatar: {
			public_id: String,
			default: "user",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		courses: [
			{
				courseId: String,
			},
		],
	},
	{ timestamps: true }
);

// Hash Password before saving
const saltRounds = 10;

UserSchema.pre<User>("save", function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = bcrypt.genSaltSync(saltRounds);
		this.password = bcrypt.hashSync(this.password, salt);
		next();
	} catch (error: any) {
		next(error);
	}
});

// Compare plain password with hashed password
UserSchema.methods.comparePassword = function (
	plain: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		try {
			const isMatch = bcrypt.compareSync(plain, this.password);
			resolve(isMatch);
		} catch (error) {
			reject(error);
		}
	});
};

const User: Model<User> = mongoose.model("User", UserSchema);

export default User;
