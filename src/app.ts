import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
    type Application,
    type Request,
    type Response,
} from "express";
import httpStatus from "http-status";
import config from "./app/config";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AuthRoutes } from "./app/module/auth/auth.route";
import { UserRoutes } from "./app/module/user/user.route";
import { DepartmentRoutes } from "./app/module/department/department.route";
import { CourseRoutes } from "./app/module/course/course.route";

const app: Application = express();

app.use(
    cors({
        origin: config.frontend_url,
        credentials: true,
    }),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", AuthRoutes)
app.use("/api/v1/user", UserRoutes)
app.use("/api/v1/department", DepartmentRoutes)
app.use("/api/v1/course", CourseRoutes)

// Basic route
app.get("/", async (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: "Welcome to University Management System",
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
