export function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err)

  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: err.expose ? err.message : 'Erreur interne du serveur',
  })
}
