export const milanunciosSelectors = {
  title: [
    'input[name="title"]',
    'input[id*="title"]',
    'input[placeholder*="título" i]',
    'input[placeholder*="titulo" i]',
    'input[aria-label*="título" i]',
    'input[aria-label*="titulo" i]',
    'input[type="text"]',
  ],

  description: [
    'textarea[name="description"]',
    'textarea[id*="description"]',
    'textarea[placeholder*="descripción" i]',
    'textarea[placeholder*="descripcion" i]',
    'textarea',
  ],

  price: [
    'input[name="price"]',
    'input[id*="price"]',
    'input[inputmode="decimal"]',
    'input[type="number"]',
  ],

  imageInput: [
    'input[type="file"]',
  ],

  submitButtons: [
    'button[type="submit"]',
    'button:has-text("Publicar")',
    'button:has-text("Continuar")',
  ],
};