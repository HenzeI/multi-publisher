import { z } from "zod";

export const portalKeySchema = z.enum(["milanuncios", "wallapop"]);

export const conditionValueSchema = z.enum([
  "new",
  "like_new",
  "good",
  "fair",
  "used",
]);

const listingDraftBaseSchema = z.object({
  id: z.string().optional(),

  title: z.string().trim().default(""),
  description: z.string().trim().default(""),
  price: z.number().nonnegative("El precio no puede ser negativo.").optional(),
  category: z.string().trim().optional(),
  subcategory: z.string().default(""),
  condition: conditionValueSchema.optional(),
  location: z.string().trim().default(""),
  images: z.array(z.string().min(1)).default([]),

  attributes: z.record(z.string(), z.unknown()).default({}),
  portalSettings: z
    .record(portalKeySchema, z.record(z.string(), z.unknown()))
    .default(() => ({ milanuncios: {}, wallapop: {} })),

  selectedPortals: z.array(portalKeySchema).default([]),
});

export const listingDraftSaveSchema = listingDraftBaseSchema;

export const listingDraftPublishSchema = listingDraftBaseSchema.superRefine(
  (data, ctx) => {
    if (!data.title || data.title.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["title"],
        message: "El título es obligatorio.",
      });
    }

    if (!data.description || data.description.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message: "La descripción es obligatoria.",
      });
    }

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
  }
);

export type ListingDraftSaveInput = z.infer<typeof listingDraftSaveSchema>;
export type ListingDraftPublishInput = z.infer<typeof listingDraftPublishSchema>;