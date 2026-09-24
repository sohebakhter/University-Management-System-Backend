import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { DepartmentController } from "./department.controller";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
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
    DepartmentController.updateDepartment
);

router.delete(
    "/:departmentId",
    auth(UserRole.ADMIN),
    DepartmentController.deleteDepartment
);

export const DepartmentRoutes = router