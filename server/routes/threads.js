import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

// GET /api/threads?search=<term>&sort=<newest|oldest>
// Filtering and ordering are performed by PostgreSQL through Prisma,
// rather than loading every row and processing an in-memory array.
router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    const where = search
      ? {
          title: {
            contains: String(search),
            mode: "insensitive",
          },
        }
      : {};

    const orderBy = {
      createdAt: sort === "oldest" ? "asc" : "desc",
    };

    const threads = await prisma.thread.findMany({
      where,
      orderBy,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    res.json({ threads });
  } catch (error) {
    next(error);
  }
});

export default router;
