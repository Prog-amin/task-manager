import { AppError } from "../src/middleware/errorHandler";
import { TaskService } from "../src/modules/tasks/services/task.service";

jest.mock("../src/socket/io", () => ({
  getIo: () => ({
    emit: jest.fn(),
    to: () => ({ emit: jest.fn() }),
  }),
}));

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = jest.requireMock("../src/lib/prisma");

describe("TaskService", () => {
  test("create: throws 400 when assignee does not exist", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const repo = {
      create: jest.fn(),
      findVisibleById: jest.fn(),
      listVisible: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      dashboard: jest.fn(),
    } as any;

    const notifications = {
      create: jest.fn(),
    } as any;

    const service = new TaskService(repo, notifications);

    await expect(
      service.create("u1", {
        title: "t",
        description: "",
        dueDate: new Date().toISOString(),
        priority: "LOW",
        status: "TODO",
        assignedToId: "missing",
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      service.create("u1", {
        title: "t",
        description: "",
        dueDate: new Date().toISOString(),
        priority: "LOW",
        status: "TODO",
        assignedToId: "missing",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("update: only creator can change assignee", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u2" });

    const repo = {
      findVisibleById: jest.fn().mockResolvedValue({
        id: "t1",
        title: "Task",
        creatorId: "creator",
        assignedToId: "assignee",
      }),
      update: jest.fn(),
    } as any;

    const notifications = {
      create: jest.fn(),
    } as any;

    const service = new TaskService(repo, notifications);

    await expect(
      service.update("assignee", "t1", {
        assignedToId: "u2",
      } as any),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("update: creator changing assignee creates notification", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "u2" });

    const repo = {
      findVisibleById: jest.fn().mockResolvedValue({
        id: "t1",
        title: "Task",
        creatorId: "creator",
        assignedToId: null,
      }),
      update: jest.fn().mockResolvedValue({
        id: "t1",
        title: "Task",
        creatorId: "creator",
        assignedToId: "u2",
      }),
    } as any;

    const notifications = {
      create: jest
        .fn()
        .mockResolvedValue({ id: "n1", userId: "u2", taskId: "t1", type: "TASK_ASSIGNED" }),
    } as any;

    const service = new TaskService(repo, notifications);

    await service.update("creator", "t1", {
      assignedToId: "u2",
    } as any);

    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u2", taskId: "t1", type: "TASK_ASSIGNED" }),
    );
  });
});
