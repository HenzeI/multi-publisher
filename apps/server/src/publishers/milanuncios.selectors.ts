export const milanunciosSelectors = {
  categorySearchInput: [
    'input[type="text"][placeholder*="Móvil" i]',
    'input[type="text"][placeholder*="PlayStation" i]',
    'input[type="text"][placeholder*="Sofá" i]',
    'input[type="text"][placeholder*="publicar" i]',
    'input[type="text"]',
  ],

  categorySuggestionItems: [
    '[role="option"]',
    'li',
    'button',
    'a',
  ],

  categoryClickableContainers: [
    'button',
    'a',
    'li',
    '[role="button"]',
    '[role="option"]',
    'div',
    'span',
  ],

  title: [
    'input[name="title"]',
    'input[id*="title"]',
    'input[placeholder*="título" i]',
    'input[placeholder*="titulo" i]',
    'input[aria-label*="título" i]',
    'input[aria-label*="titulo" i]',
  ],

  description: [
    'textarea[name="description"]',
    'textarea[id*="description"]',
    'textarea[placeholder*="descripción" i]',
    'textarea[placeholder*="descripcion" i]',
    'textarea[aria-label*="descripción" i]',
    'textarea[aria-label*="descripcion" i]',
    'textarea',
  ],

  price: [
    'input[name="price"]',
    'input[id*="price"]',
    'input[inputmode="decimal"]',
    'input[type="number"]',
  ],

  imageInput: ['input[type="file"]'],

  loginIndicators: [
    'a[href*="login"]',
    'button:has-text("Iniciar sesión")',
    'button:has-text("Acceder")',
  ],

  categoryIndicators: [
    'input[type="text"][placeholder*="Móvil" i]',
    'input[type="text"][placeholder*="PlayStation" i]',
    'input[type="text"][placeholder*="Sofá" i]',
    'text=Elige la categoría de tu anuncio',
    'text=Dinos que quieres publicar',
  ],
};