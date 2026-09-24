import bcrypt from "bcryptjs";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import {
    AuthProvider,
    UserRole,
    UserStatus,
} from "../../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
    IForgotPassworddPayload,
    IGoogleLoginPayload,
    ILoginUserPayload,
    IRegisterUserPayload,
    IRequestUser,
    IResetPassworddPayload,
    IVerifyEmailPayload,
} from "./auth.interface";
import path from "path";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import ejs from "ejs"
import { TokenPayload } from "google-auth-library";
import { googleClient } from "../../lib/googleAuth";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, password, role } = payload;

    const email = payload.email.trim().toLowerCase();

    const isUserExists = await prisma.user.findUnique({
        where: { email },
    });

    if (isUserExists) {
        throw new AppError(
            httpStatus.CONFLICT,
            "User with this email already exists",
        );
    }

    const hashedPassword = await bcrypt.hash(
        password,
        Number(config.bcrypt_salt_rounds),
    );

    const otpKey = `user-registration-otp:${email}`;
    const otpValue = await crypto.randomInt(100000, 1000000);
    await redisClient.set(otpKey, otpValue, {
        expiration: {
            type: "EX",
            value: 5 * 60,
        },
    });

    const userRegistrationKey = `user-registration-data:${email}`;
    const userRegistrationPayload = {
        name,
        email,
        password: hashedPassword,
        role,
    };
    await redisClient.set(
        userRegistrationKey,
        JSON.stringify(userRegistrationPayload),
        {
            expiration: {
                type: "EX",
                value: 5 * 60,
            },
        },
    );

    const templatePath = path.join(
        process.cwd(),
        "src/app/templates/user-registration-otp.ejs",
    );
    const templateData = {
        name,
        email,
        otp: otpValue,
        expirationTime: "5 minutes",
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.smtp_user,
        to: email,
        subject: "Email Verification - OTP",
        html,
    });
};

const verifyUserEmail = async (payload: IVerifyEmailPayload) => {
    const { otp } = payload;
    const email = payload.email.trim().toLowerCase();
    const isUserExits = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (isUserExits?.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Suspended");
    }
    if (isUserExits?.emailVerified) {
        throw new AppError(
            httpStatus.CONFLICT,
            "User is Already Verified, Please Login",
        );
    }
    if (isUserExits?.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Deleted!");
    }

    const otpKey = `user-registration-otp:${email}`;
    const redisOtp = await redisClient.get(otpKey);

    if (!otp) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP ");
    }

    if (redisOtp !== otp) {
        throw new AppError(httpStatus.BAD_REQUEST, "OTP Dosen't Matched!");
    }
    await redisClient.del(otpKey);

    const userRegistrationKey = `user-registration-data:${email}`;
    const redisPatientData = await redisClient.get(userRegistrationKey);
    if (!redisPatientData) {
        throw new AppError(httpStatus.NOT_FOUND, "Users Data Doesn't Exist");
    }
    const userPayload: IRegisterUserPayload = JSON.parse(redisPatientData);

    const createdUser = await prisma.user.create({
        data: {
            name: userPayload.name,
            email: userPayload.email,
            password: userPayload.password,
            role: userPayload.role,
            status: UserStatus.ACTIVE,
            emailVerified: true,

            ...(userPayload.role === UserRole.STUDENT && {
                student: {
                    create: {
                        name: userPayload.name,
                        email: userPayload.email,
                    },
                },
            }),

            ...(userPayload.role === UserRole.INSTRUCTOR && {
                instructor: {
                    create: {
                        name: userPayload.name,
                        email: userPayload.email,
                    },
                },
            }),
        },

        omit: {
            password: true,
        },

    });
    await redisClient.del(userRegistrationKey);

    const templatePath = path.join(
        process.cwd(),
        "src/app/templates/user-welcome-email.ejs",
    );
    const templateData = {
        name: createdUser.name,
    };

    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
        from: config.smtp_user,
        to: createdUser.email,
        subject: "Welcome to University Management System",
        html,
    });

    const { ...user } = createdUser;
    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        user,
        accessToken,
        refreshToken,
    };
};

const loginUser = async (payload: ILoginUserPayload) => {
    const { password } = payload;
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Suspended");
    }

    if (user.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
    }

    if (user.password === null && user.googleId !== null) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "User Already Has Google Account, Please Login With Google Account",
        );
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password as string,
    );

    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken,
    };
};

const getMe = async (user: IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            ...(user.role === UserRole.STUDENT && {
                student: true,
            }),

            ...(user.role === UserRole.INSTRUCTOR && {
                instructor: true,
            }),
        },
        omit: {
            password: true,
        },
    });

    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    return isUserExists;
};

