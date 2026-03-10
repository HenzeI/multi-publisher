import { z } from "zod";

export const portalKeySchema = z.enum(["milanuncios", "wallapop"]);

export const conditionValueSchema = z.enum([
  "new",
  "like_new",
  "good",
  "fair",
  "used",
]);

export const listingDraftSchema = z
  .object({
    id: z.string().optional(),

    title: z.string().trim().min(1, "El título es obligatorio."),
    description: z.string().trim().min(1, "La descripción es obligatoria."),
    price: z.number().nonnegative("El precio no puede ser negativo.").optional(),
    category: z.string().trim().optional(),
    subcategory: z.string().optional(),
    condition: conditionValueSchema.optional(),
    location: z.string().trim().optional(),
    images: z.array(z.string().min(1)).default([]),

    attributes: z.record(z.string(), z.unknown()).default({}),
    portalSettings: z
      .record(portalKeySchema, z.record(z.string(), z.unknown()))
      .default(() => ({ milanuncios: {}, wallapop: {} })),

    selectedPortals: z.array(portalKeySchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.price == null) {
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "El precio es obligatorio.",
      });
    }

    if (!data.category || data.category.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "La categoría es obligatoria.",
      });
    }

    if (!data.condition) {
      ctx.addIssue({
        code: "custom",
        path: ["condition"],
        message: "El estado es obligatorio.",
      });
    }

    if (!data.location || data.location.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "La ubicación es obligatoria.",
      });
    }

    if (data.images.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Debes seleccionar al menos una imagen.",
      });
    }

    if (data.selectedPortals.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["selectedPortals"],
        message: "Debes seleccionar al menos un portal.",
      });
    }
  });

export type ListingDraftInput = z.infer<typeof listingDraftSchema>;