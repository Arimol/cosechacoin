/**
 * Respuestas JSON uniformes para la API.
 */
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data,
    error: null,
  });
}

export function sendError(res, error, status = 500) {
  const message =
    error?.message || (typeof error === "string" ? error : "Error desconocido");
  return res.status(status).json({
    success: false,
    data: null,
    error: message,
  });
}
