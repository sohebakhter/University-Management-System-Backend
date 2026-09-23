/** biome-ignore-all assist/source/organizeImports: <explanation> */
import bcrypt from "bcryptjs";
import type { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import {
    UserRole,
    UserStatus,
} from "../../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import type {
    IRegisterUserPayload,
    IVerifyEmailPayload,
} from "./auth.interface";
import path from "path";
import httpStatus from "http-status";
import { AppError } from "../../utils/appError";
import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import ejs from "ejs"

const registerPatient = async (payload: IRegisterUserPayload) => {
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


export const AuthService = {
    registerPatient,
    verifyUserEmail,
};
