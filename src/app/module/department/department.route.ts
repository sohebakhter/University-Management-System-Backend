import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { DepartmentController } from "./department.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
    CreateDepartmentZodSchema,
    UpdateDepartmentZodSchema,
} from "./department.validation";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    validateRequest(CreateDepartmentZodSchema),
    DepartmentController.createDepartment
);

router.get(
    "/",
    DepartmentController.getAllDepartments
);

router.get(
    "/:departmentId",
    DepartmentController.getSingleDepartment
);

router.patch(
    "/:departmentId",
    auth(UserRole.ADMIN),
    validateRequest(UpdateDepartmentZodSchema),
    DepartmentController.updateDepartment
);

router.delete(
    "/:departmentId",
    auth(UserRole.ADMIN),
    DepartmentController.deleteDepartment
);

export const DepartmentRoutes = router