const refreshToken = async (token: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(
        token,
        config.jwt_refresh_secret,
    );

    if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            config.node_env === "development"
                ? verifiedRefreshToken.error
                : "Invalid refresh token",
        );
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
    });

    if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "User is inactive or not found",
        );
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken,
    };
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
    let googleIdTokenPayload: TokenPayload | null | undefined = null;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: payload.idToken,
            audience: config.google_client_id,
        });

        googleIdTokenPayload = ticket.getPayload();
    } catch (error) {
        console.log("Google ID Token Verification Failed", error);
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Invalid or Expired Google ID Token",
        );
    }

    if (!googleIdTokenPayload)
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            "Invalid or Expired Google ID Token",
        );
    if (!googleIdTokenPayload.email)
        throw new AppError(httpStatus.BAD_REQUEST, "Google Email not found");
    if (!googleIdTokenPayload.name)
        throw new AppError(httpStatus.BAD_REQUEST, "Google Name not found");

    const isUserExistsWithGoogleAuth = await prisma.user.findUnique({
        where: {
            email: googleIdTokenPayload.email,
            googleId: googleIdTokenPayload.sub,
        },
    });

    let user = isUserExistsWithGoogleAuth;

    if (!isUserExistsWithGoogleAuth) {
        const isUserExistsWithCredentials = await prisma.user.findUnique({
            where: {
                email: googleIdTokenPayload.email,
                authProvider: AuthProvider.CREDENTIAL,
            },
        });

        if (isUserExistsWithCredentials) {
            if (!isUserExistsWithCredentials.emailVerified) {
                throw new AppError(httpStatus.UNAUTHORIZED, "Email not verified");
            }

            if (isUserExistsWithCredentials.status === UserStatus.SUSPENDED) {
                throw new AppError(httpStatus.FORBIDDEN, "User is Suspened");
            }
            if (
                isUserExistsWithCredentials.isDeleted
            ) {
                throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
            }

            user = await prisma.user.update({
                where: {
                    id: isUserExistsWithCredentials.id,
                },

                data: {
                    googleId: googleIdTokenPayload.sub,
                },
            });
        } else {
            user = await prisma.user.create({
                data: {
                    name: googleIdTokenPayload.name,
                    email: googleIdTokenPayload.email,
                    role: UserRole.STUDENT,
                    googleId: googleIdTokenPayload.sub,
                    authProvider: AuthProvider.GOOGLE,
                    emailVerified: true,
                    patient: {
                        create: {
                            name: googleIdTokenPayload.name,
                            email: googleIdTokenPayload.email,
                        },
                    },
                },
            });

            const templatePath = path.join(
                process.cwd(),
                "src/app/templates/user-welcome-email.ejs",
            );
            const templateData = {
                name: user.name,
            };

            const html = await ejs.renderFile(templatePath, templateData);

            await transporter.sendMail({
                from: config.smtp_user,
                to: user.email,
                subject: "Welcome to the University",
                html,
            });
        }
    }

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Suspened");
    }
    if (user.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is deleted");
    }

    const jwtPayload = {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in as SignOptions,
    );

    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret,
        config.jwt_refresh_expires_in as SignOptions,
    );

    return {
        accessToken,
        refreshToken,
    };
};

const forgotPassword = async (payload: IForgotPassworddPayload) => {
    const { email } = payload;

    const isUserExits = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!isUserExits) {
        throw new AppError(httpStatus.NOT_FOUND, "User Dosen't Exits ");
    }

    if (isUserExits.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is SUSPENDED");
    }
    if (!isUserExits.emailVerified) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is unverified");
    }

    if (isUserExits.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Deleted!");
    }
    if (isUserExits.googleId && isUserExits.authProvider === "GOOGLE") {
        throw new AppError(httpStatus.CONFLICT, "User has account with Google");
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const key = `forgot-password-otp:${isUserExits.email}`;

    await redisClient.set(key, otp, {
        expiration: {
            type: "EX",
            value: 5 * 60,
        },
    });

    const templatePath = path.join(
        process.cwd(),
        "src/app/templates/forgot-password.ejs",
    );
    const html = await ejs.renderFile(templatePath, {
        name: isUserExits.name,
        otp,
        expirationTime: "5 minutes",
    });
    await transporter.sendMail({
        from: config.smtp_user,
        to: isUserExits.email,
        subject: "Forgot Password - OTP",
        html,
    });
};
const resetPassword = async (payload: IResetPassworddPayload) => {
    const { email, otp, newPassword } = payload;

    const isUserExits = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!isUserExits) {
        throw new AppError(httpStatus.NOT_FOUND, "User Dosen't Exits ");
    }

    if (isUserExits.status === UserStatus.SUSPENDED) {
        throw new AppError(httpStatus.FORBIDDEN, "User is SUSPENDED");
    }
    if (!isUserExits.emailVerified) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is unverified");
    }

    if (isUserExits.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "User is Deleted!");
    }
    if (isUserExits.googleId && isUserExits.authProvider === "GOOGLE") {
        throw new AppError(httpStatus.CONFLICT, "User has account with Google");
    }

    if (!otp) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid Otp");
    }
    const key = `forgot-password-otp:${isUserExits.email}`;
    const redisOtp = await redisClient.get(key);

    if (redisOtp !== otp) {
        throw new AppError(httpStatus.BAD_REQUEST, "Otp not matched!");
    }

    const hashedNewPassword = await bcrypt.hash(
        newPassword,
        Number(config.bcrypt_salt_rounds),
    );

    await prisma.user.update({
        where: {
            email: isUserExits.email,
        },
        data: {
            password: hashedNewPassword,
        },
    });

    await redisClient.del(key);

    const templatePath = path.join(
        process.cwd(),
        "src/app/templates/reset-password-success.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
        name: isUserExits.name,
    });

    await transporter.sendMail({
        from: config.smtp_user,
        to: isUserExits.email,
        subject: "Password Reset Successful",
        html,
    });
};


export const AuthService = {
    registerUser,
    verifyUserEmail,
    loginUser,
    getMe,
    refreshToken,
    googleLogin,
    forgotPassword,
    resetPassword
};
